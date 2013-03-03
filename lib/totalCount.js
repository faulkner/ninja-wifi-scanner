
var stream = require('stream')
  , util = require('util');


// Give our module a stream interface
util.inherits(Device,stream);

// Export it
module.exports=Device;

function Device() {

  var self = this;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = "0"; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 9005; // 2000 is a generic Ninja Blocks sandbox device

  process.nextTick(this.init);
};

Device.prototype.init = function() {

};

/**
 * Called whenever there is data from the cloud
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
Device.prototype.write = function(data) {

  // I'm being actuated with data!
  console.log(data);
};
