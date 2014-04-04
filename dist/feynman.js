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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9TdGFnZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcGFyc2Vycy9MYXRleFBhcnNlci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvUGFyc2VyRmFjdG9yeS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvU3RhbmRhcmRQYXJzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBTdGFnZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gR2VuZXJpYyBBdHRyaWJ1dGVzIChvcHRpb25hbClcbiAgICB0aGlzLnRpdGxlICAgID0gJ0ZleW5tYW4nO1xuICAgIHRoaXMubGF5b3V0ICAgPSAndGltZS1zcGFjZSc7XG4gICAgdGhpcy53aWR0aCAgICA9IDEwMDtcbiAgICB0aGlzLmhlaWdodCAgID0gMTAwO1xuICAgIHRoaXMuc2hvd0F4ZXMgPSB0cnVlO1xuXG4gICAgLy8gTWFpbiBwcm9wZXJ0aWVzIChyZXF1aXJlZClcbiAgICB0aGlzLnByb3BhZ2F0b3JzID0gW107XG4gICAgdGhpcy52ZXJ0aWNlcyAgICA9IFtdO1xuXG4gICAgLy8gTWFpbiBwcm9wZXJ0aWVzIChvcHRpb25hbClcbiAgICB0aGlzLmV4Y2hhbmdlcyAgID0gW107XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFnZS5wcm90b3R5cGUuc2V0Q2FudmFzID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFnZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5jYW52YXMudGV4dCh0aGlzLnRpdGxlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gU3RhZ2U7XG59KSgpOyIsInZhciBQYXJzZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9wYXJzZXJzL1BhcnNlckZhY3RvcnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEZleW5tYW4gPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEcmF3IGRpYWdyYW0gb250byBjYW52YXMuXG4gICAqIEBwYXJhbSBjYW52YXMgSWQgb2YgY2FudmFzIGVsZW1lbnRcbiAgICogQHBhcmFtIGRhdGEgICBEaWFncmFtIHByb3BlcnRpZXNcbiAgICovXG4gIEZleW5tYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMsIGRhdGEpIHtcblxuICAgIGlmICh0eXBlb2YgY2FudmFzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNhbnZhcyNpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3ZnQ2FudmFzICA9IG5ldyBTVkcoY2FudmFzKTtcbiAgICB2YXIgcGFyc2VyICAgICA9IFBhcnNlckZhY3RvcnkuZ2V0UGFyc2VyKGRhdGEubGFuZyk7XG4gICAgdmFyIHN0YWdlICAgICAgPSBwYXJzZXIucGFyc2UoZGF0YSk7XG5cbiAgICBzdGFnZS5zZXRDYW52YXMoc3ZnQ2FudmFzKS5kcmF3KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gRmV5bm1hbjtcbn0pKCk7IiwidmFyIFN0YWdlID0gcmVxdWlyZSgnLi8uLi9TdGFnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBMYXRleFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTGF0ZXhQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFN0YWdlKCk7XG4gIH07XG5cbiAgcmV0dXJuIExhdGV4UGFyc2VyO1xufSkoKTsiLCJ2YXIgU3RhbmRhcmRQYXJzZXIgPSByZXF1aXJlKCcuL1N0YW5kYXJkUGFyc2VyJyk7XG52YXIgTGF0ZXhQYXJzZXIgICAgPSByZXF1aXJlKCcuL0xhdGV4UGFyc2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldFBhcnNlcjogZnVuY3Rpb24obGFuZykge1xuXG4gICAgaWYobGFuZyA9PT0gJ2xhdGV4Jykge1xuICAgICAgcmV0dXJuIG5ldyBMYXRleFBhcnNlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN0YW5kYXJkUGFyc2VyKCk7XG4gIH1cbn07IiwidmFyIFN0YWdlID0gcmVxdWlyZSgnLi8uLi9TdGFnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBTdGFuZGFyZFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhbmRhcmRQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcblxuICAgIF9zZXRUaXRsZShzdGFnZSwgZGF0YS50aXRsZSk7XG4gICAgX3NldExheW91dChzdGFnZSwgZGF0YS5sYXlvdXQpO1xuICAgIF9zZXREaW1lbnNpb24oc3RhZ2UsIGRhdGEud2lkdGgsIGRhdGEuaGVpZ2h0KTtcbiAgICBfc2V0U2hvd0F4ZXMoc3RhZ2UsIGRhdGEuc2hvd0F4ZXMpO1xuICAgIF9zZXRQcm9wYWdhdG9ycyhzdGFnZSwgZGF0YS5wcm9wYWdhdG9ycyk7XG4gICAgX3NldFZlcnRpY2VzKHN0YWdlLCBkYXRhLnZlcnRpY2VzKTtcbiAgICBfc2V0RXhjaGFuZ2VzKHN0YWdlLCBkYXRhLmV4Y2hhbmdlcyk7XG5cbiAgICByZXR1cm4gc3RhZ2U7XG4gIH07XG5cbiAgdmFyIF9zZXRUaXRsZSA9IGZ1bmN0aW9uKHN0YWdlLCB0aXRsZSkge1xuXG4gICAgaWYodGl0bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UudGl0bGUgPSB0aXRsZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRMYXlvdXQgPSBmdW5jdGlvbihzdGFnZSwgbGF5b3V0KSB7XG5cbiAgICBpZihsYXlvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UubGF5b3V0ID0gbGF5b3V0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldERpbWVuc2lvbiA9IGZ1bmN0aW9uKHN0YWdlLCB3aWR0aCwgaGVpZ2h0KSB7XG5cbiAgICBpZih3aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS53aWR0aCA9IHdpZHRoO1xuICAgIH1cbiAgICBpZihoZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFNob3dBeGVzID0gZnVuY3Rpb24oc3RhZ2UsIHNob3dBeGVzKSB7XG5cbiAgICBpZihzaG93QXhlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5zaG93QXhlcyA9IHNob3dBeGVzO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFByb3BhZ2F0b3JzID0gZnVuY3Rpb24oc3RhZ2UsIHByb3BhZ2F0b3JzKSB7XG5cbiAgICBpZihwcm9wYWdhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcHJvcGFnYXRvcnMhJyk7XG4gICAgfVxuICAgIHN0YWdlLnByb3BhZ2F0b3JzID0gcHJvcGFnYXRvcnM7XG4gIH07XG5cbiAgdmFyIF9zZXRWZXJ0aWNlcyA9IGZ1bmN0aW9uKHN0YWdlLCB2ZXJ0aWNlcykge1xuXG4gICAgaWYodmVydGljZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHZlcnRpY2VzIScpO1xuICAgIH1cbiAgICBzdGFnZS52ZXJ0aWNlcyA9IHZlcnRpY2VzO1xuICB9O1xuXG4gIHZhciBfc2V0RXhjaGFuZ2VzID0gZnVuY3Rpb24oc3RhZ2UsIGV4Y2hhbmdlcykge1xuXG4gICAgaWYoZXhjaGFuZ2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmV4Y2hhbmdlcyA9IGV4Y2hhbmdlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFN0YW5kYXJkUGFyc2VyO1xufSkoKTsiXX0=
(2)
});
;