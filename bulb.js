var Device = require('zetta-device');
var BridgeClient = require('./wemo-client/bridgeclient');

var util = require('util');

var WemoBulb = module.exports = function(device, bridge) {
  this.name = device.friendlyName;
  this._internalState = device.internalState;
  this.state = (device.internalState['10006'].substr(0,1) === '1') ? 'on' : 'off';
  this.brightness = device.internalState['10008'].split(':').shift();
  this.deviceId = device.deviceId;
  this._bridge = bridge;
  Device.call(this);
};
util.inherits(WemoBulb, Device);

WemoBulb.prototype.init = function(config) {
  config
    .type('wemo-bulb')
    .state(this.state)
    .monitor('brightness')
    .name(this.name)
    .when('off', { allow: ['turn-on', 'dim'] })
    .when('on', { allow: ['turn-off', 'dim'] })
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
    .map('dim', this.dim, [
      { name: 'value', type: 'number'}
    ]);

  var self = this;
  this._bridge.on('StatusChange', function(event){
    if (event.DeviceId === self.deviceId) {
      console.log('StatusChange event: %j', event);
      self._internalState[event.CapabilityId] = event.Value;
      self.brightness = self._internalState['10008'].split(':').shift();
      self.state = (self._internalState['10006'].substr(0,1) === '1') ? 'on' : 'off'
    }
  });
};

WemoBulb.prototype.turnOn = function(cb) {
  this.setDeviceStatus(10006, '1');
  this.state = 'on';
  cb();
};

WemoBulb.prototype.turnOff = function(cb) {
  this.setDeviceStatus(10006, '0');
  this.state = 'off';
  cb();
};

WemoBulb.prototype.dim = function(value, cb) {
  // value = brightness:transition time
  this.setDeviceStatus(10008, (parseInt(value) || 0) + ':25');
  this.state = (value > 0) ? 'on' : 'off';
  cb();
};

WemoBulb.prototype.setDeviceStatus = function(capability, value) {
  this._bridge.setDeviceStatus(this.deviceId, capability, value);
}
