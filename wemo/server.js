var util = require('util');
var xml2js = require('xml2js');
var express = require('express');
var bodyparser = require('body-parser');
var os = require('os');
var EventEmitter = require('events').EventEmitter;

var WemoServer = module.exports = function() {
  EventEmitter.call(this);
  this.listen();
};
util.inherits(WemoServer, EventEmitter);

WemoServer.prototype.listen = function() {
  var self = this;
  var app = express();
  app.use(bodyparser.raw({type: 'text/xml'}));
  app.all('/:udn', function(req, res) {
    xml2js.parseString(req.body, function(err, json){
      if (err) {
        console.log(err);
      }
      if (json['e:propertyset']['e:property'][0]['StatusChange']) {
        xml2js.parseString(json['e:propertyset']['e:property'][0]['StatusChange'][0], function (err, xml) {
          if (!err && xml) {
            self.emit('StatusChange', {
              DeviceId: xml.StateEvent.DeviceID[0]._,
              CapabilityId: xml.StateEvent.CapabilityId[0],
              Value: xml.StateEvent.Value[0]
            });
          }
        });
      } else if (json['e:propertyset']['e:property'][0]['BinaryState']) {
        var binaryState = {
          UDN: req.params.udn,
          BinaryState: json['e:propertyset']['e:property'][0]['BinaryState'][0]
        }
        self.emit('BinaryState', binaryState);
      } else if (json['e:propertyset']['e:property'][0]['InsightParams']) {
        var params = json['e:propertyset']['e:property'][0]['InsightParams'][0].split('|');
        //console.log(params);
        var insightParams = {
          UDN: req.params.udn,
          BinaryState: params[0],
          ONSince: params[1],
          OnFor: params[2],
          TodayONTime: params[3],
          InstantPower: params[7]
        };
        self.emit('InsightParams', insightParams);
      } else {
        console.log('Unhandled Event (%s): %j', req.params.udn, json);
        console.log(json['e:propertyset']['e:property'][0]);
      }
    });
    res.sendStatus(200);
  });

  this._server = app.listen(0);
};

WemoServer.prototype.getCallbackURL = function() {
  var getLocalInterfaceAddress = function() {
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
          addresses.push(address.address);
        }
      }
    }
    return addresses.shift();
  };

  if (!this._callbackURL) {
    var port = this._server.address().port;
    var host = getLocalInterfaceAddress();
    this._callbackURL = 'http://' + host + ':' + port;
  }
  return this._callbackURL;
};
