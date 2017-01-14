let lib = require('../../date-cruncher/index.js');

process.chdir('tests')

module.exports = function () {
  this.lib = lib;
  
  this.new_object = (type) => {
    try {
      let obj;
      if (lib[type]) {
        obj = new lib[type]();
        return obj
      } else {
        obj = new global[type]();
        return obj;        
      }
    } catch (ex) {
        throw ex;
      }
    }

  this.date_cruncher = new lib.DateCruncher();
};