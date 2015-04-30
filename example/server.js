var zetta = require('zetta');
var Starter = require('../index');
var app = require('./apps/wemothat_app');

zetta()
  .use(Starter)
  .use(app)
  .listen(1337);
