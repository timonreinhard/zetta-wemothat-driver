var Device = require('zetta-device');

var util = require('util');

var WemoMotion = module.exports = function(device, client, server) {
  this.name = device.friendlyName;
  this.state = 'quiet';
  this.UDN = device.UDN;
  this._client = client;
  this._server = server;
  Device.call(this);
};
util.inherits(WemoMotion, Device);

WemoMotion.prototype.init = function(config) {
  config
    .type('wemo-motion')
    .state(this.state)
    .monitor('state')
    .name(this.name);

  this._server.on('BinaryState', function(event){
    if (event.UDN !== this.UDN) {
      return;
    }
    this.state = (event.BinaryState === '1') ? 'motion' : 'quiet';
  }.bind(this));

};
