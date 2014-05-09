var ParserFactory = require('./parsers/ParserFactory');
var Stage         = require('./Stage');

module.exports = (function() {

  var Feynman = function() {

    return this;
  };

  /**
   * Draw diagram onto canvas.
   * @param canvas Id of canvas element
   * @param data   Diagram properties
   */
  Feynman.prototype.draw = function(canvas, data) {

    if (typeof canvas === 'undefined') {
      throw new Error('Missing canvas#id argument!');
    }

    if (typeof data === 'undefined') {
      throw new Error('Missing data argument!');
    }

    var svgCanvas  = new SVG(canvas);
    var parser     = ParserFactory.getParser(data);
    var stageData  = parser.parse();
    var stage      = new Stage(canvas, svgCanvas, stageData);

    stage.draw();

    return this;
  };

  window.Feynman = Feynman;

  return Feynman;
})();