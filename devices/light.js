var util = require('util');
var Device = require('zetta-device');

var WemoLight = module.exports = function(device, client) {
  this.name = device.friendlyName;
  this._internalState = device.capabilities;
  this.state = (device.capabilities['10006'].substr(0,1) === '1') ? 'on' : 'off';
  this.brightness = device.capabilities['10008'].split(':').shift();
  this.deviceId = device.deviceId;
  this.UDN = device.UDN;
  this._client = client;
  Device.call(this);
};
util.inherits(WemoLight, Device);

WemoLight.prototype.init = function(config) {
  config
    .type('wemo-light')
    .state(this.state)
    .monitor('brightness')
    .name(this.name)
    .when('off', {allow: ['turn-on', 'dim']})
    .when('on', {allow: ['turn-off', 'dim']})
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
    .map('dim', this.dim, [
      {name: 'value', type: 'number'}
    ]);

  var self = this;
  this._client.on('statusChange', function(deviceId, capabilityId, value) {
    if (deviceId === self.deviceId) {
      self._statusChange(deviceId, capabilityId, value);
    }
  });
};

WemoLight.prototype._statusChange = function(deviceId, capabilityId, value) {
  this._internalState[capabilityId] = value;
  this.brightness = this._internalState['10008'].split(':').shift();
  this.state = (this._internalState['10006'].substr(0,1) === '1') ? 'on' : 'off';
};

WemoLight.prototype.turnOn = function(cb) {
  this.setDeviceStatus(10006, '1');
  this.state = 'on';
  cb();
};

WemoLight.prototype.turnOff = function(cb) {
  this.setDeviceStatus(10006, '0');
  this.state = 'off';
  cb();
};

WemoLight.prototype.dim = function(value, cb) {
  // value = brightness:transition time
  if (value > 0) {
    this.setDeviceStatus(10008, (parseInt(value) || 0) + ':25');
    (this.state !== 'on') ? this.turnOn(cb) : cb();
  } else {
    this.turnOff(cb);
  }
};

WemoLight.prototype.setDeviceStatus = function(capability, value) {
  this._client.setDeviceStatus(this.deviceId, capability, value);
};
