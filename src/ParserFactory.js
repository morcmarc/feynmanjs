var StandardParser = require('./parsers/StandardParser');
var LatexParser    = require('./parsers/LatexParser');

module.exports = {

  getParser: function(lang) {

    if(lang === 'latex') {
      return new LatexParser();
    }
    return new StandardParser();
  }
};