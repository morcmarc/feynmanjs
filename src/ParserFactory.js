var StandardParser = require('./parsers/StandardParser');
var LatexParser    = require('./parsers/LatexParser');

module.exports = (function () {
  
  var Parser = function() {

  };

  Parser.prototype.getParser = function(lang) {

    if(lang === 'latex') {
      return new LatexParser();
    }
    return new StandardParser();
  };

  return Parser;

})();