var Device = require('zetta-device');
var WemoBridge = require('./wemo-bridge');

var util = require('util');

var parseState = function(internalState) {
  var state = internalState.substr(0, 1);
  if (state === '1') return 'on';
  if (state === '0') return 'off';
  return undefined;
}

var WemoBulb = module.exports = function(device) {
  this.name = device.friendlyName;
  this.internalState = device.currentState;
  this.state = parseState(device.currentState);
  this.deviceId = device.deviceId;
  this._bridge = new WemoBridge(device.bridge);
  Device.call(this);
};
util.inherits(WemoBulb, Device);

WemoBulb.prototype.init = function(config) {
  config
    .type('wemo-bulb')
    .state(this.state)
    .name(this.name)
    .when('off', { allow: ['turn-on', 'dim'] })
    .when('on', { allow: ['turn-off', 'dim'] })
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
    .map('dim', this.dim, [
      { name: 'value', type: 'number'}
    ]);
};

WemoBulb.prototype.turnOn = function(cb) {
  this.setDeviceStatus(10006, '1:255');
  this.state = 'on';
  cb();
};

WemoBulb.prototype.turnOff = function(cb) {
  this.setDeviceStatus(10006, '0');
  this.state = 'off';
  cb();
};

WemoBulb.prototype.dim = function(value, cb) {
  this.setDeviceStatus(10008, (parseInt(value) || 0) + ':0');
  this.state = (value > 0) ? 'on' : 'off';
  cb();
};

WemoBulb.prototype.setDeviceStatus = function(capability, value) {
  this._bridge.setDeviceStatus(this.deviceId, capability, value);
}
