var express = require('express')
  , util = require('util')
  , passport = require('passport')
  , poweredBy = require('connect-powered-by')
  , FacebookStrategy = require('passport-facebook').Strategy;

  


module.exports = function() {
  // Warn of version mismatch between global "lcm" binary and local installation
  // of Locomotive.
  if (this.version !== require('locomotive').version) {
    console.warn(util.format('version mismatch between local (%s) and global (%s) Locomotive module', require('locomotive').version, this.version));
  }

  this.set('view engine', 'ejs');

  this.use(poweredBy('Locomotive'));
  this.use(express.logger());
  this.use(express.static(__dirname + '/../../public'));
  this.use(express.favicon());
  this.use(express.cookieParser());
  this.use(express.bodyParser());
  this.use(express.session({ secret: 'keyboard cat' }));
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(this.router);

  
}
