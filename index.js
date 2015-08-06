var Scout = require('zetta-scout');
var util = require('util');
var SSDPClient = require('node-ssdp').Client;
var request = require('request');
var xml2js = require('xml2js');
var url = require('url');

var WemoClient = require('./wemo/client');
var WemoServer = require('./wemo/server');
var WemoBulb = require('./devices/bulb');
var WemoInsight = require('./devices/insight');
var WemoMotion = require('./devices/motion');

var WemoScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(WemoScout, Scout);

WemoScout.prototype.init = function(next) {
  this.clients = {};
  this.callbackServer = new WemoServer();
  this.search();
  setInterval(this.search.bind(this), 5000);
  next();
};

WemoScout.prototype.initDevice = function(type, Class, device, bridge) {
  var self = this;
  var query = this.server.where({ type: type, UDN: device.UDN });
  this.server.find(query, function(err, results){
    if (results && results.length > 0) {
      self.provision(results[0], Class, device, bridge, self.callbackServer);
    } else {
      self.discover(Class, device, bridge, self.callbackServer);
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
              host: location.hostname,
              port: location.port,
              callbackURL: self.callbackServer.getCallbackURL()
            };
            for (var key in json.root.device[0]) {
              device[key] = json.root.device[0][key][0];
            }
            self.foundDevice(device);
          }
        });
      }
    });
  };

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
      client.subscribe('urn:Belkin:service:bridge:1');
      break;
    case 'urn:Belkin:device:insight:1':
      this.initDevice('wemo-insight', WemoInsight, device, client);
      client.subscribe('urn:Belkin:service:insight:1');
      client.subscribe('urn:Belkin:service:basicevent:1');
      break;
    case 'urn:Belkin:device:sensor:1':
      this.initDevice('wemo-motion', WemoMotion, device, client);
      client.subscribe('urn:Belkin:service:basicevent:1');
      break;
    default:
      this.server.info('Found unsupported Wemo device: ' + device.deviceType, device);
  }
};
