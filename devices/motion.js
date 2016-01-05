var util = require('util');
var Device = require('zetta-device');

var WemoMotion = module.exports = function(device, client) {
  this.name = device.friendlyName;
  this.state = 'quiet';
  this.UDN = device.UDN;
  this._client = client;
  Device.call(this);
};
util.inherits(WemoMotion, Device);

WemoMotion.prototype.init = function(config) {
  config
    .type('wemo-motion')
    .state(this.state)
    .monitor('state')
    .name(this.name);

  this._client.on('binaryState', function(val) {
    var state = (val === '1') ? 'motion' : 'quiet';
    if (this.state !== state) {
      this.state = state;
    }
  }.bind(this));
};
