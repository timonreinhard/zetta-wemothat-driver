var Scout = require('zetta-scout');
var util = require('util');
var SSDPClient = require('node-ssdp').Client;
var request = require('request');
var xml2js = require('xml2js');
var url = require('url');

var WemoClient = require('./wemo_client');
var WemoBulb = require('./bulb');

var WemoScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(WemoScout, Scout);

WemoScout.prototype.init = function(next) {
  this.clients = {};
  this.search();
  setInterval(this.search.bind(this), 5000);
  next();
};

WemoScout.prototype.initDevice = function(type, Class, device, bridge) {
  var self = this;
  var query = this.server.where({ type: type, deviceId: device.deviceId });
  this.server.find(query, function(err, results){
    if (results.length > 0) {
      self.provision(results[0], Class, device, bridge);
    } else {
      self.discover(Class, device, bridge);
    }
  });
};

WemoScout.prototype.search = function() {
  var self = this;

  var handleUDPResponse = function(msg, statusCode, rinfo) {
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

  var ssdpClient = new SSDPClient();
  ssdpClient.on('response', handleUDPResponse);
  ssdpClient.search('urn:Belkin:service:basicevent:1');
};

WemoScout.prototype.foundDevice = function(device) {
  if (this.clients[device.UDN]) {
    // device has already been initialized
    return;
  }

  var client = this.clients[device.UDN] = new WemoClient(device);
  switch (device.deviceType) {
    case 'urn:Belkin:device:bridge:1':
      client.getEndDevices(function(err, device){
        if (!err) {
          this.initDevice('wemo-bulb', WemoBulb, device, client);
        }
      }.bind(this));
      break;
    default:
      this.server.info('Found unsupported Wemo device: ' + device.deviceType, device);
      return;
  }
  client.init();
};
