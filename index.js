var Scout = require('zetta-scout');
var util = require('util');
var BridgeClient = require('./wemo-client/bridgeclient');
var WemoBulb = require('./bulb');

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
  this.bridges = {};
  this.search();
  setInterval(this.search.bind(this), 5000);
  next();
};

WemoScout.prototype.initDevice = function(type, Class, device, bridge) {
  var self = this;
  var query = this.server.where({ type: type, deviceId: device.deviceId });
  this.server.find(query, function(err, results){
    // TODO: Pass instance of WemoBridge to device
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
            var bridge = {
              ip: location.hostname,
              port: location.port
            };
            for (var key in json.root.device[0]) {
              bridge[key] = json.root.device[0][key][0];
            }
            if (!self.bridges[bridge.UDN]) {
              self.bridges[bridge.UDN] = new BridgeClient(bridge);
              self.bridges[bridge.UDN].getEndDevices(function(err, device){
                if (device) {
                  self.foundDevice(device, self.bridges[bridge.UDN]);
                }
              }.bind(self));
            }
          }
        });
      }
    });
  }

  var client = new SSDP();
  client.on('response', handleUDPResponse);
  client.search('urn:Belkin:service:bridge:1');
};

WemoScout.prototype.foundDevice = function(device, bridge) {
  // TODO: Distinguish devices by capabilities
  this.initDevice('wemo-bulb', WemoBulb, device, bridge);
};
