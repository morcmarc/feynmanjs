var LatexParser = require('./LatexParser');

module.exports = {

  getParser: function(data) {

    switch(data.lang) {
      default:
        return new LatexParser(data);
    }
  }
};