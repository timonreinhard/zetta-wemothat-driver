var util = require('util');
var Device = require('zetta-device');
var WemoLight = require('./light');

var WemoColorLight = module.exports = function(device, client) {
  WemoLight.apply(this, arguments);
};
util.inherits(WemoColorLight, WemoLight);

WemoColorLight.prototype.init = function(config) {
  WemoLight.prototype.init.call(this, config);
  config
    .type('wemo-color-light')
    .when('off', {allow: ['turn-on', 'dim', 'set-color']})
    .when('on', {allow: ['turn-off', 'dim', 'set-color']})
    .map('set-color', this.setColor, [
      {name: 'red', type: 'number'},
      {name: 'green', type: 'number'},
      {name: 'blue', type: 'number'}
    ]);
};

WemoLight.prototype.setColor = function(red, green, blue, cb) {
  this._client.setLightColor(this.deviceId, red, green, blue);
};
