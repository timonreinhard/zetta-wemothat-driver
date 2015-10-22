var zetta = require('zetta');
var Wemo = require('../index');
var app = require('./apps/wemo_app');

zetta()
  .use(Wemo)
  .use(app)
  .listen(1337);
