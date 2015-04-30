var Device = require('zetta-device');
var util = require('util');

var http = require('http');
var xml2js = require('xml2js');

var parseState = function(internalState) {
  var state = internalState.substr(0, 1);
  if (state === '1') return 'on';
  if (state === '0') return 'off';
  return undefined;
}

var soapHeader = '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>';
var soapFooter = '</s:Body></s:Envelope>';

var WemoBulb = module.exports = function(device) {
  this.name = device.friendlyName;
  this.internalState = device.currentState;
  this.state = parseState(device.currentState);
  this.deviceId = device.deviceId;
  this.bridge = device.bridge;
  Device.call(this);
};
util.inherits(WemoBulb, Device);

WemoBulb.prototype.init = function(config) {
  config
    .type('wemo-bulb')
    .state(this.state)
    .name(this.name)
    .when('off', { allow: ['turn-on', 'dim']})
    .when('on', { allow: ['turn-off', 'dim']})
    .map('turn-on', this.turnOn)
    .map('turn-off', this.turnOff)
    .map('dim', this.dim, [
      { name: 'value', type: 'number'}
    ]);
};

WemoBulb.prototype.do = function(message, cb) {
  this.state = 'doing';
  this.log(this._default + ': ' + message);
  this.state = 'waiting';
  cb();
};

WemoBulb.prototype.turnOn = function(cb) {
  this.setDeviceStatus(10006, '1:255');
  this.state = 'on';
  cb();
};

WemoBulb.prototype.turnOff = function(cb) {
  this.setDeviceStatus(10006, '0');
  this.state = 'off';
  cb();
};

WemoBulb.prototype.dim = function(value, cb) {
  this.setDeviceStatus(10008, value + ':0');
  this.state = (value > 0) ? 'on' : 'off';
  cb();
};

WemoBulb.prototype.setDeviceStatus = function(capability, value) {
	var payload = [
    soapHeader,
	  '<u:SetDeviceStatus xmlns:u="urn:Belkin:service:bridge:1">',
	  '<DeviceStatusList>',
	  '&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;&lt;DeviceStatus&gt;&lt;IsGroupAction&gt;NO&lt;/IsGroupAction&gt;&lt;DeviceID available=&quot;YES&quot;&gt;%s&lt;/DeviceID&gt;&lt;CapabilityID&gt;%s&lt;/CapabilityID&gt;&lt;CapabilityValue&gt;%s&lt;/CapabilityValue&gt;&lt;/DeviceStatus&gt;',
	  '</DeviceStatusList>',
	  '</u:SetDeviceStatus>',
    soapFooter
	].join('\n');

	var post_request = http.request({
    host: this.bridge.ip,
		port: this.bridge.port,
		path: '/upnp/control/bridge1',
		method: 'POST',
		headers: {
			'SOAPACTION': '"urn:Belkin:service:bridge:1#SetDeviceStatus"',
		 	'Content-Type': 'text/xml; charset="utf-8"',
			'Accept': ''
		}
  }, function(res) {
		var data = "";
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			data += chunk;
		});

		res.on('end', function(){
			console.log(data);
		});
	});

	post_request.on('error', function (e) {
		console.log(e);
	});

	post_request.write(util.format(payload, this.deviceId, capability, value));
	post_request.end();
}
