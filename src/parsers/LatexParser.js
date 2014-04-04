var Stage = require('./../Stage');

module.exports = (function() {
  
  var LatexParser = function() {

    return this;
  };

  LatexParser.prototype.parse = function(data) {

    if(data === undefined) {
      throw new Error('Missing data argument!');
    }

    return new Stage();
  };

  return LatexParser;
})();