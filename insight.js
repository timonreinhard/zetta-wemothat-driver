var Device = require('zetta-device');

var util = require('util');

var WemoInsight = module.exports = function(device, client) {
  this.name = device.friendlyName;
  this.state = 'off';
  this.power = 0;
  this.UDN = device.UDN;
  this._client = client;
  Device.call(this);
};
util.inherits(WemoInsight, Device);

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

  this._client.on('BinaryState', function(event){
    var map = {
      1: 'on',
      0: 'off',
      8: 'standby'
    };
    var state = event.split('|').shift();
    this.state = map[state];

    // Reset power value if device goes off
    if (this.state == 'off') {
      this.power = 0;
    }
  }.bind(this));

  this._client.on('InsightParams', function(event) {
    this.power = Math.round(event.InstantPower / 1000);
  }.bind(this));
};

WemoInsight.prototype.turnOn = function(cb) {
  this._client.setBinaryState(1);
  this.state = 'on';
  cb();
};

WemoInsight.prototype.turnOff = function(cb) {
  this._client.setBinaryState(0);
  this.state = 'off';
  cb();
};
