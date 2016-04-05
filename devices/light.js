var util = require('util');
var Device = require('zetta-device');

var WemoLight = module.exports = function(device, client) {
  this.name = device.friendlyName;
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
    .when('off', {allow: ['turn-on', 'toggle', 'dim']})
    .when('on', {allow: ['turn-off', 'toggle', 'dim']})
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
    .map('toggle', this.toggle)
    .map('dim', this.dim, [
      {name: 'value', type: 'number'}
    ]);

  this._client.on('statusChange', function(deviceId, capabilityId, value) {
    if (deviceId === this.deviceId) {
      this._statusChange(deviceId, capabilityId, value);
    }
  }.bind(this));
};

WemoLight.prototype._statusChange = function(deviceId, capabilityId, value) {
  if (capabilityId == '10008') {
    this.brightness = value.split(':').shift();
  }

  if (capabilityId == '10006') {
    this.state = (value.split(':').shift() === '1') ? 'on' : 'off';
  }
};

WemoLight.prototype.turnOn = function(cb) {
  this.setDeviceStatus(10006, '1');
  cb();
};

WemoLight.prototype.turnOff = function(cb) {
  this.setDeviceStatus(10006, '0');
  cb();
};

WemoLight.prototype.toggle = function(cb) {
  this.setDeviceStatus(10006, (this.state === 'on') ? '0' : '1');
  cb();
};

WemoLight.prototype.dim = function(value, cb) {
  var brightness = parseInt(value) || 0;
  this.setDeviceStatus(10008, brightness + ':35');
  cb();
};

WemoLight.prototype.setDeviceStatus = function(capability, value) {
  this._client.setDeviceStatus(this.deviceId, capability, value);
};
