var ParserFactory = require('./parsers/ParserFactory');
var Stage         = require('./Stage');

module.exports = (function() {

  var Feynman = function() {
    var elements = document.getElementsByClassName('feynmanjs');
    [].forEach.call(elements, _loadInplace, this);

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

  var _loadInplace = function(elem) {
    var data     = {};
    var raw      = elem.textContent;
    var dataElem = document.createElement('pre');
    var figElem  = document.createElement('figure');

    dataElem.style.display = 'none';
    dataElem.textContent   = raw;
    dataElem.className     = 'feynmanjs-data';
    figElem.className      = 'feynmanjs-figure';

    elem.textContent = '';
    elem.appendChild(dataElem);
    elem.appendChild(figElem);

    try {
      data = JSON.parse(raw);
      this.draw(figElem, data);
    } catch(e) {
      console.error(e);
    }
  };

  window.Feynman = Feynman;

  return Feynman;
})();