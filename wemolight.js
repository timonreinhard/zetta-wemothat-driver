var Device = require('zetta-device');
var util = require('util');

var WemoLight = module.exports = function(options) {
  Device.call(this);
  this._default = options['default'];
};
util.inherits(WemoLight, Device);

WemoLight.prototype.init = function(config) {
  config
  .name('WemoLight')
  .type('wemolight')
  .state('waiting')
  .when('waiting', { allow: ['do']})
  .when('doing', { allow: [] })
  .map('do', this.do, [
    { name: 'message', type: 'text'}
  ]);
};

WemoLight.prototype.do = function(message, cb) {
  this.state = 'doing';
  this.log(this._default + ': ' + message);
  this.state = 'waiting';
  cb();
};
