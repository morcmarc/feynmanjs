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
},{"./propagators/Electron":10,"./propagators/Gluon":11,"./propagators/Quark":12}],2:[function(require,module,exports){
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
    _drawVertices(this);
    return this;
  };

  var _drawTitle = function(ctx) {

    ctx.canvas.text(ctx.title).font({
      family : 'Helvetica',
      size   : 14,
      anchor : 'left'
    });
  };

  var _drawVertices = function(ctx) {

    ctx.vertices.forEach(function(vertex) {
      vertex.draw(ctx.canvas);
    });
  };

  return Stage;
})();
},{}],3:[function(require,module,exports){
module.exports = (function() {

  var Vertex = function(id, inbound, outbound) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    if(inbound === undefined && outbound === undefined) {
      throw new Error('Vertices must have either an inbound or outbound attribute!');
    }

    if(inbound !== undefined && inbound.length === 0 && outbound !== undefined && outbound.length === 0) {
      throw new Error('Vertices must have either an inbound or outbound attribute!');
    }

    this.id       = id;
    this.inbound  = inbound  || [];
    this.outbound = outbound || [];

    return this;
  };

  Vertex.prototype.draw = function(canvas) {

    canvas.circle(3).fill({ color: '#000' });
  };

  return Vertex;
})();
},{}],4:[function(require,module,exports){
var __hasProp = {}.hasOwnProperty;

module.exports = {
  __extends: function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
};
},{}],5:[function(require,module,exports){
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
},{"./parsers/ParserFactory":7}],6:[function(require,module,exports){
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
},{"./../Stage":2}],7:[function(require,module,exports){
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
},{"./LatexParser":6,"./StandardParser":8}],8:[function(require,module,exports){
var Stage             = require('./../Stage');
var ParticleGenerator = require('./../ParticleGenerator');
var Vertex            = require('./../Vertex');

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

    propagators.forEach(function(propagatorAttributes) {

      var p = ParticleGenerator.getParticle(propagatorAttributes);

      if(p !== undefined) {
        stage.propagators.push(p);
      }
    });
  };

  var _setVertices = function(stage, vertices) {

    if(vertices === undefined) {
      throw new Error('Missing vertices!');
    }

    vertices.forEach(function(vertexAttributes) {

      var v = new Vertex(vertexAttributes.id, vertexAttributes.inbound, vertexAttributes.outbound);

      if(v !== undefined) {
        stage.vertices.push(v);
      }
    });
  };

  var _setExchanges = function(stage, exchanges) {

    if(exchanges !== undefined) {
      stage.exchanges = exchanges;
    }
  };

  return StandardParser;
})();
},{"./../ParticleGenerator":1,"./../Stage":2,"./../Vertex":3}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{"./../helpers/Klass":4,"./AbstractParticle":9}],11:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Gluon, _super);

  function Gluon(id, color, length) {

    Gluon.__super__.constructor.apply(this, [id, undefined, color || '#009933', length]);
  }

  Gluon.prototype.draw = function(canvas) {

    var loopLength = 12;
    var loops      = Math.floor(this.length / loopLength);
    var pathString = '';

    for(var i = 0; i < loops; i++) {

      if(i === 0) {
        pathString += 'M';
      }

      pathString += (i * 12) + ',1 Q' + (i * 12 + 3) + ',1 ' + (i * 12 + 6) + ',2 Q' + (i * 12 + 9) + ',4 ' + (i * 12 + 10) + ',9 Q' + (i * 12 + 12) + ',15 ' + (i * 12 + 6) + ',15 Q' + (i * 12) + ',15 ' + (i * 12 + 2) + ',9 Q' + (i * 12 + 3) + ',4 ' + (i * 12 + 6) + ',2 Q' + (i * 12 + 9) + ',1 '

      if(i + 1 === loops) {
        pathString += (i * 12 + 12) + ',0'
      }
    }

    if(canvas) {

      canvas.path(pathString, true).fill('none').stroke({ width: 1, color: this.color });
      return;
    }

    return pathString;
  };

  return Gluon;

})(AbstractParticle);
},{"./../helpers/Klass":4,"./AbstractParticle":9}],12:[function(require,module,exports){
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
},{"./../helpers/Klass":4,"./AbstractParticle":9}]},{},[5])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9QYXJ0aWNsZUdlbmVyYXRvci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1N0YWdlLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvVmVydGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvaGVscGVycy9LbGFzcy5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcGFyc2Vycy9MYXRleFBhcnNlci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvUGFyc2VyRmFjdG9yeS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvU3RhbmRhcmRQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9BYnN0cmFjdFBhcnRpY2xlLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvRWxlY3Ryb24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9HbHVvbi5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL1F1YXJrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgRWxlY3Ryb24gPSByZXF1aXJlKCcuL3Byb3BhZ2F0b3JzL0VsZWN0cm9uJyk7XG52YXIgUXVhcmsgICAgPSByZXF1aXJlKCcuL3Byb3BhZ2F0b3JzL1F1YXJrJyk7XG52YXIgR2x1b24gICAgPSByZXF1aXJlKCcuL3Byb3BhZ2F0b3JzL0dsdW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldFBhcnRpY2xlOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2UtJykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVjdHJvbihkYXRhLmlkLCBmYWxzZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2UrJykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVjdHJvbihkYXRhLmlkLCB0cnVlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAncScpIHtcbiAgICAgIHJldHVybiBuZXcgUXVhcmsoZGF0YS5pZCwgZmFsc2UsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdhcScpIHtcbiAgICAgIHJldHVybiBuZXcgUXVhcmsoZGF0YS5pZCwgdHJ1ZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2cnKSB7XG4gICAgICByZXR1cm4gbmV3IEdsdW9uKGRhdGEuaWQsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFN0YWdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBHZW5lcmljIEF0dHJpYnV0ZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMudGl0bGUgICAgPSAnRmV5bm1hbic7XG4gICAgdGhpcy5sYXlvdXQgICA9ICd0aW1lLXNwYWNlJztcbiAgICB0aGlzLndpZHRoICAgID0gMTAwO1xuICAgIHRoaXMuaGVpZ2h0ICAgPSAxMDA7XG4gICAgdGhpcy5zaG93QXhlcyA9IHRydWU7XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKHJlcXVpcmVkKVxuICAgIHRoaXMucHJvcGFnYXRvcnMgPSBbXTtcbiAgICB0aGlzLnZlcnRpY2VzICAgID0gW107XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMuZXhjaGFuZ2VzICAgPSBbXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5zZXRDYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIHRoaXMuY2FudmFzLnNpemUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBfZHJhd1RpdGxlKHRoaXMpO1xuICAgIF9kcmF3VmVydGljZXModGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIF9kcmF3VGl0bGUgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC5jYW52YXMudGV4dChjdHgudGl0bGUpLmZvbnQoe1xuICAgICAgZmFtaWx5IDogJ0hlbHZldGljYScsXG4gICAgICBzaXplICAgOiAxNCxcbiAgICAgIGFuY2hvciA6ICdsZWZ0J1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZHJhd1ZlcnRpY2VzID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHgudmVydGljZXMuZm9yRWFjaChmdW5jdGlvbih2ZXJ0ZXgpIHtcbiAgICAgIHZlcnRleC5kcmF3KGN0eC5jYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBTdGFnZTtcbn0pKCk7IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFZlcnRleCA9IGZ1bmN0aW9uKGlkLCBpbmJvdW5kLCBvdXRib3VuZCkge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgPT09IHVuZGVmaW5lZCAmJiBvdXRib3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgaWYoaW5ib3VuZCAhPT0gdW5kZWZpbmVkICYmIGluYm91bmQubGVuZ3RoID09PSAwICYmIG91dGJvdW5kICE9PSB1bmRlZmluZWQgJiYgb3V0Ym91bmQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgICA9IGlkO1xuICAgIHRoaXMuaW5ib3VuZCAgPSBpbmJvdW5kICB8fCBbXTtcbiAgICB0aGlzLm91dGJvdW5kID0gb3V0Ym91bmQgfHwgW107XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBWZXJ0ZXgucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIGNhbnZhcy5jaXJjbGUoMykuZmlsbCh7IGNvbG9yOiAnIzAwMCcgfSk7XG4gIH07XG5cbiAgcmV0dXJuIFZlcnRleDtcbn0pKCk7IiwidmFyIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgX19leHRlbmRzOiBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKF9faGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfVxufTsiLCJ2YXIgUGFyc2VyRmFjdG9yeSA9IHJlcXVpcmUoJy4vcGFyc2Vycy9QYXJzZXJGYWN0b3J5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBGZXlubWFuID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogRHJhdyBkaWFncmFtIG9udG8gY2FudmFzLlxuICAgKiBAcGFyYW0gY2FudmFzIElkIG9mIGNhbnZhcyBlbGVtZW50XG4gICAqIEBwYXJhbSBkYXRhICAgRGlhZ3JhbSBwcm9wZXJ0aWVzXG4gICAqL1xuICBGZXlubWFuLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzLCBkYXRhKSB7XG5cbiAgICBpZiAodHlwZW9mIGNhbnZhcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBjYW52YXMjaWQgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgdmFyIHN2Z0NhbnZhcyAgPSBuZXcgU1ZHKGNhbnZhcyk7XG4gICAgdmFyIHBhcnNlciAgICAgPSBQYXJzZXJGYWN0b3J5LmdldFBhcnNlcihkYXRhLmxhbmcpO1xuICAgIHZhciBzdGFnZSAgICAgID0gcGFyc2VyLnBhcnNlKGRhdGEpO1xuXG4gICAgc3RhZ2Uuc2V0Q2FudmFzKHN2Z0NhbnZhcykuZHJhdygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIEZleW5tYW47XG59KSgpOyIsInZhciBTdGFnZSA9IHJlcXVpcmUoJy4vLi4vU3RhZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIFxuICB2YXIgTGF0ZXhQYXJzZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIExhdGV4UGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTdGFnZSgpO1xuICB9O1xuXG4gIHJldHVybiBMYXRleFBhcnNlcjtcbn0pKCk7IiwidmFyIFN0YW5kYXJkUGFyc2VyID0gcmVxdWlyZSgnLi9TdGFuZGFyZFBhcnNlcicpO1xudmFyIExhdGV4UGFyc2VyICAgID0gcmVxdWlyZSgnLi9MYXRleFBhcnNlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXRQYXJzZXI6IGZ1bmN0aW9uKGxhbmcpIHtcblxuICAgIGlmKGxhbmcgPT09ICdsYXRleCcpIHtcbiAgICAgIHJldHVybiBuZXcgTGF0ZXhQYXJzZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTdGFuZGFyZFBhcnNlcigpO1xuICB9XG59OyIsInZhciBTdGFnZSAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vU3RhZ2UnKTtcbnZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vLi4vUGFydGljbGVHZW5lcmF0b3InKTtcbnZhciBWZXJ0ZXggICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vVmVydGV4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIFN0YW5kYXJkUGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFuZGFyZFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdGFnZSA9IG5ldyBTdGFnZSgpO1xuXG4gICAgX3NldFRpdGxlKHN0YWdlLCBkYXRhLnRpdGxlKTtcbiAgICBfc2V0TGF5b3V0KHN0YWdlLCBkYXRhLmxheW91dCk7XG4gICAgX3NldERpbWVuc2lvbihzdGFnZSwgZGF0YS53aWR0aCwgZGF0YS5oZWlnaHQpO1xuICAgIF9zZXRTaG93QXhlcyhzdGFnZSwgZGF0YS5zaG93QXhlcyk7XG4gICAgX3NldFByb3BhZ2F0b3JzKHN0YWdlLCBkYXRhLnByb3BhZ2F0b3JzKTtcbiAgICBfc2V0VmVydGljZXMoc3RhZ2UsIGRhdGEudmVydGljZXMpO1xuICAgIF9zZXRFeGNoYW5nZXMoc3RhZ2UsIGRhdGEuZXhjaGFuZ2VzKTtcblxuICAgIHJldHVybiBzdGFnZTtcbiAgfTtcblxuICB2YXIgX3NldFRpdGxlID0gZnVuY3Rpb24oc3RhZ2UsIHRpdGxlKSB7XG5cbiAgICBpZih0aXRsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS50aXRsZSA9IHRpdGxlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldExheW91dCA9IGZ1bmN0aW9uKHN0YWdlLCBsYXlvdXQpIHtcblxuICAgIGlmKGxheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5sYXlvdXQgPSBsYXlvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0RGltZW5zaW9uID0gZnVuY3Rpb24oc3RhZ2UsIHdpZHRoLCBoZWlnaHQpIHtcblxuICAgIGlmKHdpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLndpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIGlmKGhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0U2hvd0F4ZXMgPSBmdW5jdGlvbihzdGFnZSwgc2hvd0F4ZXMpIHtcblxuICAgIGlmKHNob3dBeGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnNob3dBeGVzID0gc2hvd0F4ZXM7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0UHJvcGFnYXRvcnMgPSBmdW5jdGlvbihzdGFnZSwgcHJvcGFnYXRvcnMpIHtcblxuICAgIGlmKHByb3BhZ2F0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBwcm9wYWdhdG9ycyEnKTtcbiAgICB9XG5cbiAgICBwcm9wYWdhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BhZ2F0b3JBdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciBwID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUocHJvcGFnYXRvckF0dHJpYnV0ZXMpO1xuXG4gICAgICBpZihwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhZ2UucHJvcGFnYXRvcnMucHVzaChwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX3NldFZlcnRpY2VzID0gZnVuY3Rpb24oc3RhZ2UsIHZlcnRpY2VzKSB7XG5cbiAgICBpZih2ZXJ0aWNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgdmVydGljZXMhJyk7XG4gICAgfVxuXG4gICAgdmVydGljZXMuZm9yRWFjaChmdW5jdGlvbih2ZXJ0ZXhBdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciB2ID0gbmV3IFZlcnRleCh2ZXJ0ZXhBdHRyaWJ1dGVzLmlkLCB2ZXJ0ZXhBdHRyaWJ1dGVzLmluYm91bmQsIHZlcnRleEF0dHJpYnV0ZXMub3V0Ym91bmQpO1xuXG4gICAgICBpZih2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhZ2UudmVydGljZXMucHVzaCh2KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX3NldEV4Y2hhbmdlcyA9IGZ1bmN0aW9uKHN0YWdlLCBleGNoYW5nZXMpIHtcblxuICAgIGlmKGV4Y2hhbmdlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5leGNoYW5nZXMgPSBleGNoYW5nZXM7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTdGFuZGFyZFBhcnNlcjtcbn0pKCk7IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIF9jb2xvciAgPSAnIzAwMCc7XG4gIHZhciBfbGVuZ3RoID0gMTAwO1xuXG4gIHZhciBBYnN0cmFjdFBhcnRpY2xlID0gZnVuY3Rpb24oaWQsIGFudGksIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIGlmKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB0aGlzLmFudGkgICA9IGFudGk7XG4gICAgdGhpcy5jb2xvciAgPSBjb2xvciAgfHwgX2NvbG9yO1xuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoIHx8IF9sZW5ndGg7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBBYnN0cmFjdFBhcnRpY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjYWxsIGFic3RyYWN0IG1ldGhvZCEnKTtcbiAgfTtcblxuICByZXR1cm4gQWJzdHJhY3RQYXJ0aWNsZTtcblxufSkoKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKEVsZWN0cm9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIEVsZWN0cm9uKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBFbGVjdHJvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCBhbnRpIHx8IGZhbHNlLCBjb2xvciwgbGVuZ3RoXSk7XG4gIH1cblxuICBFbGVjdHJvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgY2FudmFzLmxpbmUoMCwgMCwgdGhpcy5sZW5ndGgsIDApLmZpbGwodGhpcy5jb2xvcikuc3Ryb2tlKHtcbiAgICAgIHdpZHRoOiAxLFxuICAgICAgY29sb3I6IHRoaXMuY29sb3JcbiAgICB9KTtcblxuICAgIHZhciBwb2x5Z29uU3RyaW5nLCB4MSwgeDIsIHgzLCB5MSwgeTIsIHkzO1xuICAgIHgxID0gdGhpcy5sZW5ndGggLyAyICsgNTtcbiAgICB5MSA9IDA7XG4gICAgeDIgPSB0aGlzLmxlbmd0aCAvIDIgLSA1O1xuICAgIHkyID0gMztcbiAgICB4MyA9IHRoaXMubGVuZ3RoIC8gMiAtIDU7XG4gICAgeTMgPSAtMztcbiAgICBwb2x5Z29uU3RyaW5nID0gJycgKyB4MSArICcsJyArIHkxICsgJyAnICsgeDIgKyAnLCcgKyB5MiArICcgJyArIHgzICsgJywnICsgeTM7XG5cbiAgICBjYW52YXMucG9seWdvbihwb2x5Z29uU3RyaW5nKS5maWxsKHRoaXMuY29sb3IpO1xuICB9O1xuXG4gIHJldHVybiBFbGVjdHJvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhHbHVvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBHbHVvbihpZCwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgR2x1b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgdW5kZWZpbmVkLCBjb2xvciB8fCAnIzAwOTkzMycsIGxlbmd0aF0pO1xuICB9XG5cbiAgR2x1b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHZhciBsb29wTGVuZ3RoID0gMTI7XG4gICAgdmFyIGxvb3BzICAgICAgPSBNYXRoLmZsb29yKHRoaXMubGVuZ3RoIC8gbG9vcExlbmd0aCk7XG4gICAgdmFyIHBhdGhTdHJpbmcgPSAnJztcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsb29wczsgaSsrKSB7XG5cbiAgICAgIGlmKGkgPT09IDApIHtcbiAgICAgICAgcGF0aFN0cmluZyArPSAnTSc7XG4gICAgICB9XG5cbiAgICAgIHBhdGhTdHJpbmcgKz0gKGkgKiAxMikgKyAnLDEgUScgKyAoaSAqIDEyICsgMykgKyAnLDEgJyArIChpICogMTIgKyA2KSArICcsMiBRJyArIChpICogMTIgKyA5KSArICcsNCAnICsgKGkgKiAxMiArIDEwKSArICcsOSBRJyArIChpICogMTIgKyAxMikgKyAnLDE1ICcgKyAoaSAqIDEyICsgNikgKyAnLDE1IFEnICsgKGkgKiAxMikgKyAnLDE1ICcgKyAoaSAqIDEyICsgMikgKyAnLDkgUScgKyAoaSAqIDEyICsgMykgKyAnLDQgJyArIChpICogMTIgKyA2KSArICcsMiBRJyArIChpICogMTIgKyA5KSArICcsMSAnXG5cbiAgICAgIGlmKGkgKyAxID09PSBsb29wcykge1xuICAgICAgICBwYXRoU3RyaW5nICs9IChpICogMTIgKyAxMikgKyAnLDAnXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoY2FudmFzKSB7XG5cbiAgICAgIGNhbnZhcy5wYXRoKHBhdGhTdHJpbmcsIHRydWUpLmZpbGwoJ25vbmUnKS5zdHJva2UoeyB3aWR0aDogMSwgY29sb3I6IHRoaXMuY29sb3IgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGhTdHJpbmc7XG4gIH07XG5cbiAgcmV0dXJuIEdsdW9uO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKFF1YXJrLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIFF1YXJrKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBRdWFyay5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCBhbnRpIHx8IGZhbHNlLCBjb2xvciwgbGVuZ3RoXSk7XG4gIH1cblxuICBRdWFyay5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gIH07XG5cbiAgcmV0dXJuIFF1YXJrO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiXX0=
(5)
});
;