!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Feynman=e():"undefined"!=typeof global?global.Feynman=e():"undefined"!=typeof self&&(self.Feynman=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./parsers/LatexParser":4,"./parsers/StandardParser":5}],2:[function(require,module,exports){
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
  };

  return Stage;
})();
},{}],3:[function(require,module,exports){
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

    var parser = new ParserFactory().getParser(data.lang);
    var parsedData = parser.parse(data);
  };

  return Feynman;
})();
},{"./ParserFactory":1}],4:[function(require,module,exports){
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
},{"./../Stage":2}],5:[function(require,module,exports){
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
},{"./../Stage":2}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9QYXJzZXJGYWN0b3J5LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvU3RhZ2UuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvTGF0ZXhQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFN0YW5kYXJkUGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyJyk7XG52YXIgTGF0ZXhQYXJzZXIgICAgPSByZXF1aXJlKCcuL3BhcnNlcnMvTGF0ZXhQYXJzZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICBcbiAgdmFyIFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gIH07XG5cbiAgUGFyc2VyLnByb3RvdHlwZS5nZXRQYXJzZXIgPSBmdW5jdGlvbihsYW5nKSB7XG5cbiAgICBpZihsYW5nID09PSAnbGF0ZXgnKSB7XG4gICAgICByZXR1cm4gbmV3IExhdGV4UGFyc2VyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3RhbmRhcmRQYXJzZXIoKTtcbiAgfTtcblxuICByZXR1cm4gUGFyc2VyO1xuXG59KSgpOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBTdGFnZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gR2VuZXJpYyBBdHRyaWJ1dGVzIChvcHRpb25hbClcbiAgICB0aGlzLnRpdGxlICAgID0gJ0ZleW5tYW4nO1xuICAgIHRoaXMubGF5b3V0ICAgPSAndGltZS1zcGFjZSc7XG4gICAgdGhpcy53aWR0aCAgICA9IDEwMDtcbiAgICB0aGlzLmhlaWdodCAgID0gMTAwO1xuICAgIHRoaXMuc2hvd0F4ZXMgPSB0cnVlO1xuXG4gICAgLy8gTWFpbiBwcm9wZXJ0aWVzIChyZXF1aXJlZClcbiAgICB0aGlzLnByb3BhZ2F0b3JzID0gW107XG4gICAgdGhpcy52ZXJ0aWNlcyAgICA9IFtdO1xuXG4gICAgLy8gTWFpbiBwcm9wZXJ0aWVzIChvcHRpb25hbClcbiAgICB0aGlzLmV4Y2hhbmdlcyAgID0gW107XG4gIH07XG5cbiAgcmV0dXJuIFN0YWdlO1xufSkoKTsiLCJ2YXIgUGFyc2VyRmFjdG9yeSA9IHJlcXVpcmUoJy4vUGFyc2VyRmFjdG9yeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgRmV5bm1hbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEZleW5tYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMsIGRhdGEpIHtcblxuICAgIGlmICh0eXBlb2YgY2FudmFzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNhbnZhcyNpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlckZhY3RvcnkoKS5nZXRQYXJzZXIoZGF0YS5sYW5nKTtcbiAgICB2YXIgcGFyc2VkRGF0YSA9IHBhcnNlci5wYXJzZShkYXRhKTtcbiAgfTtcblxuICByZXR1cm4gRmV5bm1hbjtcbn0pKCk7IiwidmFyIFN0YWdlID0gcmVxdWlyZSgnLi8uLi9TdGFnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBMYXRleFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTGF0ZXhQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFN0YWdlKCk7XG4gIH07XG5cbiAgcmV0dXJuIExhdGV4UGFyc2VyO1xufSkoKTsiLCJ2YXIgU3RhZ2UgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIFN0YW5kYXJkUGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFuZGFyZFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdGFnZSA9IG5ldyBTdGFnZSgpO1xuXG4gICAgX3NldFRpdGxlKHN0YWdlLCBkYXRhLnRpdGxlKTtcbiAgICBfc2V0TGF5b3V0KHN0YWdlLCBkYXRhLmxheW91dCk7XG4gICAgX3NldERpbWVuc2lvbihzdGFnZSwgZGF0YS53aWR0aCwgZGF0YS5oZWlnaHQpO1xuICAgIF9zZXRTaG93QXhlcyhzdGFnZSwgZGF0YS5zaG93QXhlcyk7XG4gICAgX3NldFByb3BhZ2F0b3JzKHN0YWdlLCBkYXRhLnByb3BhZ2F0b3JzKTtcbiAgICBfc2V0VmVydGljZXMoc3RhZ2UsIGRhdGEudmVydGljZXMpO1xuICAgIF9zZXRFeGNoYW5nZXMoc3RhZ2UsIGRhdGEuZXhjaGFuZ2VzKTtcblxuICAgIHJldHVybiBzdGFnZTtcbiAgfTtcblxuICB2YXIgX3NldFRpdGxlID0gZnVuY3Rpb24oc3RhZ2UsIHRpdGxlKSB7XG5cbiAgICBpZih0aXRsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS50aXRsZSA9IHRpdGxlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldExheW91dCA9IGZ1bmN0aW9uKHN0YWdlLCBsYXlvdXQpIHtcblxuICAgIGlmKGxheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5sYXlvdXQgPSBsYXlvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0RGltZW5zaW9uID0gZnVuY3Rpb24oc3RhZ2UsIHdpZHRoLCBoZWlnaHQpIHtcblxuICAgIGlmKHdpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLndpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIGlmKGhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0U2hvd0F4ZXMgPSBmdW5jdGlvbihzdGFnZSwgc2hvd0F4ZXMpIHtcblxuICAgIGlmKHNob3dBeGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnNob3dBeGVzID0gc2hvd0F4ZXM7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0UHJvcGFnYXRvcnMgPSBmdW5jdGlvbihzdGFnZSwgcHJvcGFnYXRvcnMpIHtcblxuICAgIGlmKHByb3BhZ2F0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBwcm9wYWdhdG9ycyEnKTtcbiAgICB9XG4gICAgc3RhZ2UucHJvcGFnYXRvcnMgPSBwcm9wYWdhdG9ycztcbiAgfTtcblxuICB2YXIgX3NldFZlcnRpY2VzID0gZnVuY3Rpb24oc3RhZ2UsIHZlcnRpY2VzKSB7XG5cbiAgICBpZih2ZXJ0aWNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgdmVydGljZXMhJyk7XG4gICAgfVxuICAgIHN0YWdlLnZlcnRpY2VzID0gdmVydGljZXM7XG4gIH07XG5cbiAgdmFyIF9zZXRFeGNoYW5nZXMgPSBmdW5jdGlvbihzdGFnZSwgZXhjaGFuZ2VzKSB7XG5cbiAgICBpZihleGNoYW5nZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UuZXhjaGFuZ2VzID0gZXhjaGFuZ2VzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhbmRhcmRQYXJzZXI7XG59KSgpOyJdfQ==
(3)
});
;