var Device = require('zetta-device');
var util = require('util');

var Wemo = module.exports = function(options) {
  Device.call(this);
  this._default = options['default'];
};
util.inherits(Wemo, Device);

Wemo.prototype.init = function(config) {
  config
  .name('Wemo')
  .type('wemo')
  .state('waiting')
  .when('waiting', { allow: ['do']})
  .when('doing', { allow: [] })
  .map('do', this.do, [
    { name: 'message', type: 'text'}
  ]);
};

Wemo.prototype.do = function(message, cb) {
  this.state = 'doing';
  this.log(this._default + ': ' + message);
  this.state = 'waiting';
  cb();
};
