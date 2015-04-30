var Scout = require('zetta-scout');
var util = require('util');
var Wemo = require('./wemo');

var WemoScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(WemoScout, Scout);

WemoScout.prototype.init = function(next) {

  var self = this;

  var query = this.server.where({type: 'wemo'});
  var options = {default: 'DEFAULT'};

  this.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], Wemo, options);
    } else {
      self.discover(Wemo, options);
    }
  });

  next();

};
