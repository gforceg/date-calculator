let lib = require('../../date-cruncher/index.js');
process.chdir('tests')

module.exports = function() {
  this.testObjects = {
    dc: DateCruncher,
    dp: DateParser
  };
};