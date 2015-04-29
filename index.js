var Scout = require('zetta-scout');
var util = require('util');
var WemoLight = require('./wemolight');

var WemoLightScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(WemoLightScout, Scout);

WemoLightScout.prototype.init = function(next) {

  var self = this;

  var query = this.server.where({type: 'wemolight'});
  var options = {default: 'DEFAULT'};

  this.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], WemoLight, options);
    } else {
      self.discover(WemoLight, options);
    }
  });

  next();

};
