var express = require('express');

module.exports = function() {
	console.log('in development config');

  this.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));

  // Server static content
  this.use(express.static(__dirname + "/../../public"));
  
  this.use(function (req, res) {
    res.send(404);
  });
}
