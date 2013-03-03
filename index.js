var TotalCount = require('./lib/totalCount.js')
  , util = require('util')
  , stream = require('stream')
  , fs = require('fs')
  , exec = require('child_process').exec;

// Give our module a stream interface
util.inherits(scanner,stream);

var DEBUG = false;

function scanner(opts,app) {

  this.app = app;
  app.on('client::up',this.startScanner.bind(this));
};

scanner.prototype.startScanner = function(cb) {
  var MINUTES = 5;

  var command = 'cat '+__dirname+'/launch.json';

  var self = this;

  this.app.log.info('Beginning Wifi Scan');

  var spawnScanner = function(err,json) {

    if (err) {
      return;
    }

    this.app.log.info('Finished Wifi Scan');
    this.parseJSON(json);

    setTimeout(function() {

        child = exec(command,spawnScanner);
    },MINUTES*60*1000);

  }.bind(this);

  var child = exec(command,spawnScanner);
};

var totalDevice;
scanner.prototype.parseJSON = function(json) {
  var self = this;

  try {
    var dataObj = JSON.parse(json);
  } catch (err) {
    this.app.log.error(err);
    return;
  }

  // Archive it
  var d = new Date();
  fs.writeFile(__dirname+'/results/result-'+d.toString(),json);

  if (!DEBUG && !totalDevice) {
    totalDevice = new TotalCount();
    this.emit('register', totalDevice);
  }

  totalDevice.emit('data',dataObj.length);

};

// Export it
module.exports = scanner;