var util = require('util')
var Device = require('zetta-device')

var WemoMaker = module.exports = function (device, client) {
  this.name = device.friendlyName
  this.state = 'off'
  this.sensor = 'open'
  this.UDN = device.UDN
  this._client = client
  Device.call(this)
}
util.inherits(WemoMaker, Device)

WemoMaker.prototype.init = function (config) {
  config
    .type('wemo-maker')
    .state(this.state)
    .monitor('sensor')
    .name(this.name)
    .when('off', { allow: ['turn-on'] })
    .when('on', { allow: ['turn-off'] })
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
  this._client.on('attributeList', this._attributeListHandler.bind(this))
  this.getAttributes()
}

WemoMaker.prototype._attributeListHandler = function (name, value) {
  if (name === 'Switch') {
    var state = (value === '1') ? 'on' : 'off'
    if (this.state !== state) {
      this.state = state
    }
  }
  if (name === 'Sensor') {
    var sensor = (value === '1') ? 'open' : 'closed'
    if (this.sensor !== sensor) {
      this.sensor = sensor
    }
  }
}

WemoMaker.prototype.getAttributes = function () {
  this._client.getAttributes(function (err, attributes) {
    if (!err) {
      for (var prop in attributes) {
        this._attributeListHandler(prop, attributes[prop])
      }
    }
  }.bind(this))
}

WemoMaker.prototype.turnOn = function (cb) {
  this._client.setBinaryState(1, function (err) {
    if (!err) this.state = 'on'
    cb()
  }.bind(this))
}

WemoMaker.prototype.turnOff = function (cb) {
  this._client.setBinaryState(0, function (err) {
    if (!err) this.state = 'off'
    cb()
  }.bind(this))
}
