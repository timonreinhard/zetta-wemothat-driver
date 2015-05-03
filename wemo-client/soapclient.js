var util = require('util');
var http = require('http');
var xml2js = require('xml2js');

var SoapClient = module.exports = function(config) {
  this.ip = config.ip;
  this.port = config.port;
  this.path = config.path;
  this.serviceType = undefined;
  this.deviceType = config.deviceType;
  this.UDN = config.UDN;
};

SoapClient.prototype.post = function(action, body, cb) {
  var soapHeader = '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>';
  var soapFooter = '</s:Body></s:Envelope>';

  var req = http.request({
    host: this.ip,
    port: this.port,
    path: this.path,
    method: 'POST',
    headers: {
      'SOAPACTION': '"' + this.serviceType + '#' + action + '"',
      'Content-Type': 'text/xml; charset="utf-8"'
    }
  }, function(res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      if (cb) {
        cb(null, data);
      }
    });
    res.on('error', function(err) {
      console.log(err);
    });
  });
  req.write(soapHeader);
  req.write(body);
  req.write(soapFooter);
  req.end();
};
