var Device = require('zetta-device');

var util = require('util');

var WemoSwitch = module.exports = function(device, client, server) {
  this.name = device.friendlyName;
  this.state = 'off';
  this.UDN = device.UDN;
  this._client = client;
  this._server = server;
  Device.call(this);
};
util.inherits(WemoSwitch, Device);

WemoSwitch.prototype.init = function(config) {
  config
    .type('wemo-switch')
    .state(this.state)
    .name(this.name)
    .when('off', { allow: ['turn-on'] })
    .when('on', { allow: ['turn-off'] })
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff);

  this._server.on('BinaryState', function(event){
    if (event.UDN !== this.UDN) {
      return;
    }
    this.state = (event.BinaryState === '1') ? 'on' : 'off';
  }.bind(this));
};

WemoSwitch.prototype.turnOn = function(cb) {
  this._client.setBinaryState(1);
  this.state = 'on';
  cb();
};

WemoSwitch.prototype.turnOff = function(cb) {
  this._client.setBinaryState(0);
  this.state = 'off';
  cb();
};
