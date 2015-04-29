module.exports = function testApp(server) {

  // add query params in the where object like so:
  // var starterDeviceQuery = server.where({type: 'led'});
  var wemoLightDeviceQuery = server.where({});

  server.observe([wemoLightDeviceQuery], function(wemoLightDevice){
    setInterval(function(){
      wemoLightDevice.call('do', './example/apps/wemolight_app.js is running', function() {});
    }, 1000);
  });

}
