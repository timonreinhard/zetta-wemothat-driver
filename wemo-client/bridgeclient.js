var SoapClient = require('./soapclient');
var util = require('util');
var http = require('http');
var xml2js = require('xml2js');

var BridgeClient = module.exports = function(config) {
  SoapClient.call(this, config);
  this.path = '/upnp/control/bridge1';
  this.serviceType = 'urn:Belkin:service:bridge:1';
};
util.inherits(BridgeClient, SoapClient);


BridgeClient.prototype.getEndDevices = function(cb) {
  var self = this;

  var parseResponse = function(err, data) {
    if (err) cb(err);
    xml2js.parseString(data, function(err, result) {
      if (!err) {
        var list = result['s:Envelope']['s:Body'][0]['u:GetEndDevicesResponse'][0].DeviceLists[0];
        xml2js.parseString(list, function(err, result2) {
          if (!err) {
            var devinfo = result2.DeviceLists.DeviceList[0].DeviceInfos[0].DeviceInfo;
            if (devinfo) {
              for (var i = 0; i < devinfo.length; i++) {
                var device = {
                  bridge: {
                    ip: self.ip,
                    port: self.port,
                    UDN: self.UDN
                  },
                  friendlyName: devinfo[i].FriendlyName[0],
                  deviceId: devinfo[i].DeviceID[0],
                  currentState: devinfo[i].CurrentState[0],
                  capabilities: devinfo[i].CapabilityIDs[0].split(',')
                };
                cb(null, device);
              }
            }
            var groupinfos = result2.DeviceLists.DeviceList[0].GroupInfos;
            if (groupinfos) {
              for (var i = 0; i < groupinfos.length; i++) {
                var device = {
                  bridge: {
                    ip: self.ip,
                    port: self.port,
                    UDN: self.UDN
                  },
                  friendlyName: groupinfos[i].GroupInfo[0].GroupName[0],
                  deviceId: groupinfos[i].GroupInfo[0].GroupID[0],
                  currentState: groupinfos[i].GroupInfo[0].GroupCapabilityValues[0],
                  capabilities: groupinfos[i].GroupInfo[0].GroupCapabilityIDs[0].split(',')
                };
                cb(null, device);
              }
            }
          } else {
            console.log(err, data);
          }
        });
      }
    });
  };

  var body = '<u:GetEndDevices xmlns:u="urn:Belkin:service:bridge:1"><DevUDN>%s</DevUDN><ReqListType>PAIRED_LIST</ReqListType></u:GetEndDevices>';
  this.post('GetEndDevices', util.format(body, this.UDN), parseResponse);
}

BridgeClient.prototype.setDeviceStatus = function(deviceId, capability, value) {
  var isGroupAction = (deviceId.length === 10) ? 'YES' : 'NO';
  var body = [
    '<u:SetDeviceStatus xmlns:u="urn:Belkin:service:bridge:1">',
    '<DeviceStatusList>',
    '&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;&lt;DeviceStatus&gt;&lt;IsGroupAction&gt;%s&lt;/IsGroupAction&gt;&lt;DeviceID available=&quot;YES&quot;&gt;%s&lt;/DeviceID&gt;&lt;CapabilityID&gt;%s&lt;/CapabilityID&gt;&lt;CapabilityValue&gt;%s&lt;/CapabilityValue&gt;&lt;/DeviceStatus&gt;',
    '</DeviceStatusList>',
    '</u:SetDeviceStatus>'
  ].join('\n');
  this.post('SetDeviceStatus', util.format(body, isGroupAction, deviceId, capability, value));
};
