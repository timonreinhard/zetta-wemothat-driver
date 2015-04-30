var Device = require('zetta-device');
var util = require('util');

var WemoBulb = module.exports = function(device) {
  this.name = device.friendlyName;
  this.state = device.currentState;
  this.bridge = device.bridge;
  this.deviceID = device.deviceID;
  Device.call(this);
};
util.inherits(WemoBulb, Device);

WemoBulb.prototype.init = function(config) {
  config
    .type('wemo-bulb')
    .state(this.state)
    .name(this.name)
    .when('waiting', { allow: ['do']})
    .when('doing', { allow: [] })
    .map('do', this.do, [
      { name: 'message', type: 'text'}
    ]);
};

WemoBulb.prototype.do = function(message, cb) {
  this.state = 'doing';
  this.log(this._default + ': ' + message);
  this.state = 'waiting';
  cb();
};
