var TotalCount = require('./lib/totalCount.js')
  , util = require('util')
  , stream = require('stream')
  , fs = require('fs')
  , exec = require('child_process').exec;

// Give our module a stream interface
util.inherits(scanner,stream);

// 1. Run scanner on a loop
// 2. Analyse after scanner has run
// 3. Report Device
//
// Devices:
// 1) Total Server Count G: 0
// 2) Server count per port G: 80/3000/etc
//

var DEBUG = false;

function scanner(opts,app) {

  this.app = app;
  // app.on('client::up',this.runNmap.bind(this));
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

var devices={};
/**
 * Create and return the port device, and register it
 * if it does not already exist
 * @param  {Number} port The port number
 * @return {Object} instanceof PortCount
 */
scanner.prototype.fetchPortDevice = function(port) {

  if (!devices.hasOwnProperty(port)) {

    var device = new PortCount(port);
    devices[port] = device;
    if (!DEBUG) this.emit('register', device);
  }
  return devices[port];
}

// Export it
module.exports = scanner;