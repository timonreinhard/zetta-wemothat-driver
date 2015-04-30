var Scout = require('zetta-scout');
var util = require('util');
var Wemo = require('./wemo');

var SSDP = require('node-ssdp').Client;
var request = require('request');
var xml2js = require('xml2js');
var url = require('url');
var http = require('http');
var util = require('util');

var WemoScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(WemoScout, Scout);

WemoScout.prototype.init = function(next) {

  var self = this;

  this.discover();

  var query = this.server.where({
    type: 'wemo'
  });
  var options = {
    default: 'DEFAULT'
  };

  this.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], Wemo, options);
    } else {
      self.discover(Wemo, options);
    }
  });

  next();

};

WemoScout.prototype.soapAction = function(device, path, action, body) {
  var header = ['<?xml version="1.0" encoding="utf-8"?>',
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">',
    '<s:Body>'].join('\n');
  var footer = ['</s:Body>','</s:Envelope>'].join('\n');

  var post = http.request({
    host: device.ip,
    port: device.port,
    path: path,
    method: 'POST',
    headers: {
      SOAPACTION: '"' + action + '"',
      'Content-Type': 'text/xml; charset="utf-8"',
      Accept: ''
    }
  }, function(res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      console.log(data);
    });
  });
  post.write(header);
  post.write(body);
  post.write(footer);
	post.end();
};

WemoScout.prototype.discover = function() {
  var self = this;

  var handleUDPResponse = function (msg, statusCode, rinfo) {
    if (msg.ST === 'urn:Belkin:service:bridge:1') {
      request.get(msg.LOCATION, function(err, res, xml) {
				if (!err) {
					xml2js.parseString(xml, function(err, json) {
						if (!err) {
              var location = url.parse(msg.LOCATION);
              var device = { ip: location.hostname, port: location.port };
							for (var key in json.root.device[0]) {
								device[key] = json.root.device[0][key][0];
							}
              self.foundDevice(device);
            }
          });
        }
      });
    }
  }

  var client = new SSDP();
  client.on('response', handleUDPResponse);
  client.search('ssdp:all');
};

WemoScout.prototype.foundDevice = function(device) {
  console.log('found device: ', device);
  this.soapAction(device, '/upnp/control/bridge1',
    'urn:Belkin:service:bridge:1#GetEndDevices',
    '<u:GetEndDevices xmlns:u="urn:Belkin:service:bridge:1"><DevUDN>' + device.UDN + '</DevUDN><ReqListType>PAIRED_LIST</ReqListType></u:GetEndDevices>'
  );
};
