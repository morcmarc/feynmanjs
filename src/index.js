var ParserFactory = require('./ParserFactory');

module.exports = (function() {

  var Feynman = function(canvas) {

    if (typeof canvas === 'undefined') {
      throw new Error('Missing canvas#id argument!');
    }

    this._version = '1.0.0';
    this._canvas  = new SVG(canvas);

    return this;
  };

  Feynman.prototype.draw = function(data) {

    if (typeof data === 'undefined') {
      throw new Error('Missing data argument!');
    }

    var parser = new ParserFactory().getParser(data.lang);
    var parsedData = parser.parse(data);
  };

  return Feynman;
})();