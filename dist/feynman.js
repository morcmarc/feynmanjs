!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Feynman=e():"undefined"!=typeof global?global.Feynman=e():"undefined"!=typeof self&&(self.Feynman=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Electron = require('./propagators/Electron');
var Quark    = require('./propagators/Quark');
var Gluon    = require('./propagators/Gluon');

module.exports = {

  getParticle: function(data) {

    if(data === undefined) {
      throw new Error('Missing data argument!');
    }

    if(data.type === 'e-') {
      return new Electron(data.id, false, data.color, data.length);
    }

    if(data.type === 'e+') {
      return new Electron(data.id, true, data.color, data.length);
    }

    if(data.type === 'q') {
      return new Quark(data.id, false, data.color, data.length);
    }

    if(data.type === 'aq') {
      return new Quark(data.id, true, data.color, data.length);
    }

    if(data.type === 'g') {
      return new Gluon(data.id, data.color, data.length);
    }
  }
};
},{"./propagators/Electron":9,"./propagators/Gluon":10,"./propagators/Quark":11}],2:[function(require,module,exports){
var ParticleGenerator = require('./ParticleGenerator');

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

    _drawTitle(this);
    return this;
  };

  var _drawTitle = function(ctx) {

    ctx.canvas.text(ctx.title).font({
      family : 'Helvetica',
      size   : 14,
      anchor : 'left'
    });
  };

  return Stage;
})();
},{"./ParticleGenerator":1}],3:[function(require,module,exports){
var __hasProp = {}.hasOwnProperty;

module.exports = {
  __extends: function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
};
},{}],4:[function(require,module,exports){
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
},{"./parsers/ParserFactory":6}],5:[function(require,module,exports){
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
},{"./../Stage":2}],6:[function(require,module,exports){
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
},{"./LatexParser":5,"./StandardParser":7}],7:[function(require,module,exports){
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
},{"./../Stage":2}],8:[function(require,module,exports){
module.exports = (function() {

  var _color  = '#000';
  var _length = 100;

  var AbstractParticle = function(id, anti, color, length) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    this.anti   = anti;
    this.color  = color  || _color;
    this.length = length || _length;

    return this;
  };

  AbstractParticle.prototype.draw = function() {

    throw new Error('Cannot call abstract method!');
  };

  return AbstractParticle;

})();
},{}],9:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Electron, _super);

  function Electron(id, anti, color, length) {

    Electron.__super__.constructor.apply(this, [id, anti || false, color, length]);
  }

  Electron.prototype.draw = function(canvas) {

    canvas.line(0, 0, this.length, 0).fill(this.color).stroke({
      width: 1,
      color: this.color
    });

    var polygonString, x1, x2, x3, y1, y2, y3;
    x1 = this.length / 2 + 5;
    y1 = 0;
    x2 = this.length / 2 - 5;
    y2 = 3;
    x3 = this.length / 2 - 5;
    y3 = -3;
    polygonString = '' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3;

    canvas.polygon(polygonString).fill(this.color);
  };

  return Electron;

})(AbstractParticle);
},{"./../helpers/Klass":3,"./AbstractParticle":8}],10:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Gluon, _super);

  function Gluon(id, color, length) {

    Gluon.__super__.constructor.apply(this, [id, undefined, color || '#009933', length]);
  }

  Gluon.prototype.draw = function(canvas) {

  };

  return Gluon;

})(AbstractParticle);
},{"./../helpers/Klass":3,"./AbstractParticle":8}],11:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Quark, _super);

  function Quark(id, anti, color, length) {

    Quark.__super__.constructor.apply(this, [id, anti || false, color, length]);
  }

  Quark.prototype.draw = function(canvas) {

  };

  return Quark;

})(AbstractParticle);
},{"./../helpers/Klass":3,"./AbstractParticle":8}]},{},[4])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9QYXJ0aWNsZUdlbmVyYXRvci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1N0YWdlLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvaGVscGVycy9LbGFzcy5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcGFyc2Vycy9MYXRleFBhcnNlci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvUGFyc2VyRmFjdG9yeS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvU3RhbmRhcmRQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9BYnN0cmFjdFBhcnRpY2xlLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvRWxlY3Ryb24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9HbHVvbi5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL1F1YXJrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEVsZWN0cm9uID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9FbGVjdHJvbicpO1xudmFyIFF1YXJrICAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9RdWFyaycpO1xudmFyIEdsdW9uICAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9HbHVvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXRQYXJ0aWNsZTogZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdlLScpIHtcbiAgICAgIHJldHVybiBuZXcgRWxlY3Ryb24oZGF0YS5pZCwgZmFsc2UsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdlKycpIHtcbiAgICAgIHJldHVybiBuZXcgRWxlY3Ryb24oZGF0YS5pZCwgdHJ1ZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ3EnKSB7XG4gICAgICByZXR1cm4gbmV3IFF1YXJrKGRhdGEuaWQsIGZhbHNlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnYXEnKSB7XG4gICAgICByZXR1cm4gbmV3IFF1YXJrKGRhdGEuaWQsIHRydWUsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdnJykge1xuICAgICAgcmV0dXJuIG5ldyBHbHVvbihkYXRhLmlkLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuICB9XG59OyIsInZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vUGFydGljbGVHZW5lcmF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFN0YWdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBHZW5lcmljIEF0dHJpYnV0ZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMudGl0bGUgICAgPSAnRmV5bm1hbic7XG4gICAgdGhpcy5sYXlvdXQgICA9ICd0aW1lLXNwYWNlJztcbiAgICB0aGlzLndpZHRoICAgID0gMTAwO1xuICAgIHRoaXMuaGVpZ2h0ICAgPSAxMDA7XG4gICAgdGhpcy5zaG93QXhlcyA9IHRydWU7XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKHJlcXVpcmVkKVxuICAgIHRoaXMucHJvcGFnYXRvcnMgPSBbXTtcbiAgICB0aGlzLnZlcnRpY2VzICAgID0gW107XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMuZXhjaGFuZ2VzICAgPSBbXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5zZXRDYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIHRoaXMuY2FudmFzLnNpemUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBfZHJhd1RpdGxlKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBfZHJhd1RpdGxlID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHguY2FudmFzLnRleHQoY3R4LnRpdGxlKS5mb250KHtcbiAgICAgIGZhbWlseSA6ICdIZWx2ZXRpY2EnLFxuICAgICAgc2l6ZSAgIDogMTQsXG4gICAgICBhbmNob3IgOiAnbGVmdCdcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gU3RhZ2U7XG59KSgpOyIsInZhciBfX2hhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIF9fZXh0ZW5kczogZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH1cbn07IiwidmFyIFBhcnNlckZhY3RvcnkgPSByZXF1aXJlKCcuL3BhcnNlcnMvUGFyc2VyRmFjdG9yeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgRmV5bm1hbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERyYXcgZGlhZ3JhbSBvbnRvIGNhbnZhcy5cbiAgICogQHBhcmFtIGNhbnZhcyBJZCBvZiBjYW52YXMgZWxlbWVudFxuICAgKiBAcGFyYW0gZGF0YSAgIERpYWdyYW0gcHJvcGVydGllc1xuICAgKi9cbiAgRmV5bm1hbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcywgZGF0YSkge1xuXG4gICAgaWYgKHR5cGVvZiBjYW52YXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgY2FudmFzI2lkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdmdDYW52YXMgID0gbmV3IFNWRyhjYW52YXMpO1xuICAgIHZhciBwYXJzZXIgICAgID0gUGFyc2VyRmFjdG9yeS5nZXRQYXJzZXIoZGF0YS5sYW5nKTtcbiAgICB2YXIgc3RhZ2UgICAgICA9IHBhcnNlci5wYXJzZShkYXRhKTtcblxuICAgIHN0YWdlLnNldENhbnZhcyhzdmdDYW52YXMpLmRyYXcoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBGZXlubWFuO1xufSkoKTsiLCJ2YXIgU3RhZ2UgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIExhdGV4UGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBMYXRleFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgU3RhZ2UoKTtcbiAgfTtcblxuICByZXR1cm4gTGF0ZXhQYXJzZXI7XG59KSgpOyIsInZhciBTdGFuZGFyZFBhcnNlciA9IHJlcXVpcmUoJy4vU3RhbmRhcmRQYXJzZXInKTtcbnZhciBMYXRleFBhcnNlciAgICA9IHJlcXVpcmUoJy4vTGF0ZXhQYXJzZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0UGFyc2VyOiBmdW5jdGlvbihsYW5nKSB7XG5cbiAgICBpZihsYW5nID09PSAnbGF0ZXgnKSB7XG4gICAgICByZXR1cm4gbmV3IExhdGV4UGFyc2VyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3RhbmRhcmRQYXJzZXIoKTtcbiAgfVxufTsiLCJ2YXIgU3RhZ2UgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIFN0YW5kYXJkUGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFuZGFyZFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdGFnZSA9IG5ldyBTdGFnZSgpO1xuXG4gICAgX3NldFRpdGxlKHN0YWdlLCBkYXRhLnRpdGxlKTtcbiAgICBfc2V0TGF5b3V0KHN0YWdlLCBkYXRhLmxheW91dCk7XG4gICAgX3NldERpbWVuc2lvbihzdGFnZSwgZGF0YS53aWR0aCwgZGF0YS5oZWlnaHQpO1xuICAgIF9zZXRTaG93QXhlcyhzdGFnZSwgZGF0YS5zaG93QXhlcyk7XG4gICAgX3NldFByb3BhZ2F0b3JzKHN0YWdlLCBkYXRhLnByb3BhZ2F0b3JzKTtcbiAgICBfc2V0VmVydGljZXMoc3RhZ2UsIGRhdGEudmVydGljZXMpO1xuICAgIF9zZXRFeGNoYW5nZXMoc3RhZ2UsIGRhdGEuZXhjaGFuZ2VzKTtcblxuICAgIHJldHVybiBzdGFnZTtcbiAgfTtcblxuICB2YXIgX3NldFRpdGxlID0gZnVuY3Rpb24oc3RhZ2UsIHRpdGxlKSB7XG5cbiAgICBpZih0aXRsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS50aXRsZSA9IHRpdGxlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldExheW91dCA9IGZ1bmN0aW9uKHN0YWdlLCBsYXlvdXQpIHtcblxuICAgIGlmKGxheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5sYXlvdXQgPSBsYXlvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0RGltZW5zaW9uID0gZnVuY3Rpb24oc3RhZ2UsIHdpZHRoLCBoZWlnaHQpIHtcblxuICAgIGlmKHdpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLndpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIGlmKGhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0U2hvd0F4ZXMgPSBmdW5jdGlvbihzdGFnZSwgc2hvd0F4ZXMpIHtcblxuICAgIGlmKHNob3dBeGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnNob3dBeGVzID0gc2hvd0F4ZXM7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0UHJvcGFnYXRvcnMgPSBmdW5jdGlvbihzdGFnZSwgcHJvcGFnYXRvcnMpIHtcblxuICAgIGlmKHByb3BhZ2F0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBwcm9wYWdhdG9ycyEnKTtcbiAgICB9XG4gICAgc3RhZ2UucHJvcGFnYXRvcnMgPSBwcm9wYWdhdG9ycztcbiAgfTtcblxuICB2YXIgX3NldFZlcnRpY2VzID0gZnVuY3Rpb24oc3RhZ2UsIHZlcnRpY2VzKSB7XG5cbiAgICBpZih2ZXJ0aWNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgdmVydGljZXMhJyk7XG4gICAgfVxuICAgIHN0YWdlLnZlcnRpY2VzID0gdmVydGljZXM7XG4gIH07XG5cbiAgdmFyIF9zZXRFeGNoYW5nZXMgPSBmdW5jdGlvbihzdGFnZSwgZXhjaGFuZ2VzKSB7XG5cbiAgICBpZihleGNoYW5nZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UuZXhjaGFuZ2VzID0gZXhjaGFuZ2VzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhbmRhcmRQYXJzZXI7XG59KSgpOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBfY29sb3IgID0gJyMwMDAnO1xuICB2YXIgX2xlbmd0aCA9IDEwMDtcblxuICB2YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IGZ1bmN0aW9uKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBpZihpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgaWQgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgdGhpcy5hbnRpICAgPSBhbnRpO1xuICAgIHRoaXMuY29sb3IgID0gY29sb3IgIHx8IF9jb2xvcjtcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aCB8fCBfbGVuZ3RoO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgQWJzdHJhY3RQYXJ0aWNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBhYnN0cmFjdCBtZXRob2QhJyk7XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0UGFydGljbGU7XG5cbn0pKCk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhFbGVjdHJvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBFbGVjdHJvbihpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgRWxlY3Ryb24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgYW50aSB8fCBmYWxzZSwgY29sb3IsIGxlbmd0aF0pO1xuICB9XG5cbiAgRWxlY3Ryb24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIGNhbnZhcy5saW5lKDAsIDAsIHRoaXMubGVuZ3RoLCAwKS5maWxsKHRoaXMuY29sb3IpLnN0cm9rZSh7XG4gICAgICB3aWR0aDogMSxcbiAgICAgIGNvbG9yOiB0aGlzLmNvbG9yXG4gICAgfSk7XG5cbiAgICB2YXIgcG9seWdvblN0cmluZywgeDEsIHgyLCB4MywgeTEsIHkyLCB5MztcbiAgICB4MSA9IHRoaXMubGVuZ3RoIC8gMiArIDU7XG4gICAgeTEgPSAwO1xuICAgIHgyID0gdGhpcy5sZW5ndGggLyAyIC0gNTtcbiAgICB5MiA9IDM7XG4gICAgeDMgPSB0aGlzLmxlbmd0aCAvIDIgLSA1O1xuICAgIHkzID0gLTM7XG4gICAgcG9seWdvblN0cmluZyA9ICcnICsgeDEgKyAnLCcgKyB5MSArICcgJyArIHgyICsgJywnICsgeTIgKyAnICcgKyB4MyArICcsJyArIHkzO1xuXG4gICAgY2FudmFzLnBvbHlnb24ocG9seWdvblN0cmluZykuZmlsbCh0aGlzLmNvbG9yKTtcbiAgfTtcblxuICByZXR1cm4gRWxlY3Ryb247XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoR2x1b24sIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gR2x1b24oaWQsIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIEdsdW9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIHVuZGVmaW5lZCwgY29sb3IgfHwgJyMwMDk5MzMnLCBsZW5ndGhdKTtcbiAgfVxuXG4gIEdsdW9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgfTtcblxuICByZXR1cm4gR2x1b247XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoUXVhcmssIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gUXVhcmsoaWQsIGFudGksIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIFF1YXJrLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIGFudGkgfHwgZmFsc2UsIGNvbG9yLCBsZW5ndGhdKTtcbiAgfVxuXG4gIFF1YXJrLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgfTtcblxuICByZXR1cm4gUXVhcms7XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyJdfQ==
(4)
});
;