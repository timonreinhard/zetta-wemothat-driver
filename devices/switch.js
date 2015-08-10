var util = require('util');
var Device = require('zetta-device');

var WemoSwitch = module.exports = function(device, client) {
  this.name = device.friendlyName;
  this.state = 'off';
  this.UDN = device.UDN;
  this._client = client;
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

  this._client.on('binaryState', function(state){
    this.state = (state === '1') ? 'on' : 'off';
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
