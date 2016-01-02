var zetta = require('zetta');
var Wemo = require('../index');

zetta()
  .use(Wemo)
  .listen(1337);
