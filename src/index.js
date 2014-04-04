var ParserFactory = require('./ParserFactory');

module.exports = (function() {

  var Feynman = function() {

    return this;
  };

  Feynman.prototype.draw = function(canvas, data) {

    if (typeof canvas === 'undefined') {
      throw new Error('Missing canvas#id argument!');
    }

    if (typeof data === 'undefined') {
      throw new Error('Missing data argument!');
    }


    var svgCanvas  = new SVG(canvas);
    var parser     = ParserFactory.getParser(data.lang);
    var parsedData = parser.parse(data);
  };

  return Feynman;
})();