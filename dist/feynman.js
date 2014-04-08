!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Feynman=e():"undefined"!=typeof global?global.Feynman=e():"undefined"!=typeof self&&(self.Feynman=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ParticleGenerator = require('./ParticleGenerator');

module.exports = (function() {

  var Exchange = function(id, inbound, outbound, particles) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    if(inbound === undefined || outbound === undefined) {
      throw new Error('Exchange must have both an inbound and outbound attribute!');
    }

    if(particles === undefined || particles.length === 0) {
      throw new Error('No particles given!');
    }

    this.id        = id;
    this.inbound   = inbound;
    this.outbound  = outbound;
    this.particles = [];

    _createExchangeParticles(this, particles);

    return this;
  };

  Exchange.prototype.draw = function(canvas) {

    this.particles.forEach(function(particle) {
      particle.draw(canvas);
    });
  };

  var _createExchangeParticles = function(ctx, particles) {

    particles.forEach(function(particleAttributes) {

      var p = ParticleGenerator.getParticle(particleAttributes);

      if(p !== undefined) {
        ctx.particles.push(p);
      }
    });
  };

  return Exchange;
})();
},{"./ParticleGenerator":2}],2:[function(require,module,exports){
var Electron = require('./propagators/Electron');
var Quark    = require('./propagators/Quark');
var Gluon    = require('./propagators/Gluon');
var Photon   = require('./propagators/Photon');

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

    if(data.type === 'ph') {
      return new Photon(data.id, data.color, data.length);
    }
  }
};
},{"./propagators/Electron":13,"./propagators/Gluon":14,"./propagators/Photon":15,"./propagators/Quark":16}],3:[function(require,module,exports){
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
    _drawPropagators(this);
    _drawExchanges(this);
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

  var _drawPropagators = function(ctx) {

    ctx.propagators.forEach(function(particle) {
      particle.draw(ctx.canvas);
    });
  };

  var _drawExchanges = function(ctx) {

    ctx.exchanges.forEach(function(exchange) {
      exchange.draw(ctx.canvas);
    });
  };

  return Stage;
})();
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var Vector = require('./Vector');

var PI = Math.PI;

module.exports = {

  line: function(tile, period, distance) {

    var bezier = ['M'];
    var num    = Math.floor(distance / period);
    var extra  = distance - period * num + 0.1;

    for(var n = 0; n <= num; n++) {

      for(var i = 0, l = tile.length, item; i < l; i++) {

        item = tile[i];

        if(Object.prototype.toString.call( item ) === '[object Array]') {

          if(n < num || item[0] < extra) {
            bezier.push(Vector.normalize(item[0] + period * n, ',', item[1]));
          } else {
            break;
          }

        } else {
          bezier.push(item);
        }

      }
    }
    return bezier.join(' ').replace(/\s[A-Z][^A-Z]*$/, '');
  },

  arc: function(particle, tile, period, distance) {

    var tension = 2;
    var t       = 0.25 * Math.max(tension, 2);
    var phi     = Math.acos(-0.5 / t);
    var theta   = -2 * Math.asin(period / (t * distance));
    var segment = [];
    var bezier  = ['M', '0,0'];

    // get coordinate pairs for the endpoint of segment
    for(var n = 0; n <= (PI - 2 * phi) / theta; n++) {
      segment.push([distance * (t * Math.cos(theta * n + phi) + 0.5), distance * (t * Math.sin(theta * n + phi) - Math.sqrt(t * t - 0.25))]);
    }
    for(var i = 0, l = segment.length - 1, model; i < l; i++) {

      model = (particle === 'photon' ? tile[i % 2] : tile);

      for(var j = 0, m = model.length, item; j < m; j++) {
        item = model[j];
        bezier.push(typeof item === 'object' ? Vector.getPoint(segment[i][0], segment[i][1],
          segment[i+1][0], segment[i+1][1], item[0], item[1]) : item);
      }
    }
    return bezier.join(' ').replace(/\s[A-Z]$/, '');
  },

  loop: function() {

  }
};
},{"./Vector":7}],6:[function(require,module,exports){
var __hasProp = {}.hasOwnProperty;

module.exports = {
  __extends: function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
};
},{}],7:[function(require,module,exports){
module.exports = {

  normalize: function() {

    var str = '';

    for(var i = 0, l = arguments.length, item; i < l; i++) {
      item = arguments[i];
      str += ' ' + (typeof item !== 'number' ?
        item :
        item.toFixed(3).replace(/(.\d*?)0+$/, '$1').replace(/\.$/, '')
      );
    }

    var trimmed = str.trim();

    return trimmed.replace(/ ?, ?/g, ',');
  },

  getPoint: function(sx, sy, ex, ey, x, y) {

    var ang = Math.atan2(ey - sy, ex - sx);

    return this.normalize(x * Math.cos(ang) - y * Math.sin(ang) + sx, ',', x * Math.sin(ang) + y * Math.cos(ang) + sy);
  }
};
},{}],8:[function(require,module,exports){
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
},{"./parsers/ParserFactory":10}],9:[function(require,module,exports){
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
},{"./../Stage":3}],10:[function(require,module,exports){
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
},{"./LatexParser":9,"./StandardParser":11}],11:[function(require,module,exports){
var Stage             = require('./../Stage');
var ParticleGenerator = require('./../ParticleGenerator');
var Vertex            = require('./../Vertex');
var Exchange          = require('./../Exchange');

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

    if(exchanges === undefined) {
      return [];
    }

    exchanges.forEach(function(exchangeAttributes) {

      var e = new Exchange(exchangeAttributes.id, exchangeAttributes.inbound, exchangeAttributes.outbound, exchangeAttributes.particles);

      if(e !== undefined) {
        stage.exchanges.push(e);
      }
    });
  };

  return StandardParser;
})();
},{"./../Exchange":1,"./../ParticleGenerator":2,"./../Stage":3,"./../Vertex":4}],12:[function(require,module,exports){
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

  AbstractParticle.prototype.getPath = function() {

    throw new Error('Cannot call abstrect method!');
  };

  return AbstractParticle;

})();
},{}],13:[function(require,module,exports){
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
},{"./../helpers/Klass":6,"./AbstractParticle":12}],14:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Gluon, _super);

  function Gluon(id, color, length) {

    Gluon.__super__.constructor.apply(this, [id, undefined, color || '#009933', length || 96]);
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
      return this;
    }

    return pathString;
  };

  return Gluon;

})(AbstractParticle);
},{"./../helpers/Klass":6,"./AbstractParticle":12}],15:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');
var Bezier           = require('./../helpers/Bezier');

module.exports = (function(_super) {

  Klass.__extends(Photon, _super);

  function Photon(id, color, length) {

    Photon.__super__.constructor.apply(this, [id, undefined, color || '#0066FF', length || 120]);
  }

  Photon.prototype.draw = function(canvas) {

    var path = this.getPath(this.length, 'line');
    canvas.path(path, true)
          .transform({ x: 30, y: 20 })
          .fill('none')
          .stroke({ width: 1, color: this.color });
  };

  /**
   * Approximation of the first quarter of one period of a sine curve
   * is a cubic Bezier curve with the following control points:
   *
   * (0, 0) (lambda * p / PI, lambda * a / 2) (2 * p / PI, a) (p, a)
   *
   * References:
   *
   * [1] http://mathb.in/1447
   * [2] https://github.com/photino/jquery-feyn/blob/master/js/jquery.feyn-1.0.1.js
   *
   * @param distance
   * @param shape
   * @returns {*}
   */
  Photon.prototype.getPath = function(distance, shape) {

    var PI     = Math.PI;
    var lambda = 0.51128733;
    var a      = 5;
    var b      = 0.5 * lambda * a;
    var p      = 5;
    var q      = 2 * p / PI;
    var t      = lambda * p / PI;
    var dir    = false;

    var pts = (dir
      ? [[0, 0], 'C', [t, -b], [q, -a], [p, -a],
               'S', [2 * p - t, -b], [2 * p, 0], 'S', [2 * p + q, a], [3 * p, a],
               'S', [4 * p - t, b]]
      : [[0, 0], 'C', [t, b], [q, a], [p, a],
               'S', [2 * p - t, b], [2 * p, 0], 'S', [2 * p + q, -a], [3 * p, -a],
               'S', [4 * p - t, -b]]
    );

    var tile = (dir
      ? [['C', [t, -b], [q, -a], [p, -a],
          'S', [2 * p - t, -b], [2 * p + 0.5, 0]],
         ['C', [t, b], [q, a], [p, a],
          'S', [2 * p - t, -b], [2 * p - 0.5, 0]]]
      : [['C', [t, b], [q, a], [p, a],
          'S', [2 * p - t, b], [2 * p - 0.5, 0]],
         ['C', [t, -b], [q, -a], [p, -a],
          'S', [2 * p - t, -b], [2 * p + 0.5, 0]]]
    );

    switch(shape) {
      case 'line':
        return Bezier.line(pts, 4 * p, distance);
      case 'arc':
        return Bezier.arc('photon', tile, p, distance);
    }
  };

  return Photon;

})(AbstractParticle);
},{"./../helpers/Bezier":5,"./../helpers/Klass":6,"./AbstractParticle":12}],16:[function(require,module,exports){
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
},{"./../helpers/Klass":6,"./AbstractParticle":12}]},{},[8])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9FeGNoYW5nZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1BhcnRpY2xlR2VuZXJhdG9yLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvU3RhZ2UuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9WZXJ0ZXguanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9oZWxwZXJzL0Jlemllci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2hlbHBlcnMvS2xhc3MuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9oZWxwZXJzL1ZlY3Rvci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcGFyc2Vycy9MYXRleFBhcnNlci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvUGFyc2VyRmFjdG9yeS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvU3RhbmRhcmRQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9BYnN0cmFjdFBhcnRpY2xlLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvRWxlY3Ryb24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9HbHVvbi5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL1Bob3Rvbi5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL1F1YXJrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vUGFydGljbGVHZW5lcmF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEV4Y2hhbmdlID0gZnVuY3Rpb24oaWQsIGluYm91bmQsIG91dGJvdW5kLCBwYXJ0aWNsZXMpIHtcblxuICAgIGlmKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZihpbmJvdW5kID09PSB1bmRlZmluZWQgfHwgb3V0Ym91bmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeGNoYW5nZSBtdXN0IGhhdmUgYm90aCBhbiBpbmJvdW5kIGFuZCBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgaWYocGFydGljbGVzID09PSB1bmRlZmluZWQgfHwgcGFydGljbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBwYXJ0aWNsZXMgZ2l2ZW4hJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgICAgPSBpZDtcbiAgICB0aGlzLmluYm91bmQgICA9IGluYm91bmQ7XG4gICAgdGhpcy5vdXRib3VuZCAgPSBvdXRib3VuZDtcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuXG4gICAgX2NyZWF0ZUV4Y2hhbmdlUGFydGljbGVzKHRoaXMsIHBhcnRpY2xlcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFeGNoYW5nZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZSkge1xuICAgICAgcGFydGljbGUuZHJhdyhjYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfY3JlYXRlRXhjaGFuZ2VQYXJ0aWNsZXMgPSBmdW5jdGlvbihjdHgsIHBhcnRpY2xlcykge1xuXG4gICAgcGFydGljbGVzLmZvckVhY2goZnVuY3Rpb24ocGFydGljbGVBdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciBwID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUocGFydGljbGVBdHRyaWJ1dGVzKTtcblxuICAgICAgaWYocCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN0eC5wYXJ0aWNsZXMucHVzaChwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gRXhjaGFuZ2U7XG59KSgpOyIsInZhciBFbGVjdHJvbiA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvRWxlY3Ryb24nKTtcbnZhciBRdWFyayAgICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvUXVhcmsnKTtcbnZhciBHbHVvbiAgICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvR2x1b24nKTtcbnZhciBQaG90b24gICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvUGhvdG9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldFBhcnRpY2xlOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2UtJykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVjdHJvbihkYXRhLmlkLCBmYWxzZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2UrJykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVjdHJvbihkYXRhLmlkLCB0cnVlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAncScpIHtcbiAgICAgIHJldHVybiBuZXcgUXVhcmsoZGF0YS5pZCwgZmFsc2UsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdhcScpIHtcbiAgICAgIHJldHVybiBuZXcgUXVhcmsoZGF0YS5pZCwgdHJ1ZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2cnKSB7XG4gICAgICByZXR1cm4gbmV3IEdsdW9uKGRhdGEuaWQsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdwaCcpIHtcbiAgICAgIHJldHVybiBuZXcgUGhvdG9uKGRhdGEuaWQsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFN0YWdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBHZW5lcmljIEF0dHJpYnV0ZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMudGl0bGUgICAgPSAnRmV5bm1hbic7XG4gICAgdGhpcy5sYXlvdXQgICA9ICd0aW1lLXNwYWNlJztcbiAgICB0aGlzLndpZHRoICAgID0gMTAwO1xuICAgIHRoaXMuaGVpZ2h0ICAgPSAxMDA7XG4gICAgdGhpcy5zaG93QXhlcyA9IHRydWU7XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKHJlcXVpcmVkKVxuICAgIHRoaXMucHJvcGFnYXRvcnMgPSBbXTtcbiAgICB0aGlzLnZlcnRpY2VzICAgID0gW107XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMuZXhjaGFuZ2VzICAgPSBbXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5zZXRDYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIHRoaXMuY2FudmFzLnNpemUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBfZHJhd1RpdGxlKHRoaXMpO1xuICAgIF9kcmF3VmVydGljZXModGhpcyk7XG4gICAgX2RyYXdQcm9wYWdhdG9ycyh0aGlzKTtcbiAgICBfZHJhd0V4Y2hhbmdlcyh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgX2RyYXdUaXRsZSA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgY3R4LmNhbnZhcy50ZXh0KGN0eC50aXRsZSkuZm9udCh7XG4gICAgICBmYW1pbHkgOiAnSGVsdmV0aWNhJyxcbiAgICAgIHNpemUgICA6IDE0LFxuICAgICAgYW5jaG9yIDogJ2xlZnQnXG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9kcmF3VmVydGljZXMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC52ZXJ0aWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleCkge1xuICAgICAgdmVydGV4LmRyYXcoY3R4LmNhbnZhcyk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9kcmF3UHJvcGFnYXRvcnMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC5wcm9wYWdhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRpY2xlKSB7XG4gICAgICBwYXJ0aWNsZS5kcmF3KGN0eC5jYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZHJhd0V4Y2hhbmdlcyA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgY3R4LmV4Y2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGV4Y2hhbmdlKSB7XG4gICAgICBleGNoYW5nZS5kcmF3KGN0eC5jYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBTdGFnZTtcbn0pKCk7IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFZlcnRleCA9IGZ1bmN0aW9uKGlkLCBpbmJvdW5kLCBvdXRib3VuZCkge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgPT09IHVuZGVmaW5lZCAmJiBvdXRib3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgaWYoaW5ib3VuZCAhPT0gdW5kZWZpbmVkICYmIGluYm91bmQubGVuZ3RoID09PSAwICYmIG91dGJvdW5kICE9PSB1bmRlZmluZWQgJiYgb3V0Ym91bmQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgICA9IGlkO1xuICAgIHRoaXMuaW5ib3VuZCAgPSBpbmJvdW5kICB8fCBbXTtcbiAgICB0aGlzLm91dGJvdW5kID0gb3V0Ym91bmQgfHwgW107XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBWZXJ0ZXgucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIGNhbnZhcy5jaXJjbGUoMykuZmlsbCh7IGNvbG9yOiAnIzAwMCcgfSk7XG4gIH07XG5cbiAgcmV0dXJuIFZlcnRleDtcbn0pKCk7IiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4vVmVjdG9yJyk7XG5cbnZhciBQSSA9IE1hdGguUEk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGxpbmU6IGZ1bmN0aW9uKHRpbGUsIHBlcmlvZCwgZGlzdGFuY2UpIHtcblxuICAgIHZhciBiZXppZXIgPSBbJ00nXTtcbiAgICB2YXIgbnVtICAgID0gTWF0aC5mbG9vcihkaXN0YW5jZSAvIHBlcmlvZCk7XG4gICAgdmFyIGV4dHJhICA9IGRpc3RhbmNlIC0gcGVyaW9kICogbnVtICsgMC4xO1xuXG4gICAgZm9yKHZhciBuID0gMDsgbiA8PSBudW07IG4rKykge1xuXG4gICAgICBmb3IodmFyIGkgPSAwLCBsID0gdGlsZS5sZW5ndGgsIGl0ZW07IGkgPCBsOyBpKyspIHtcblxuICAgICAgICBpdGVtID0gdGlsZVtpXTtcblxuICAgICAgICBpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoIGl0ZW0gKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuXG4gICAgICAgICAgaWYobiA8IG51bSB8fCBpdGVtWzBdIDwgZXh0cmEpIHtcbiAgICAgICAgICAgIGJlemllci5wdXNoKFZlY3Rvci5ub3JtYWxpemUoaXRlbVswXSArIHBlcmlvZCAqIG4sICcsJywgaXRlbVsxXSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZXppZXIucHVzaChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXppZXIuam9pbignICcpLnJlcGxhY2UoL1xcc1tBLVpdW15BLVpdKiQvLCAnJyk7XG4gIH0sXG5cbiAgYXJjOiBmdW5jdGlvbihwYXJ0aWNsZSwgdGlsZSwgcGVyaW9kLCBkaXN0YW5jZSkge1xuXG4gICAgdmFyIHRlbnNpb24gPSAyO1xuICAgIHZhciB0ICAgICAgID0gMC4yNSAqIE1hdGgubWF4KHRlbnNpb24sIDIpO1xuICAgIHZhciBwaGkgICAgID0gTWF0aC5hY29zKC0wLjUgLyB0KTtcbiAgICB2YXIgdGhldGEgICA9IC0yICogTWF0aC5hc2luKHBlcmlvZCAvICh0ICogZGlzdGFuY2UpKTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBiZXppZXIgID0gWydNJywgJzAsMCddO1xuXG4gICAgLy8gZ2V0IGNvb3JkaW5hdGUgcGFpcnMgZm9yIHRoZSBlbmRwb2ludCBvZiBzZWdtZW50XG4gICAgZm9yKHZhciBuID0gMDsgbiA8PSAoUEkgLSAyICogcGhpKSAvIHRoZXRhOyBuKyspIHtcbiAgICAgIHNlZ21lbnQucHVzaChbZGlzdGFuY2UgKiAodCAqIE1hdGguY29zKHRoZXRhICogbiArIHBoaSkgKyAwLjUpLCBkaXN0YW5jZSAqICh0ICogTWF0aC5zaW4odGhldGEgKiBuICsgcGhpKSAtIE1hdGguc3FydCh0ICogdCAtIDAuMjUpKV0pO1xuICAgIH1cbiAgICBmb3IodmFyIGkgPSAwLCBsID0gc2VnbWVudC5sZW5ndGggLSAxLCBtb2RlbDsgaSA8IGw7IGkrKykge1xuXG4gICAgICBtb2RlbCA9IChwYXJ0aWNsZSA9PT0gJ3Bob3RvbicgPyB0aWxlW2kgJSAyXSA6IHRpbGUpO1xuXG4gICAgICBmb3IodmFyIGogPSAwLCBtID0gbW9kZWwubGVuZ3RoLCBpdGVtOyBqIDwgbTsgaisrKSB7XG4gICAgICAgIGl0ZW0gPSBtb2RlbFtqXTtcbiAgICAgICAgYmV6aWVyLnB1c2godHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnID8gVmVjdG9yLmdldFBvaW50KHNlZ21lbnRbaV1bMF0sIHNlZ21lbnRbaV1bMV0sXG4gICAgICAgICAgc2VnbWVudFtpKzFdWzBdLCBzZWdtZW50W2krMV1bMV0sIGl0ZW1bMF0sIGl0ZW1bMV0pIDogaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXppZXIuam9pbignICcpLnJlcGxhY2UoL1xcc1tBLVpdJC8sICcnKTtcbiAgfSxcblxuICBsb29wOiBmdW5jdGlvbigpIHtcblxuICB9XG59OyIsInZhciBfX2hhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIF9fZXh0ZW5kczogZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbm9ybWFsaXplOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzdHIgPSAnJztcblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpdGVtID0gYXJndW1lbnRzW2ldO1xuICAgICAgc3RyICs9ICcgJyArICh0eXBlb2YgaXRlbSAhPT0gJ251bWJlcicgP1xuICAgICAgICBpdGVtIDpcbiAgICAgICAgaXRlbS50b0ZpeGVkKDMpLnJlcGxhY2UoLyguXFxkKj8pMCskLywgJyQxJykucmVwbGFjZSgvXFwuJC8sICcnKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgdHJpbW1lZCA9IHN0ci50cmltKCk7XG5cbiAgICByZXR1cm4gdHJpbW1lZC5yZXBsYWNlKC8gPywgPy9nLCAnLCcpO1xuICB9LFxuXG4gIGdldFBvaW50OiBmdW5jdGlvbihzeCwgc3ksIGV4LCBleSwgeCwgeSkge1xuXG4gICAgdmFyIGFuZyA9IE1hdGguYXRhbjIoZXkgLSBzeSwgZXggLSBzeCk7XG5cbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoeCAqIE1hdGguY29zKGFuZykgLSB5ICogTWF0aC5zaW4oYW5nKSArIHN4LCAnLCcsIHggKiBNYXRoLnNpbihhbmcpICsgeSAqIE1hdGguY29zKGFuZykgKyBzeSk7XG4gIH1cbn07IiwidmFyIFBhcnNlckZhY3RvcnkgPSByZXF1aXJlKCcuL3BhcnNlcnMvUGFyc2VyRmFjdG9yeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgRmV5bm1hbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERyYXcgZGlhZ3JhbSBvbnRvIGNhbnZhcy5cbiAgICogQHBhcmFtIGNhbnZhcyBJZCBvZiBjYW52YXMgZWxlbWVudFxuICAgKiBAcGFyYW0gZGF0YSAgIERpYWdyYW0gcHJvcGVydGllc1xuICAgKi9cbiAgRmV5bm1hbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcywgZGF0YSkge1xuXG4gICAgaWYgKHR5cGVvZiBjYW52YXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgY2FudmFzI2lkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdmdDYW52YXMgID0gbmV3IFNWRyhjYW52YXMpO1xuICAgIHZhciBwYXJzZXIgICAgID0gUGFyc2VyRmFjdG9yeS5nZXRQYXJzZXIoZGF0YS5sYW5nKTtcbiAgICB2YXIgc3RhZ2UgICAgICA9IHBhcnNlci5wYXJzZShkYXRhKTtcblxuICAgIHN0YWdlLnNldENhbnZhcyhzdmdDYW52YXMpLmRyYXcoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBGZXlubWFuO1xufSkoKTsiLCJ2YXIgU3RhZ2UgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIExhdGV4UGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBMYXRleFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgU3RhZ2UoKTtcbiAgfTtcblxuICByZXR1cm4gTGF0ZXhQYXJzZXI7XG59KSgpOyIsInZhciBTdGFuZGFyZFBhcnNlciA9IHJlcXVpcmUoJy4vU3RhbmRhcmRQYXJzZXInKTtcbnZhciBMYXRleFBhcnNlciAgICA9IHJlcXVpcmUoJy4vTGF0ZXhQYXJzZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0UGFyc2VyOiBmdW5jdGlvbihsYW5nKSB7XG5cbiAgICBpZihsYW5nID09PSAnbGF0ZXgnKSB7XG4gICAgICByZXR1cm4gbmV3IExhdGV4UGFyc2VyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3RhbmRhcmRQYXJzZXIoKTtcbiAgfVxufTsiLCJ2YXIgU3RhZ2UgICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG52YXIgUGFydGljbGVHZW5lcmF0b3IgPSByZXF1aXJlKCcuLy4uL1BhcnRpY2xlR2VuZXJhdG9yJyk7XG52YXIgVmVydGV4ICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1ZlcnRleCcpO1xudmFyIEV4Y2hhbmdlICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9FeGNoYW5nZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBTdGFuZGFyZFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhbmRhcmRQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcblxuICAgIF9zZXRUaXRsZShzdGFnZSwgZGF0YS50aXRsZSk7XG4gICAgX3NldExheW91dChzdGFnZSwgZGF0YS5sYXlvdXQpO1xuICAgIF9zZXREaW1lbnNpb24oc3RhZ2UsIGRhdGEud2lkdGgsIGRhdGEuaGVpZ2h0KTtcbiAgICBfc2V0U2hvd0F4ZXMoc3RhZ2UsIGRhdGEuc2hvd0F4ZXMpO1xuICAgIF9zZXRQcm9wYWdhdG9ycyhzdGFnZSwgZGF0YS5wcm9wYWdhdG9ycyk7XG4gICAgX3NldFZlcnRpY2VzKHN0YWdlLCBkYXRhLnZlcnRpY2VzKTtcbiAgICBfc2V0RXhjaGFuZ2VzKHN0YWdlLCBkYXRhLmV4Y2hhbmdlcyk7XG5cbiAgICByZXR1cm4gc3RhZ2U7XG4gIH07XG5cbiAgdmFyIF9zZXRUaXRsZSA9IGZ1bmN0aW9uKHN0YWdlLCB0aXRsZSkge1xuXG4gICAgaWYodGl0bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UudGl0bGUgPSB0aXRsZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRMYXlvdXQgPSBmdW5jdGlvbihzdGFnZSwgbGF5b3V0KSB7XG5cbiAgICBpZihsYXlvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UubGF5b3V0ID0gbGF5b3V0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldERpbWVuc2lvbiA9IGZ1bmN0aW9uKHN0YWdlLCB3aWR0aCwgaGVpZ2h0KSB7XG5cbiAgICBpZih3aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS53aWR0aCA9IHdpZHRoO1xuICAgIH1cbiAgICBpZihoZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFNob3dBeGVzID0gZnVuY3Rpb24oc3RhZ2UsIHNob3dBeGVzKSB7XG5cbiAgICBpZihzaG93QXhlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5zaG93QXhlcyA9IHNob3dBeGVzO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFByb3BhZ2F0b3JzID0gZnVuY3Rpb24oc3RhZ2UsIHByb3BhZ2F0b3JzKSB7XG5cbiAgICBpZihwcm9wYWdhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcHJvcGFnYXRvcnMhJyk7XG4gICAgfVxuXG4gICAgcHJvcGFnYXRvcnMuZm9yRWFjaChmdW5jdGlvbihwcm9wYWdhdG9yQXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgcCA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHByb3BhZ2F0b3JBdHRyaWJ1dGVzKTtcblxuICAgICAgaWYocCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YWdlLnByb3BhZ2F0b3JzLnB1c2gocCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9zZXRWZXJ0aWNlcyA9IGZ1bmN0aW9uKHN0YWdlLCB2ZXJ0aWNlcykge1xuXG4gICAgaWYodmVydGljZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHZlcnRpY2VzIScpO1xuICAgIH1cblxuICAgIHZlcnRpY2VzLmZvckVhY2goZnVuY3Rpb24odmVydGV4QXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgdiA9IG5ldyBWZXJ0ZXgodmVydGV4QXR0cmlidXRlcy5pZCwgdmVydGV4QXR0cmlidXRlcy5pbmJvdW5kLCB2ZXJ0ZXhBdHRyaWJ1dGVzLm91dGJvdW5kKTtcblxuICAgICAgaWYodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YWdlLnZlcnRpY2VzLnB1c2godik7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9zZXRFeGNoYW5nZXMgPSBmdW5jdGlvbihzdGFnZSwgZXhjaGFuZ2VzKSB7XG5cbiAgICBpZihleGNoYW5nZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGV4Y2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGV4Y2hhbmdlQXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgZSA9IG5ldyBFeGNoYW5nZShleGNoYW5nZUF0dHJpYnV0ZXMuaWQsIGV4Y2hhbmdlQXR0cmlidXRlcy5pbmJvdW5kLCBleGNoYW5nZUF0dHJpYnV0ZXMub3V0Ym91bmQsIGV4Y2hhbmdlQXR0cmlidXRlcy5wYXJ0aWNsZXMpO1xuXG4gICAgICBpZihlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhZ2UuZXhjaGFuZ2VzLnB1c2goZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIFN0YW5kYXJkUGFyc2VyO1xufSkoKTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgX2NvbG9yICA9ICcjMDAwJztcbiAgdmFyIF9sZW5ndGggPSAxMDA7XG5cbiAgdmFyIEFic3RyYWN0UGFydGljbGUgPSBmdW5jdGlvbihpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHRoaXMuYW50aSAgID0gYW50aTtcbiAgICB0aGlzLmNvbG9yICA9IGNvbG9yICB8fCBfY29sb3I7XG4gICAgdGhpcy5sZW5ndGggPSBsZW5ndGggfHwgX2xlbmd0aDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEFic3RyYWN0UGFydGljbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNhbGwgYWJzdHJhY3QgbWV0aG9kIScpO1xuICB9O1xuXG4gIEFic3RyYWN0UGFydGljbGUucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbigpIHtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNhbGwgYWJzdHJlY3QgbWV0aG9kIScpO1xuICB9O1xuXG4gIHJldHVybiBBYnN0cmFjdFBhcnRpY2xlO1xuXG59KSgpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoRWxlY3Ryb24sIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gRWxlY3Ryb24oaWQsIGFudGksIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIEVsZWN0cm9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIGFudGkgfHwgZmFsc2UsIGNvbG9yLCBsZW5ndGhdKTtcbiAgfVxuXG4gIEVsZWN0cm9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICBjYW52YXMubGluZSgwLCAwLCB0aGlzLmxlbmd0aCwgMCkuZmlsbCh0aGlzLmNvbG9yKS5zdHJva2Uoe1xuICAgICAgd2lkdGg6IDEsXG4gICAgICBjb2xvcjogdGhpcy5jb2xvclxuICAgIH0pO1xuXG4gICAgdmFyIHBvbHlnb25TdHJpbmcsIHgxLCB4MiwgeDMsIHkxLCB5MiwgeTM7XG4gICAgeDEgPSB0aGlzLmxlbmd0aCAvIDIgKyA1O1xuICAgIHkxID0gMDtcbiAgICB4MiA9IHRoaXMubGVuZ3RoIC8gMiAtIDU7XG4gICAgeTIgPSAzO1xuICAgIHgzID0gdGhpcy5sZW5ndGggLyAyIC0gNTtcbiAgICB5MyA9IC0zO1xuICAgIHBvbHlnb25TdHJpbmcgPSAnJyArIHgxICsgJywnICsgeTEgKyAnICcgKyB4MiArICcsJyArIHkyICsgJyAnICsgeDMgKyAnLCcgKyB5MztcblxuICAgIGNhbnZhcy5wb2x5Z29uKHBvbHlnb25TdHJpbmcpLmZpbGwodGhpcy5jb2xvcik7XG4gIH07XG5cbiAgcmV0dXJuIEVsZWN0cm9uO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKEdsdW9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIEdsdW9uKGlkLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBHbHVvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCB1bmRlZmluZWQsIGNvbG9yIHx8ICcjMDA5OTMzJywgbGVuZ3RoIHx8IDk2XSk7XG4gIH1cblxuICBHbHVvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdmFyIGxvb3BMZW5ndGggPSAxMjtcbiAgICB2YXIgbG9vcHMgICAgICA9IE1hdGguZmxvb3IodGhpcy5sZW5ndGggLyBsb29wTGVuZ3RoKTtcbiAgICB2YXIgcGF0aFN0cmluZyA9ICcnO1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGxvb3BzOyBpKyspIHtcblxuICAgICAgaWYoaSA9PT0gMCkge1xuICAgICAgICBwYXRoU3RyaW5nICs9ICdNJztcbiAgICAgIH1cblxuICAgICAgcGF0aFN0cmluZyArPSAoaSAqIDEyKSArICcsMSBRJyArIChpICogMTIgKyAzKSArICcsMSAnICsgKGkgKiAxMiArIDYpICsgJywyIFEnICsgKGkgKiAxMiArIDkpICsgJyw0ICcgKyAoaSAqIDEyICsgMTApICsgJyw5IFEnICsgKGkgKiAxMiArIDEyKSArICcsMTUgJyArIChpICogMTIgKyA2KSArICcsMTUgUScgKyAoaSAqIDEyKSArICcsMTUgJyArIChpICogMTIgKyAyKSArICcsOSBRJyArIChpICogMTIgKyAzKSArICcsNCAnICsgKGkgKiAxMiArIDYpICsgJywyIFEnICsgKGkgKiAxMiArIDkpICsgJywxICdcblxuICAgICAgaWYoaSArIDEgPT09IGxvb3BzKSB7XG4gICAgICAgIHBhdGhTdHJpbmcgKz0gKGkgKiAxMiArIDEyKSArICcsMCdcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihjYW52YXMpIHtcblxuICAgICAgY2FudmFzLnBhdGgocGF0aFN0cmluZywgdHJ1ZSkuZmlsbCgnbm9uZScpLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJldHVybiBwYXRoU3RyaW5nO1xuICB9O1xuXG4gIHJldHVybiBHbHVvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKFBob3RvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBQaG90b24oaWQsIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIFBob3Rvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCB1bmRlZmluZWQsIGNvbG9yIHx8ICcjMDA2NkZGJywgbGVuZ3RoIHx8IDEyMF0pO1xuICB9XG5cbiAgUGhvdG9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB2YXIgcGF0aCA9IHRoaXMuZ2V0UGF0aCh0aGlzLmxlbmd0aCwgJ2xpbmUnKTtcbiAgICBjYW52YXMucGF0aChwYXRoLCB0cnVlKVxuICAgICAgICAgIC50cmFuc2Zvcm0oeyB4OiAzMCwgeTogMjAgfSlcbiAgICAgICAgICAuZmlsbCgnbm9uZScpXG4gICAgICAgICAgLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQXBwcm94aW1hdGlvbiBvZiB0aGUgZmlyc3QgcXVhcnRlciBvZiBvbmUgcGVyaW9kIG9mIGEgc2luZSBjdXJ2ZVxuICAgKiBpcyBhIGN1YmljIEJlemllciBjdXJ2ZSB3aXRoIHRoZSBmb2xsb3dpbmcgY29udHJvbCBwb2ludHM6XG4gICAqXG4gICAqICgwLCAwKSAobGFtYmRhICogcCAvIFBJLCBsYW1iZGEgKiBhIC8gMikgKDIgKiBwIC8gUEksIGEpIChwLCBhKVxuICAgKlxuICAgKiBSZWZlcmVuY2VzOlxuICAgKlxuICAgKiBbMV0gaHR0cDovL21hdGhiLmluLzE0NDdcbiAgICogWzJdIGh0dHBzOi8vZ2l0aHViLmNvbS9waG90aW5vL2pxdWVyeS1mZXluL2Jsb2IvbWFzdGVyL2pzL2pxdWVyeS5mZXluLTEuMC4xLmpzXG4gICAqXG4gICAqIEBwYXJhbSBkaXN0YW5jZVxuICAgKiBAcGFyYW0gc2hhcGVcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBQaG90b24ucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbihkaXN0YW5jZSwgc2hhcGUpIHtcblxuICAgIHZhciBQSSAgICAgPSBNYXRoLlBJO1xuICAgIHZhciBsYW1iZGEgPSAwLjUxMTI4NzMzO1xuICAgIHZhciBhICAgICAgPSA1O1xuICAgIHZhciBiICAgICAgPSAwLjUgKiBsYW1iZGEgKiBhO1xuICAgIHZhciBwICAgICAgPSA1O1xuICAgIHZhciBxICAgICAgPSAyICogcCAvIFBJO1xuICAgIHZhciB0ICAgICAgPSBsYW1iZGEgKiBwIC8gUEk7XG4gICAgdmFyIGRpciAgICA9IGZhbHNlO1xuXG4gICAgdmFyIHB0cyA9IChkaXJcbiAgICAgID8gW1swLCAwXSwgJ0MnLCBbdCwgLWJdLCBbcSwgLWFdLCBbcCwgLWFdLFxuICAgICAgICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCwgMF0sICdTJywgWzIgKiBwICsgcSwgYV0sIFszICogcCwgYV0sXG4gICAgICAgICAgICAgICAnUycsIFs0ICogcCAtIHQsIGJdXVxuICAgICAgOiBbWzAsIDBdLCAnQycsIFt0LCBiXSwgW3EsIGFdLCBbcCwgYV0sXG4gICAgICAgICAgICAgICAnUycsIFsyICogcCAtIHQsIGJdLCBbMiAqIHAsIDBdLCAnUycsIFsyICogcCArIHEsIC1hXSwgWzMgKiBwLCAtYV0sXG4gICAgICAgICAgICAgICAnUycsIFs0ICogcCAtIHQsIC1iXV1cbiAgICApO1xuXG4gICAgdmFyIHRpbGUgPSAoZGlyXG4gICAgICA/IFtbJ0MnLCBbdCwgLWJdLCBbcSwgLWFdLCBbcCwgLWFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgLWJdLCBbMiAqIHAgKyAwLjUsIDBdXSxcbiAgICAgICAgIFsnQycsIFt0LCBiXSwgW3EsIGFdLCBbcCwgYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCAtIDAuNSwgMF1dXVxuICAgICAgOiBbWydDJywgW3QsIGJdLCBbcSwgYV0sIFtwLCBhXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIGJdLCBbMiAqIHAgLSAwLjUsIDBdXSxcbiAgICAgICAgIFsnQycsIFt0LCAtYl0sIFtxLCAtYV0sIFtwLCAtYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCArIDAuNSwgMF1dXVxuICAgICk7XG5cbiAgICBzd2l0Y2goc2hhcGUpIHtcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUocHRzLCA0ICogcCwgZGlzdGFuY2UpO1xuICAgICAgY2FzZSAnYXJjJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5hcmMoJ3Bob3RvbicsIHRpbGUsIHAsIGRpc3RhbmNlKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFBob3RvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhRdWFyaywgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBRdWFyayhpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgUXVhcmsuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgYW50aSB8fCBmYWxzZSwgY29sb3IsIGxlbmd0aF0pO1xuICB9XG5cbiAgUXVhcmsucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICB9O1xuXG4gIHJldHVybiBRdWFyaztcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7Il19
(8)
});
;