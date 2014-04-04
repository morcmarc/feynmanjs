!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Feynman=e():"undefined"!=typeof global?global.Feynman=e():"undefined"!=typeof self&&(self.Feynman=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function() {

  var Stage = function() {

    // Generic Attributes (optional)
    this.title    = 'Feynman';
    this.layout   = 'time-space';
    this.width    = 100;
    this.height   = 100;
    this.showAxes = true;

    // Main properties (required)
    this.propagators = [];
    this.vertices    = [];

    // Main properties (optional)
    this.exchanges   = [];

    return this;
  };

  Stage.prototype.setCanvas = function(canvas) {

    this.canvas = canvas;
    this.canvas.size(this.width, this.height);
    return this;
  };

  Stage.prototype.draw = function() {

    this.canvas.text(this.title);
    return this;
  };

  return Stage;
})();
},{}],2:[function(require,module,exports){
var ParserFactory = require('./parsers/ParserFactory');

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
    var parser     = ParserFactory.getParser(data.lang);
    var stage      = parser.parse(data);

    stage.setCanvas(svgCanvas).draw();

    return this;
  };

  return Feynman;
})();
},{"./parsers/ParserFactory":4}],3:[function(require,module,exports){
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
},{"./../Stage":1}],4:[function(require,module,exports){
var StandardParser = require('./StandardParser');
var LatexParser    = require('./LatexParser');

module.exports = {

  getParser: function(lang) {

    if(lang === 'latex') {
      return new LatexParser();
    }
    return new StandardParser();
  }
};
},{"./LatexParser":3,"./StandardParser":5}],5:[function(require,module,exports){
var Stage = require('./../Stage');

module.exports = (function() {
  
  var StandardParser = function() {

    return this;
  };

  StandardParser.prototype.parse = function(data) {

    if(data === undefined) {
      throw new Error('Missing data argument!');
    }

    var stage = new Stage();

    _setTitle(stage, data.title);
    _setLayout(stage, data.layout);
    _setDimension(stage, data.width, data.height);
    _setShowAxes(stage, data.showAxes);
    _setPropagators(stage, data.propagators);
    _setVertices(stage, data.vertices);
    _setExchanges(stage, data.exchanges);

    return stage;
  };

  var _setTitle = function(stage, title) {

    if(title !== undefined) {
      stage.title = title;
    }
  };

  var _setLayout = function(stage, layout) {

    if(layout !== undefined) {
      stage.layout = layout;
    }
  };

  var _setDimension = function(stage, width, height) {

    if(width !== undefined) {
      stage.width = width;
    }
    if(height !== undefined) {
      stage.height = height;
    }
  };

  var _setShowAxes = function(stage, showAxes) {

    if(showAxes !== undefined) {
      stage.showAxes = showAxes;
    }
  };

  var _setPropagators = function(stage, propagators) {

    if(propagators === undefined) {
      throw new Error('Missing propagators!');
    }
    stage.propagators = propagators;
  };

  var _setVertices = function(stage, vertices) {

    if(vertices === undefined) {
      throw new Error('Missing vertices!');
    }
    stage.vertices = vertices;
  };

  var _setExchanges = function(stage, exchanges) {

    if(exchanges !== undefined) {
      stage.exchanges = exchanges;
    }
  };

  return StandardParser;
})();
},{"./../Stage":1}]},{},[2])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9TdGFnZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcGFyc2Vycy9MYXRleFBhcnNlci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvUGFyc2VyRmFjdG9yeS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvU3RhbmRhcmRQYXJzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFN0YWdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBHZW5lcmljIEF0dHJpYnV0ZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMudGl0bGUgICAgPSAnRmV5bm1hbic7XG4gICAgdGhpcy5sYXlvdXQgICA9ICd0aW1lLXNwYWNlJztcbiAgICB0aGlzLndpZHRoICAgID0gMTAwO1xuICAgIHRoaXMuaGVpZ2h0ICAgPSAxMDA7XG4gICAgdGhpcy5zaG93QXhlcyA9IHRydWU7XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKHJlcXVpcmVkKVxuICAgIHRoaXMucHJvcGFnYXRvcnMgPSBbXTtcbiAgICB0aGlzLnZlcnRpY2VzICAgID0gW107XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMuZXhjaGFuZ2VzICAgPSBbXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5zZXRDYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIHRoaXMuY2FudmFzLnNpemUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmNhbnZhcy50ZXh0KHRoaXMudGl0bGUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBTdGFnZTtcbn0pKCk7IiwidmFyIFBhcnNlckZhY3RvcnkgPSByZXF1aXJlKCcuL3BhcnNlcnMvUGFyc2VyRmFjdG9yeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgRmV5bm1hbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERyYXcgZGlhZ3JhbSBvbnRvIGNhbnZhcy5cbiAgICogQHBhcmFtIGNhbnZhcyBJZCBvZiBjYW52YXMgZWxlbWVudFxuICAgKiBAcGFyYW0gZGF0YSAgIERpYWdyYW0gcHJvcGVydGllc1xuICAgKi9cbiAgRmV5bm1hbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcywgZGF0YSkge1xuXG4gICAgaWYgKHR5cGVvZiBjYW52YXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgY2FudmFzI2lkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdmdDYW52YXMgID0gbmV3IFNWRyhjYW52YXMpO1xuICAgIHZhciBwYXJzZXIgICAgID0gUGFyc2VyRmFjdG9yeS5nZXRQYXJzZXIoZGF0YS5sYW5nKTtcbiAgICB2YXIgc3RhZ2UgICAgICA9IHBhcnNlci5wYXJzZShkYXRhKTtcblxuICAgIHN0YWdlLnNldENhbnZhcyhzdmdDYW52YXMpLmRyYXcoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBGZXlubWFuO1xufSkoKTsiLCJ2YXIgU3RhZ2UgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIExhdGV4UGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBMYXRleFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgU3RhZ2UoKTtcbiAgfTtcblxuICByZXR1cm4gTGF0ZXhQYXJzZXI7XG59KSgpOyIsInZhciBTdGFuZGFyZFBhcnNlciA9IHJlcXVpcmUoJy4vU3RhbmRhcmRQYXJzZXInKTtcbnZhciBMYXRleFBhcnNlciAgICA9IHJlcXVpcmUoJy4vTGF0ZXhQYXJzZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0UGFyc2VyOiBmdW5jdGlvbihsYW5nKSB7XG5cbiAgICBpZihsYW5nID09PSAnbGF0ZXgnKSB7XG4gICAgICByZXR1cm4gbmV3IExhdGV4UGFyc2VyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3RhbmRhcmRQYXJzZXIoKTtcbiAgfVxufTsiLCJ2YXIgU3RhZ2UgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIFN0YW5kYXJkUGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFuZGFyZFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdGFnZSA9IG5ldyBTdGFnZSgpO1xuXG4gICAgX3NldFRpdGxlKHN0YWdlLCBkYXRhLnRpdGxlKTtcbiAgICBfc2V0TGF5b3V0KHN0YWdlLCBkYXRhLmxheW91dCk7XG4gICAgX3NldERpbWVuc2lvbihzdGFnZSwgZGF0YS53aWR0aCwgZGF0YS5oZWlnaHQpO1xuICAgIF9zZXRTaG93QXhlcyhzdGFnZSwgZGF0YS5zaG93QXhlcyk7XG4gICAgX3NldFByb3BhZ2F0b3JzKHN0YWdlLCBkYXRhLnByb3BhZ2F0b3JzKTtcbiAgICBfc2V0VmVydGljZXMoc3RhZ2UsIGRhdGEudmVydGljZXMpO1xuICAgIF9zZXRFeGNoYW5nZXMoc3RhZ2UsIGRhdGEuZXhjaGFuZ2VzKTtcblxuICAgIHJldHVybiBzdGFnZTtcbiAgfTtcblxuICB2YXIgX3NldFRpdGxlID0gZnVuY3Rpb24oc3RhZ2UsIHRpdGxlKSB7XG5cbiAgICBpZih0aXRsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS50aXRsZSA9IHRpdGxlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldExheW91dCA9IGZ1bmN0aW9uKHN0YWdlLCBsYXlvdXQpIHtcblxuICAgIGlmKGxheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5sYXlvdXQgPSBsYXlvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0RGltZW5zaW9uID0gZnVuY3Rpb24oc3RhZ2UsIHdpZHRoLCBoZWlnaHQpIHtcblxuICAgIGlmKHdpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLndpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIGlmKGhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0U2hvd0F4ZXMgPSBmdW5jdGlvbihzdGFnZSwgc2hvd0F4ZXMpIHtcblxuICAgIGlmKHNob3dBeGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnNob3dBeGVzID0gc2hvd0F4ZXM7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0UHJvcGFnYXRvcnMgPSBmdW5jdGlvbihzdGFnZSwgcHJvcGFnYXRvcnMpIHtcblxuICAgIGlmKHByb3BhZ2F0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBwcm9wYWdhdG9ycyEnKTtcbiAgICB9XG4gICAgc3RhZ2UucHJvcGFnYXRvcnMgPSBwcm9wYWdhdG9ycztcbiAgfTtcblxuICB2YXIgX3NldFZlcnRpY2VzID0gZnVuY3Rpb24oc3RhZ2UsIHZlcnRpY2VzKSB7XG5cbiAgICBpZih2ZXJ0aWNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgdmVydGljZXMhJyk7XG4gICAgfVxuICAgIHN0YWdlLnZlcnRpY2VzID0gdmVydGljZXM7XG4gIH07XG5cbiAgdmFyIF9zZXRFeGNoYW5nZXMgPSBmdW5jdGlvbihzdGFnZSwgZXhjaGFuZ2VzKSB7XG5cbiAgICBpZihleGNoYW5nZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UuZXhjaGFuZ2VzID0gZXhjaGFuZ2VzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhbmRhcmRQYXJzZXI7XG59KSgpOyJdfQ==
(2)
});
;