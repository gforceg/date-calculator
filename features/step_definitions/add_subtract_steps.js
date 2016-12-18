'use strict';

module.exports = function () {
  this.World = require('../../world.js');

  this.Given(/^that no date was provided\.$/, function (cb) {
    this.date = null;
    cb();                                                                                                                                                         
  });   

  this.When(/^the expression is "([^"]*)"$/, function (expr, cb) {
    this.expression = expr;
    cb();
  });

  this.Then(/^the answer will be today's date plus \+ (\d+) day$/, function (days, cb) {

    let date = new Date();
    (this.toDateString(this.dc.evaluate(this.expression)) === this.toDateString(date.setDate(this.getDate + days)));                                                                                   
    cb();                                                                                                                                                         
  }); 
};