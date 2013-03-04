var TotalCount = require('./lib/totalCount.js')
  , VendorCount = require('./lib/vendorCount.js')
  , util = require('util')
  , stream = require('stream')
  , fs = require('fs')
  , exec = require('child_process').exec;

// Give our module a stream interface
util.inherits(scanner,stream);

var DEBUG = false;

function scanner(opts,app) {

  this.app = app;
  app.on('client::up',function() {

    this.setupVendorDevices.call(this);
    this.startScanner.call(this)

  }.bind(this));
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

  // We send in sliced arrays because that will clone them
  // and we can then modify them without worrying about anybody
  // else having ill effects
  this.mapVendors(dataObj.slice(0));
  this.mapAssociated(dataObj.slice(0));
};

var vendors = [
  'apple'
  , 'intel'
  , 'htc'
  , 'samsung'
  , 'motorola'
  , 'lg'
  , 'asustek'
];

var vendorDevices = {};

scanner.prototype.setupVendorDevices = function() {

  for (var i=0;i<vendors.length;i++) {

    vendorDevices[vendors[i]] = new VendorCount(vendors[i]);
    this.emit('register',vendorDevices[vendors[i]]);
  }

  vendorDevices['other'] = new VendorCount('other');
  this.emit('register',vendorDevices['other']);
};

scanner.prototype.mapVendors = function(obj) {

  var out = {};

  // Iterate over the big array
  for (var i=0; i<obj.length; i++) {
    if (!obj[i].vendor) continue;

    var radioVendor = obj[i].vendor;

    var matched = false;

    for (var j=0;j<vendors.length;j++) {

      var normalisedVendor = vendors[j];
      var regex = new RegExp(normalisedVendor,'i');

      if (regex.test(radioVendor)) {

        out[normalisedVendor] = out[normalisedVendor] || 0;
        out[normalisedVendor]++;
        matched = true;
      }
    }

    // We couldn't find this vendor, so we put it as other
    if (!matched) {
      out['other'] = out['other'] || 0;
      out['other']++;
    }
  }

  // Emit the counts that we calculated previously
  for (var v in out) {
    vendorDevices[v].emit('data',out[v]);
  }
};

scanner.prototype.mapAssociated = function(obj) {

}
// Export it
module.exports = scanner;
