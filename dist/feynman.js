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

    this.canvas.text(this.title).font({
      family : 'Helvetica',
      size   : 14,
      anchor : 'left'
    });
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9TdGFnZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcGFyc2Vycy9MYXRleFBhcnNlci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvUGFyc2VyRmFjdG9yeS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvU3RhbmRhcmRQYXJzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgU3RhZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIEdlbmVyaWMgQXR0cmlidXRlcyAob3B0aW9uYWwpXG4gICAgdGhpcy50aXRsZSAgICA9ICdGZXlubWFuJztcbiAgICB0aGlzLmxheW91dCAgID0gJ3RpbWUtc3BhY2UnO1xuICAgIHRoaXMud2lkdGggICAgPSAxMDA7XG4gICAgdGhpcy5oZWlnaHQgICA9IDEwMDtcbiAgICB0aGlzLnNob3dBeGVzID0gdHJ1ZTtcblxuICAgIC8vIE1haW4gcHJvcGVydGllcyAocmVxdWlyZWQpXG4gICAgdGhpcy5wcm9wYWdhdG9ycyA9IFtdO1xuICAgIHRoaXMudmVydGljZXMgICAgPSBbXTtcblxuICAgIC8vIE1haW4gcHJvcGVydGllcyAob3B0aW9uYWwpXG4gICAgdGhpcy5leGNoYW5nZXMgICA9IFtdO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhZ2UucHJvdG90eXBlLnNldENhbnZhcyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgdGhpcy5jYW52YXMuc2l6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhZ2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuY2FudmFzLnRleHQodGhpcy50aXRsZSkuZm9udCh7XG4gICAgICBmYW1pbHkgOiAnSGVsdmV0aWNhJyxcbiAgICAgIHNpemUgICA6IDE0LFxuICAgICAgYW5jaG9yIDogJ2xlZnQnXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIFN0YWdlO1xufSkoKTsiLCJ2YXIgUGFyc2VyRmFjdG9yeSA9IHJlcXVpcmUoJy4vcGFyc2Vycy9QYXJzZXJGYWN0b3J5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBGZXlubWFuID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogRHJhdyBkaWFncmFtIG9udG8gY2FudmFzLlxuICAgKiBAcGFyYW0gY2FudmFzIElkIG9mIGNhbnZhcyBlbGVtZW50XG4gICAqIEBwYXJhbSBkYXRhICAgRGlhZ3JhbSBwcm9wZXJ0aWVzXG4gICAqL1xuICBGZXlubWFuLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzLCBkYXRhKSB7XG5cbiAgICBpZiAodHlwZW9mIGNhbnZhcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBjYW52YXMjaWQgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgdmFyIHN2Z0NhbnZhcyAgPSBuZXcgU1ZHKGNhbnZhcyk7XG4gICAgdmFyIHBhcnNlciAgICAgPSBQYXJzZXJGYWN0b3J5LmdldFBhcnNlcihkYXRhLmxhbmcpO1xuICAgIHZhciBzdGFnZSAgICAgID0gcGFyc2VyLnBhcnNlKGRhdGEpO1xuXG4gICAgc3RhZ2Uuc2V0Q2FudmFzKHN2Z0NhbnZhcykuZHJhdygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIEZleW5tYW47XG59KSgpOyIsInZhciBTdGFnZSA9IHJlcXVpcmUoJy4vLi4vU3RhZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIFxuICB2YXIgTGF0ZXhQYXJzZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIExhdGV4UGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTdGFnZSgpO1xuICB9O1xuXG4gIHJldHVybiBMYXRleFBhcnNlcjtcbn0pKCk7IiwidmFyIFN0YW5kYXJkUGFyc2VyID0gcmVxdWlyZSgnLi9TdGFuZGFyZFBhcnNlcicpO1xudmFyIExhdGV4UGFyc2VyICAgID0gcmVxdWlyZSgnLi9MYXRleFBhcnNlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXRQYXJzZXI6IGZ1bmN0aW9uKGxhbmcpIHtcblxuICAgIGlmKGxhbmcgPT09ICdsYXRleCcpIHtcbiAgICAgIHJldHVybiBuZXcgTGF0ZXhQYXJzZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTdGFuZGFyZFBhcnNlcigpO1xuICB9XG59OyIsInZhciBTdGFnZSA9IHJlcXVpcmUoJy4vLi4vU3RhZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIFxuICB2YXIgU3RhbmRhcmRQYXJzZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YW5kYXJkUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgdmFyIHN0YWdlID0gbmV3IFN0YWdlKCk7XG5cbiAgICBfc2V0VGl0bGUoc3RhZ2UsIGRhdGEudGl0bGUpO1xuICAgIF9zZXRMYXlvdXQoc3RhZ2UsIGRhdGEubGF5b3V0KTtcbiAgICBfc2V0RGltZW5zaW9uKHN0YWdlLCBkYXRhLndpZHRoLCBkYXRhLmhlaWdodCk7XG4gICAgX3NldFNob3dBeGVzKHN0YWdlLCBkYXRhLnNob3dBeGVzKTtcbiAgICBfc2V0UHJvcGFnYXRvcnMoc3RhZ2UsIGRhdGEucHJvcGFnYXRvcnMpO1xuICAgIF9zZXRWZXJ0aWNlcyhzdGFnZSwgZGF0YS52ZXJ0aWNlcyk7XG4gICAgX3NldEV4Y2hhbmdlcyhzdGFnZSwgZGF0YS5leGNoYW5nZXMpO1xuXG4gICAgcmV0dXJuIHN0YWdlO1xuICB9O1xuXG4gIHZhciBfc2V0VGl0bGUgPSBmdW5jdGlvbihzdGFnZSwgdGl0bGUpIHtcblxuICAgIGlmKHRpdGxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnRpdGxlID0gdGl0bGU7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0TGF5b3V0ID0gZnVuY3Rpb24oc3RhZ2UsIGxheW91dCkge1xuXG4gICAgaWYobGF5b3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmxheW91dCA9IGxheW91dDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXREaW1lbnNpb24gPSBmdW5jdGlvbihzdGFnZSwgd2lkdGgsIGhlaWdodCkge1xuXG4gICAgaWYod2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2Uud2lkdGggPSB3aWR0aDtcbiAgICB9XG4gICAgaWYoaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmhlaWdodCA9IGhlaWdodDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRTaG93QXhlcyA9IGZ1bmN0aW9uKHN0YWdlLCBzaG93QXhlcykge1xuXG4gICAgaWYoc2hvd0F4ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2Uuc2hvd0F4ZXMgPSBzaG93QXhlcztcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRQcm9wYWdhdG9ycyA9IGZ1bmN0aW9uKHN0YWdlLCBwcm9wYWdhdG9ycykge1xuXG4gICAgaWYocHJvcGFnYXRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHByb3BhZ2F0b3JzIScpO1xuICAgIH1cbiAgICBzdGFnZS5wcm9wYWdhdG9ycyA9IHByb3BhZ2F0b3JzO1xuICB9O1xuXG4gIHZhciBfc2V0VmVydGljZXMgPSBmdW5jdGlvbihzdGFnZSwgdmVydGljZXMpIHtcblxuICAgIGlmKHZlcnRpY2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyB2ZXJ0aWNlcyEnKTtcbiAgICB9XG4gICAgc3RhZ2UudmVydGljZXMgPSB2ZXJ0aWNlcztcbiAgfTtcblxuICB2YXIgX3NldEV4Y2hhbmdlcyA9IGZ1bmN0aW9uKHN0YWdlLCBleGNoYW5nZXMpIHtcblxuICAgIGlmKGV4Y2hhbmdlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5leGNoYW5nZXMgPSBleGNoYW5nZXM7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTdGFuZGFyZFBhcnNlcjtcbn0pKCk7Il19
(2)
});
;