var util = require('util');
var Device = require('zetta-device');

var WemoInsight = module.exports = function(device, client) {
  this.name = device.friendlyName;
  this.state = 'off';
  this.power = 0;
  this.UDN = device.UDN;
  this._client = client;
  Device.call(this);
};
util.inherits(WemoInsight, Device);

WemoInsight.BINARY_STATES = {
  1: 'on',
  0: 'off',
  8: 'standby'
};

WemoInsight.prototype.init = function(config) {
  config
    .type('wemo-insight')
    .state(this.state)
    .name(this.name)
    .monitor('power')
    .when('off', { allow: ['turn-on'] })
    .when('on', { allow: ['turn-off'] })
    .when('standby', { allow: ['turn-off'] })
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff);

  this._client.on('binaryState', this._binaryStateHandler.bind(this));
  this._client.on('insightParams', this._insightParamsHandler.bind(this));
};

WemoInsight.prototype._binaryStateHandler = function(val) {
  var state = WemoInsight.BINARY_STATES[val];
  if (this.state !== state) {
    this.state = state;
  }

  // Reset power value if device goes off
  if (state == 'off') {
    this.power = 0;
  }
};

WemoInsight.prototype._insightParamsHandler = function(val, power) {
  this.power = Math.round(power / 1000);
};

WemoInsight.prototype.turnOn = function(cb) {
  this._client.setBinaryState(1);
  cb();
};

WemoInsight.prototype.turnOff = function(cb) {
  this._client.setBinaryState(0);
  cb();
};
