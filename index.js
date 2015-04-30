var Scout = require('zetta-scout');
var util = require('util');
//var Wemo = require('./wemo');
var WemoBulb = require('./wemo-bulb');


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
  this.search();
  setInterval(this.search.bind(this), 5000);
  next();
};

WemoScout.prototype.initDevice = function(type, Class, device) {
  var self = this;
  console.log(device);
  var query = this.server.where({ type: type, deviceID: device.deviceID });
  this.server.find(query, function(err, results){
    if (results.length > 0) {
      self.provision(results[0], Class, device);
    } else {
      self.discover(Class, device);
    }
  });
};

WemoScout.prototype.soapAction = function(device, path, action, body) {
  var header = ['<?xml version="1.0" encoding="utf-8"?>',
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">',
    '<s:Body>'
  ].join('\n');
  var footer = ['</s:Body>', '</s:Envelope>'].join('\n');

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

WemoScout.prototype.search = function() {
  var self = this;

  var handleUDPResponse = function(msg, statusCode, rinfo) {
    if (msg.ST === 'urn:Belkin:service:bridge:1') {
      request.get(msg.LOCATION, function(err, res, xml) {
        if (!err) {
          xml2js.parseString(xml, function(err, json) {
            if (!err) {
              var location = url.parse(msg.LOCATION);
              var device = {
                ip: location.hostname,
                port: location.port
              };
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
  if (device.modelName === 'Bridge') {

    this.getEndDevices(device);
  }
};

WemoScout.prototype.getEndDevices = function(bridge) {
  var self = this;

  var parseResponse = function(data) {
    xml2js.parseString(data, function(err, result) {
      if (!err) {
        //console.log("%j",result);
        var list = result["s:Envelope"]["s:Body"][0]["u:GetEndDevicesResponse"][0].DeviceLists[0];
        xml2js.parseString(list, function(err, result2) {
          if (!err) {
            var devinfo = result2.DeviceLists.DeviceList[0].DeviceInfos[0].DeviceInfo;
            if (devinfo) {
              for (var i = 0; i < devinfo.length; i++) {
                var device = {
                  brige: bridge,
                  friendlyName: devinfo[i].FriendlyName[0],
                  deviceID: devinfo[i].DeviceID[0],
                  currentState: devinfo[i].CurrentState[0]
                };
                //devList.push(light);
                //names[light.name] = light;+
                //console.log(device);
                self.initDevice('wemo-bulb', WemoBulb, device);
              }
            }
            var groupinfo = result2.DeviceLists.DeviceList[0].GroupInfos;
            if (groupinfo) {
              //group found
              //console.log('%j', groupinfo);
              console.log("Groups are currently nots supported");
            }
          } else {
            console.log(err);
            console.log(data);
          }
        });
      }
    });
  };

  var post = http.request({
    host: bridge.ip,
    port: bridge.port,
    path: '/upnp/control/bridge1',
    method: 'POST',
    headers: {
      SOAPACTION: '"urn:Belkin:service:bridge:1#GetEndDevices"',
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
      parseResponse(data);
    });
  });
  post.write('<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>');
  post.write('<u:GetEndDevices xmlns:u="urn:Belkin:service:bridge:1"><DevUDN>' + bridge.UDN + '</DevUDN><ReqListType>PAIRED_LIST</ReqListType></u:GetEndDevices>');
  post.write('</s:Body></s:Envelope>');
  post.end();
}
