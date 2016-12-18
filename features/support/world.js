let DateCruncher = require('../dist/classes/date-cruncher.js');
let DateParser = require('../dist/classes/date-parser.js');

module.exports = function() {
  this.testObjects = {
    dc: DateCruncher,
    dp: DateParser
  };
};