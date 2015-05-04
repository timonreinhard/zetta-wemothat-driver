var Device = require('zetta-device');
var BridgeClient = require('./wemo-client/bridgeclient');

var util = require('util');

var WemoBulb = module.exports = function(device, bridge) {
  this.name = device.friendlyName;
  this.internalState = device.internalState;
  this.state = (device.internalState['10006'] === '1') ? 'on' : 'off';
  this.deviceId = device.deviceId;
  this._bridge = bridge;
  this._bridge.on('StatusChange', this.statusChange.bind(this));
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
    console.log(this);
};

WemoBulb.prototype.statusChange = function(event) {
  if (event.DeviceId === this.deviceId) {
    this.internalState[event.CapabilityId] = event.Value;
    console.log(event, this.deviceId, this.internalState);
    this.updateState();
  }
};

WemoBulb.prototype.updateState = function() {
  this.state = (this.internalState['10006'] === '1') ? 'on' : 'off';
};

WemoBulb.prototype.turnOn = function(cb) {
  // FIXME: This doesn't reset dim level
  this.setDeviceStatus(10006, '1:255');
  //this.state = 'on';
  cb();
};

WemoBulb.prototype.turnOff = function(cb) {
  this.setDeviceStatus(10006, '0');
  //this.state = 'off';
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
