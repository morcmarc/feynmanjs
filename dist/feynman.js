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
},{"./propagators/Electron":12,"./propagators/Gluon":13,"./propagators/Photon":14,"./propagators/Quark":15}],3:[function(require,module,exports){
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
      size   :  14,
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
    this.x        = 0;
    this.y        = 0;

    return this;
  };

  Vertex.prototype.draw = function(canvas) {

    canvas.circle(3)
          .fill({ color: '#000' })
          .translate(this.x, this.y);
  };

  return Vertex;
})();
},{}],5:[function(require,module,exports){
var PI      = Math.PI;
var isArray = function(a) {
  return Object.prototype.toString.call(a) === '[object Array]';
};

module.exports = {

  normalizePathString: function() {

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

  /**
   * Get coordinates of a given point in reference to a given Bezier curve segment
   *
   * @param sx Start of segment X
   * @param sy Start of segment Y
   * @param ex End of segment X
   * @param ey End of segment Y
   * @param x  Point to fit X
   * @param y  Point to fit Y
   * @returns {*}
   */
  getCoordinatesInBezier: function(sx, sy, ex, ey, x, y) {

    var ang = Math.atan2(ey - sy, ex - sx);

    return this.normalizePathString(x * Math.cos(ang) - y * Math.sin(ang) + sx, ',', x * Math.sin(ang) + y * Math.cos(ang) + sy);
  },

  /**
   * Project a given (Lp) 1/4 period long Bezier spline (C) onto an (Ll) long straight line.
   *
   * @param tile       (C)  Curve segment
   * @param period     (Lp) Length of a quarter period
   * @param length     (Ll) Length of propagator
   * @returns {string} SVG path
   */
  line: function(tile, period, length) {

    var bezier = ['M'];
    var num    = Math.floor(length / period);
    var extra  = length - period * num + 0.1;

    for(var n = 0; n <= num; n++) {

      for(var i = 0, l = tile.length, item; i < l; i++) {

        item = tile[i];

        if(isArray(item)) {

          if(n < num || item[0] < extra) {
            bezier.push(this.normalizePathString(item[0] + period * n, ',', item[1]));
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

  /**
   * Project a given (Lp) quarter period long Bezier spline (C) onto an (Ll) long arc.
   *
   * @param particle   Type of particle, e.g.: "photon"
   * @param tile       (C)  Curve segment
   * @param period     (Lp) Length of a 1/4 period
   * @param length     (Ll) Length
   * @returns {string} SVG path
   */
  arc: function(particle, tile, period, length) {

    var tension = 2;
    var t       = 0.25 * Math.max(tension, 2);
    var phi     = Math.acos(-0.5 / t);
    var theta   = -2 * Math.asin(period / (t * length));
    var segment = [];
    var bezier  = ['M', '0,0'];

    // get coordinate pairs for the endpoint of segment
    for(var n = 0; n <= (PI - 2 * phi) / theta; n++) {
      segment.push([length * (t * Math.cos(theta * n + phi) + 0.5), length * (t * Math.sin(theta * n + phi) - Math.sqrt(t * t - 0.25))]);
    }

    for(var i = 0, l = segment.length - 1, model; i < l; i++) {

      model = (particle === 'photon' ? tile[i % 2] : tile);

      for(var j = 0, m = model.length, item; j < m; j++) {
        item = model[j];
        bezier.push(isArray(item)
          ? this.getCoordinatesInBezier(segment[i][0], segment[i][1], segment[i+1][0], segment[i+1][1], item[0], item[1])
          : item
        );
      }
    }

    return bezier.join(' ').replace(/\s[A-Z]$/, '');
  },

  /**
   * Project a given (Lp) quarter period long Bezier spline (C) onto an (Ll) diameter circle.
   *
   * @param particle   Type of particle, e.g.: "photon"
   * @param tile       (C) Curve segment
   * @param period     (N) Length of a 1/4 period
   * @param length     (L) Length
   * @returns {string} SVG path
   */
  loop: function(particle, tile, period, length) {

    var cw      = true;
    var theta   = 2 * Math.asin(2 * period / length);
    var num     = 2 * PI / theta;
    var segment = [];
    var lift    = (cw ? -0.5 : 0.5);
    var bezier  = ['M', (particle === 'gluon' ? lift + ',0' : '0,' + lift)];

    // find the modified distance such that the number of tiles is an integer
    for(var x = -0.1, dis = length; Math.floor(num) % 4 || num - Math.floor(num) > 0.1; x += 0.001) {

      length = (1 + x) * dis;
      theta  = 2 * Math.asin(2 * period / length);
      num    = 2 * PI / theta;
    }

    // get coordinate pairs for the endpoint of segment
    for(var n = 0; n <= num; n++) {

      var sx = 0.5 * length * (1 - Math.cos(theta * n));
      var sy = 0.5 * length * Math.sin(theta * n);
      segment.push([sx, sy]);
    }

    for(var i = 0, l = segment.length - 1, model; i < l; i++) {

      // two photon tiles form a period whereas one gluon tile is a period
      model = (particle === 'photon' ? tile[i % 2] : tile);

      // get bezier path for photon and gluon arc
      for(var j = 0, m = model.length, item; j < m; j++) {

        item = model[j];
        bezier.push(isArray(item)
          ? this.getCoordinatesInBezier(segment[i][0], segment[i][1], segment[i+1][0], segment[i+1][1], item[0], item[1])
          : item
        );
      }
    }

    return bezier.join(' ').replace(/\s[A-Z]$/, '') + ' Z';
  }
};
},{}],6:[function(require,module,exports){
var __hasProp = {}.hasOwnProperty;

module.exports = {
  __extends: function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
};
},{}],7:[function(require,module,exports){
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
},{"./parsers/ParserFactory":9}],8:[function(require,module,exports){
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
},{"./../Stage":3}],9:[function(require,module,exports){
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
},{"./LatexParser":8,"./StandardParser":10}],10:[function(require,module,exports){
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
},{"./../Exchange":1,"./../ParticleGenerator":2,"./../Stage":3,"./../Vertex":4}],11:[function(require,module,exports){
module.exports = (function() {

  var _color  = '#000';
  var _length = 109;

  var AbstractParticle = function(id, anti, color, length) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    this.anti   = anti;
    this.color  = color  || _color;
    this.length = length || _length;
    this.x      = 0;
    this.y      = 0;

    return this;
  };

  AbstractParticle.prototype.draw = function() {

    throw new Error('Cannot call abstract method!');
  };

  AbstractParticle.prototype.getPath = function() {

    throw new Error('Cannot call abstract method!');
  };

  return AbstractParticle;

})();
},{}],12:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');
var Bezier           = require('./../helpers/Bezier');


module.exports = (function(_super) {

  Klass.__extends(Electron, _super);

  function Electron(id, anti, color, length) {

    Electron.__super__.constructor.apply(this, [id, anti || false, color, length]);
  }

  Electron.prototype.draw = function(canvas) {

    canvas.path(this.getPath('line'))
          .fill('none')
          .stroke({ width: 1, color: this.color })
          .translate(150, 150);
  };

  Electron.prototype.getPath = function(shape) {

    var tile = [ [1, 1], [2, 1] ];
    var l    = 1;

    switch(shape) {
      case 'line':
        return Bezier.line(tile, l, this.length);
      case 'arc':
        return Bezier.arc('electron', tile, l, this.length);
      case 'loop':
        return Bezier.loop('electron', tile, l, this.length);
      default:
        return Bezier.line(tile, l, this.length);
    }
  };

  return Electron;

})(AbstractParticle);
},{"./../helpers/Bezier":5,"./../helpers/Klass":6,"./AbstractParticle":11}],13:[function(require,module,exports){
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

  Gluon.prototype.getPath = function() {

    return '';
  };

  return Gluon;

})(AbstractParticle);
},{"./../helpers/Klass":6,"./AbstractParticle":11}],14:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');
var Bezier           = require('./../helpers/Bezier');

module.exports = (function(_super) {

  Klass.__extends(Photon, _super);

  function Photon(id, color, length) {

    Photon.__super__.constructor.apply(this, [id, undefined, color || '#0066FF', length || 109]);
  }

  Photon.prototype.draw = function(canvas) {

    var path = this.getPath('arc');
    canvas.path(path, true)
          .fill('none')
          .stroke({ width: 1, color: this.color })
          .translate(150, 150);
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
   * @param shape
   * @returns {*}
   */
  Photon.prototype.getPath = function(shape) {

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
                 'S', [2 * p - t, -b], [2 * p, 0],
                 'S', [2 * p + q, a], [3 * p, a],
                 'S', [4 * p - t, b]]
      : [[0, 0], 'C', [t, b], [q, a], [p, a],
                 'S', [2 * p - t, b], [2 * p, 0],
                 'S', [2 * p + q, -a], [3 * p, -a],
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
        return Bezier.line(pts, 4 * p, this.length);
      case 'arc':
        return Bezier.arc('photon', tile, p, this.length);
      case 'loop':
        return Bezier.loop('photon', tile, p, this.length);
      default:
        return Bezier.line(pts, 4 * p, this.length);
    }
  };

  return Photon;

})(AbstractParticle);
},{"./../helpers/Bezier":5,"./../helpers/Klass":6,"./AbstractParticle":11}],15:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Quark, _super);

  function Quark(id, anti, color, length) {

    Quark.__super__.constructor.apply(this, [id, anti || false, color, length]);
  }

  Quark.prototype.draw = function(canvas) {

  };

  Quark.prototype.getPath = function() {

    return '';
  };

  return Quark;

})(AbstractParticle);
},{"./../helpers/Klass":6,"./AbstractParticle":11}]},{},[7])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9FeGNoYW5nZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1BhcnRpY2xlR2VuZXJhdG9yLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvU3RhZ2UuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9WZXJ0ZXguanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9oZWxwZXJzL0Jlemllci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2hlbHBlcnMvS2xhc3MuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvTGF0ZXhQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1BhcnNlckZhY3RvcnkuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvQWJzdHJhY3RQYXJ0aWNsZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL0VsZWN0cm9uLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvR2x1b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9QaG90b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9RdWFyay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFBhcnRpY2xlR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9QYXJ0aWNsZUdlbmVyYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgRXhjaGFuZ2UgPSBmdW5jdGlvbihpZCwgaW5ib3VuZCwgb3V0Ym91bmQsIHBhcnRpY2xlcykge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgPT09IHVuZGVmaW5lZCB8fCBvdXRib3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4Y2hhbmdlIG11c3QgaGF2ZSBib3RoIGFuIGluYm91bmQgYW5kIG91dGJvdW5kIGF0dHJpYnV0ZSEnKTtcbiAgICB9XG5cbiAgICBpZihwYXJ0aWNsZXMgPT09IHVuZGVmaW5lZCB8fCBwYXJ0aWNsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHBhcnRpY2xlcyBnaXZlbiEnKTtcbiAgICB9XG5cbiAgICB0aGlzLmlkICAgICAgICA9IGlkO1xuICAgIHRoaXMuaW5ib3VuZCAgID0gaW5ib3VuZDtcbiAgICB0aGlzLm91dGJvdW5kICA9IG91dGJvdW5kO1xuICAgIHRoaXMucGFydGljbGVzID0gW107XG5cbiAgICBfY3JlYXRlRXhjaGFuZ2VQYXJ0aWNsZXModGhpcywgcGFydGljbGVzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV4Y2hhbmdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRpY2xlKSB7XG4gICAgICBwYXJ0aWNsZS5kcmF3KGNhbnZhcyk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9jcmVhdGVFeGNoYW5nZVBhcnRpY2xlcyA9IGZ1bmN0aW9uKGN0eCwgcGFydGljbGVzKSB7XG5cbiAgICBwYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZUF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIHAgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZShwYXJ0aWNsZUF0dHJpYnV0ZXMpO1xuXG4gICAgICBpZihwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY3R4LnBhcnRpY2xlcy5wdXNoKHApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBFeGNoYW5nZTtcbn0pKCk7IiwidmFyIEVsZWN0cm9uID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9FbGVjdHJvbicpO1xudmFyIFF1YXJrICAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9RdWFyaycpO1xudmFyIEdsdW9uICAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9HbHVvbicpO1xudmFyIFBob3RvbiAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9QaG90b24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0UGFydGljbGU6IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZS0nKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZWN0cm9uKGRhdGEuaWQsIGZhbHNlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZSsnKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZWN0cm9uKGRhdGEuaWQsIHRydWUsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdxJykge1xuICAgICAgcmV0dXJuIG5ldyBRdWFyayhkYXRhLmlkLCBmYWxzZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2FxJykge1xuICAgICAgcmV0dXJuIG5ldyBRdWFyayhkYXRhLmlkLCB0cnVlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZycpIHtcbiAgICAgIHJldHVybiBuZXcgR2x1b24oZGF0YS5pZCwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ3BoJykge1xuICAgICAgcmV0dXJuIG5ldyBQaG90b24oZGF0YS5pZCwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgU3RhZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIEdlbmVyaWMgQXR0cmlidXRlcyAob3B0aW9uYWwpXG4gICAgdGhpcy50aXRsZSAgICA9ICdGZXlubWFuJztcbiAgICB0aGlzLmxheW91dCAgID0gJ3RpbWUtc3BhY2UnO1xuICAgIHRoaXMud2lkdGggICAgPSAxMDA7XG4gICAgdGhpcy5oZWlnaHQgICA9IDEwMDtcbiAgICB0aGlzLnNob3dBeGVzID0gdHJ1ZTtcblxuICAgIC8vIE1haW4gcHJvcGVydGllcyAocmVxdWlyZWQpXG4gICAgdGhpcy5wcm9wYWdhdG9ycyA9IFtdO1xuICAgIHRoaXMudmVydGljZXMgICAgPSBbXTtcblxuICAgIC8vIE1haW4gcHJvcGVydGllcyAob3B0aW9uYWwpXG4gICAgdGhpcy5leGNoYW5nZXMgICA9IFtdO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhZ2UucHJvdG90eXBlLnNldENhbnZhcyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgdGhpcy5jYW52YXMuc2l6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhZ2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcblxuICAgIF9kcmF3VGl0bGUodGhpcyk7XG4gICAgX2RyYXdWZXJ0aWNlcyh0aGlzKTtcbiAgICBfZHJhd1Byb3BhZ2F0b3JzKHRoaXMpO1xuICAgIF9kcmF3RXhjaGFuZ2VzKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBfZHJhd1RpdGxlID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHguY2FudmFzLnRleHQoY3R4LnRpdGxlKS5mb250KHtcbiAgICAgIGZhbWlseSA6ICdIZWx2ZXRpY2EnLFxuICAgICAgc2l6ZSAgIDogIDE0LFxuICAgICAgYW5jaG9yIDogJ2xlZnQnXG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9kcmF3VmVydGljZXMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC52ZXJ0aWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleCkge1xuICAgICAgdmVydGV4LmRyYXcoY3R4LmNhbnZhcyk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9kcmF3UHJvcGFnYXRvcnMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC5wcm9wYWdhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRpY2xlKSB7XG4gICAgICBwYXJ0aWNsZS5kcmF3KGN0eC5jYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZHJhd0V4Y2hhbmdlcyA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgY3R4LmV4Y2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGV4Y2hhbmdlKSB7XG4gICAgICBleGNoYW5nZS5kcmF3KGN0eC5jYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBTdGFnZTtcbn0pKCk7IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFZlcnRleCA9IGZ1bmN0aW9uKGlkLCBpbmJvdW5kLCBvdXRib3VuZCkge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgPT09IHVuZGVmaW5lZCAmJiBvdXRib3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgaWYoaW5ib3VuZCAhPT0gdW5kZWZpbmVkICYmIGluYm91bmQubGVuZ3RoID09PSAwICYmIG91dGJvdW5kICE9PSB1bmRlZmluZWQgJiYgb3V0Ym91bmQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgICA9IGlkO1xuICAgIHRoaXMuaW5ib3VuZCAgPSBpbmJvdW5kICB8fCBbXTtcbiAgICB0aGlzLm91dGJvdW5kID0gb3V0Ym91bmQgfHwgW107XG4gICAgdGhpcy54ICAgICAgICA9IDA7XG4gICAgdGhpcy55ICAgICAgICA9IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBWZXJ0ZXgucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIGNhbnZhcy5jaXJjbGUoMylcbiAgICAgICAgICAuZmlsbCh7IGNvbG9yOiAnIzAwMCcgfSlcbiAgICAgICAgICAudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgfTtcblxuICByZXR1cm4gVmVydGV4O1xufSkoKTsiLCJ2YXIgUEkgICAgICA9IE1hdGguUEk7XG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uKGEpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5vcm1hbGl6ZVBhdGhTdHJpbmc6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHN0ciA9ICcnO1xuXG4gICAgZm9yKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGgsIGl0ZW07IGkgPCBsOyBpKyspIHtcblxuICAgICAgaXRlbSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIHN0ciArPSAnICcgKyAodHlwZW9mIGl0ZW0gIT09ICdudW1iZXInID9cbiAgICAgICAgaXRlbSA6XG4gICAgICAgIGl0ZW0udG9GaXhlZCgzKS5yZXBsYWNlKC8oLlxcZCo/KTArJC8sICckMScpLnJlcGxhY2UoL1xcLiQvLCAnJylcbiAgICAgICk7XG4gICAgfVxuICAgIHZhciB0cmltbWVkID0gc3RyLnRyaW0oKTtcblxuICAgIHJldHVybiB0cmltbWVkLnJlcGxhY2UoLyA/LCA/L2csICcsJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldCBjb29yZGluYXRlcyBvZiBhIGdpdmVuIHBvaW50IGluIHJlZmVyZW5jZSB0byBhIGdpdmVuIEJlemllciBjdXJ2ZSBzZWdtZW50XG4gICAqXG4gICAqIEBwYXJhbSBzeCBTdGFydCBvZiBzZWdtZW50IFhcbiAgICogQHBhcmFtIHN5IFN0YXJ0IG9mIHNlZ21lbnQgWVxuICAgKiBAcGFyYW0gZXggRW5kIG9mIHNlZ21lbnQgWFxuICAgKiBAcGFyYW0gZXkgRW5kIG9mIHNlZ21lbnQgWVxuICAgKiBAcGFyYW0geCAgUG9pbnQgdG8gZml0IFhcbiAgICogQHBhcmFtIHkgIFBvaW50IHRvIGZpdCBZXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgZ2V0Q29vcmRpbmF0ZXNJbkJlemllcjogZnVuY3Rpb24oc3gsIHN5LCBleCwgZXksIHgsIHkpIHtcblxuICAgIHZhciBhbmcgPSBNYXRoLmF0YW4yKGV5IC0gc3ksIGV4IC0gc3gpO1xuXG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplUGF0aFN0cmluZyh4ICogTWF0aC5jb3MoYW5nKSAtIHkgKiBNYXRoLnNpbihhbmcpICsgc3gsICcsJywgeCAqIE1hdGguc2luKGFuZykgKyB5ICogTWF0aC5jb3MoYW5nKSArIHN5KTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvamVjdCBhIGdpdmVuIChMcCkgMS80IHBlcmlvZCBsb25nIEJlemllciBzcGxpbmUgKEMpIG9udG8gYW4gKExsKSBsb25nIHN0cmFpZ2h0IGxpbmUuXG4gICAqXG4gICAqIEBwYXJhbSB0aWxlICAgICAgIChDKSAgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTHApIExlbmd0aCBvZiBhIHF1YXJ0ZXIgcGVyaW9kXG4gICAqIEBwYXJhbSBsZW5ndGggICAgIChMbCkgTGVuZ3RoIG9mIHByb3BhZ2F0b3JcbiAgICogQHJldHVybnMge3N0cmluZ30gU1ZHIHBhdGhcbiAgICovXG4gIGxpbmU6IGZ1bmN0aW9uKHRpbGUsIHBlcmlvZCwgbGVuZ3RoKSB7XG5cbiAgICB2YXIgYmV6aWVyID0gWydNJ107XG4gICAgdmFyIG51bSAgICA9IE1hdGguZmxvb3IobGVuZ3RoIC8gcGVyaW9kKTtcbiAgICB2YXIgZXh0cmEgID0gbGVuZ3RoIC0gcGVyaW9kICogbnVtICsgMC4xO1xuXG4gICAgZm9yKHZhciBuID0gMDsgbiA8PSBudW07IG4rKykge1xuXG4gICAgICBmb3IodmFyIGkgPSAwLCBsID0gdGlsZS5sZW5ndGgsIGl0ZW07IGkgPCBsOyBpKyspIHtcblxuICAgICAgICBpdGVtID0gdGlsZVtpXTtcblxuICAgICAgICBpZihpc0FycmF5KGl0ZW0pKSB7XG5cbiAgICAgICAgICBpZihuIDwgbnVtIHx8IGl0ZW1bMF0gPCBleHRyYSkge1xuICAgICAgICAgICAgYmV6aWVyLnB1c2godGhpcy5ub3JtYWxpemVQYXRoU3RyaW5nKGl0ZW1bMF0gKyBwZXJpb2QgKiBuLCAnLCcsIGl0ZW1bMV0pKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJlemllci5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJlemllci5qb2luKCcgJykucmVwbGFjZSgvXFxzW0EtWl1bXkEtWl0qJC8sICcnKTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvamVjdCBhIGdpdmVuIChMcCkgcXVhcnRlciBwZXJpb2QgbG9uZyBCZXppZXIgc3BsaW5lIChDKSBvbnRvIGFuIChMbCkgbG9uZyBhcmMuXG4gICAqXG4gICAqIEBwYXJhbSBwYXJ0aWNsZSAgIFR5cGUgb2YgcGFydGljbGUsIGUuZy46IFwicGhvdG9uXCJcbiAgICogQHBhcmFtIHRpbGUgICAgICAgKEMpICBDdXJ2ZSBzZWdtZW50XG4gICAqIEBwYXJhbSBwZXJpb2QgICAgIChMcCkgTGVuZ3RoIG9mIGEgMS80IHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTGwpIExlbmd0aFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBTVkcgcGF0aFxuICAgKi9cbiAgYXJjOiBmdW5jdGlvbihwYXJ0aWNsZSwgdGlsZSwgcGVyaW9kLCBsZW5ndGgpIHtcblxuICAgIHZhciB0ZW5zaW9uID0gMjtcbiAgICB2YXIgdCAgICAgICA9IDAuMjUgKiBNYXRoLm1heCh0ZW5zaW9uLCAyKTtcbiAgICB2YXIgcGhpICAgICA9IE1hdGguYWNvcygtMC41IC8gdCk7XG4gICAgdmFyIHRoZXRhICAgPSAtMiAqIE1hdGguYXNpbihwZXJpb2QgLyAodCAqIGxlbmd0aCkpO1xuICAgIHZhciBzZWdtZW50ID0gW107XG4gICAgdmFyIGJlemllciAgPSBbJ00nLCAnMCwwJ107XG5cbiAgICAvLyBnZXQgY29vcmRpbmF0ZSBwYWlycyBmb3IgdGhlIGVuZHBvaW50IG9mIHNlZ21lbnRcbiAgICBmb3IodmFyIG4gPSAwOyBuIDw9IChQSSAtIDIgKiBwaGkpIC8gdGhldGE7IG4rKykge1xuICAgICAgc2VnbWVudC5wdXNoKFtsZW5ndGggKiAodCAqIE1hdGguY29zKHRoZXRhICogbiArIHBoaSkgKyAwLjUpLCBsZW5ndGggKiAodCAqIE1hdGguc2luKHRoZXRhICogbiArIHBoaSkgLSBNYXRoLnNxcnQodCAqIHQgLSAwLjI1KSldKTtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwLCBsID0gc2VnbWVudC5sZW5ndGggLSAxLCBtb2RlbDsgaSA8IGw7IGkrKykge1xuXG4gICAgICBtb2RlbCA9IChwYXJ0aWNsZSA9PT0gJ3Bob3RvbicgPyB0aWxlW2kgJSAyXSA6IHRpbGUpO1xuXG4gICAgICBmb3IodmFyIGogPSAwLCBtID0gbW9kZWwubGVuZ3RoLCBpdGVtOyBqIDwgbTsgaisrKSB7XG4gICAgICAgIGl0ZW0gPSBtb2RlbFtqXTtcbiAgICAgICAgYmV6aWVyLnB1c2goaXNBcnJheShpdGVtKVxuICAgICAgICAgID8gdGhpcy5nZXRDb29yZGluYXRlc0luQmV6aWVyKHNlZ21lbnRbaV1bMF0sIHNlZ21lbnRbaV1bMV0sIHNlZ21lbnRbaSsxXVswXSwgc2VnbWVudFtpKzFdWzFdLCBpdGVtWzBdLCBpdGVtWzFdKVxuICAgICAgICAgIDogaXRlbVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBiZXppZXIuam9pbignICcpLnJlcGxhY2UoL1xcc1tBLVpdJC8sICcnKTtcbiAgfSxcblxuICAvKipcbiAgICogUHJvamVjdCBhIGdpdmVuIChMcCkgcXVhcnRlciBwZXJpb2QgbG9uZyBCZXppZXIgc3BsaW5lIChDKSBvbnRvIGFuIChMbCkgZGlhbWV0ZXIgY2lyY2xlLlxuICAgKlxuICAgKiBAcGFyYW0gcGFydGljbGUgICBUeXBlIG9mIHBhcnRpY2xlLCBlLmcuOiBcInBob3RvblwiXG4gICAqIEBwYXJhbSB0aWxlICAgICAgIChDKSBDdXJ2ZSBzZWdtZW50XG4gICAqIEBwYXJhbSBwZXJpb2QgICAgIChOKSBMZW5ndGggb2YgYSAxLzQgcGVyaW9kXG4gICAqIEBwYXJhbSBsZW5ndGggICAgIChMKSBMZW5ndGhcbiAgICogQHJldHVybnMge3N0cmluZ30gU1ZHIHBhdGhcbiAgICovXG4gIGxvb3A6IGZ1bmN0aW9uKHBhcnRpY2xlLCB0aWxlLCBwZXJpb2QsIGxlbmd0aCkge1xuXG4gICAgdmFyIGN3ICAgICAgPSB0cnVlO1xuICAgIHZhciB0aGV0YSAgID0gMiAqIE1hdGguYXNpbigyICogcGVyaW9kIC8gbGVuZ3RoKTtcbiAgICB2YXIgbnVtICAgICA9IDIgKiBQSSAvIHRoZXRhO1xuICAgIHZhciBzZWdtZW50ID0gW107XG4gICAgdmFyIGxpZnQgICAgPSAoY3cgPyAtMC41IDogMC41KTtcbiAgICB2YXIgYmV6aWVyICA9IFsnTScsIChwYXJ0aWNsZSA9PT0gJ2dsdW9uJyA/IGxpZnQgKyAnLDAnIDogJzAsJyArIGxpZnQpXTtcblxuICAgIC8vIGZpbmQgdGhlIG1vZGlmaWVkIGRpc3RhbmNlIHN1Y2ggdGhhdCB0aGUgbnVtYmVyIG9mIHRpbGVzIGlzIGFuIGludGVnZXJcbiAgICBmb3IodmFyIHggPSAtMC4xLCBkaXMgPSBsZW5ndGg7IE1hdGguZmxvb3IobnVtKSAlIDQgfHwgbnVtIC0gTWF0aC5mbG9vcihudW0pID4gMC4xOyB4ICs9IDAuMDAxKSB7XG5cbiAgICAgIGxlbmd0aCA9ICgxICsgeCkgKiBkaXM7XG4gICAgICB0aGV0YSAgPSAyICogTWF0aC5hc2luKDIgKiBwZXJpb2QgLyBsZW5ndGgpO1xuICAgICAgbnVtICAgID0gMiAqIFBJIC8gdGhldGE7XG4gICAgfVxuXG4gICAgLy8gZ2V0IGNvb3JkaW5hdGUgcGFpcnMgZm9yIHRoZSBlbmRwb2ludCBvZiBzZWdtZW50XG4gICAgZm9yKHZhciBuID0gMDsgbiA8PSBudW07IG4rKykge1xuXG4gICAgICB2YXIgc3ggPSAwLjUgKiBsZW5ndGggKiAoMSAtIE1hdGguY29zKHRoZXRhICogbikpO1xuICAgICAgdmFyIHN5ID0gMC41ICogbGVuZ3RoICogTWF0aC5zaW4odGhldGEgKiBuKTtcbiAgICAgIHNlZ21lbnQucHVzaChbc3gsIHN5XSk7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMCwgbCA9IHNlZ21lbnQubGVuZ3RoIC0gMSwgbW9kZWw7IGkgPCBsOyBpKyspIHtcblxuICAgICAgLy8gdHdvIHBob3RvbiB0aWxlcyBmb3JtIGEgcGVyaW9kIHdoZXJlYXMgb25lIGdsdW9uIHRpbGUgaXMgYSBwZXJpb2RcbiAgICAgIG1vZGVsID0gKHBhcnRpY2xlID09PSAncGhvdG9uJyA/IHRpbGVbaSAlIDJdIDogdGlsZSk7XG5cbiAgICAgIC8vIGdldCBiZXppZXIgcGF0aCBmb3IgcGhvdG9uIGFuZCBnbHVvbiBhcmNcbiAgICAgIGZvcih2YXIgaiA9IDAsIG0gPSBtb2RlbC5sZW5ndGgsIGl0ZW07IGogPCBtOyBqKyspIHtcblxuICAgICAgICBpdGVtID0gbW9kZWxbal07XG4gICAgICAgIGJlemllci5wdXNoKGlzQXJyYXkoaXRlbSlcbiAgICAgICAgICA/IHRoaXMuZ2V0Q29vcmRpbmF0ZXNJbkJlemllcihzZWdtZW50W2ldWzBdLCBzZWdtZW50W2ldWzFdLCBzZWdtZW50W2krMV1bMF0sIHNlZ21lbnRbaSsxXVsxXSwgaXRlbVswXSwgaXRlbVsxXSlcbiAgICAgICAgICA6IGl0ZW1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmV6aWVyLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHNbQS1aXSQvLCAnJykgKyAnIFonO1xuICB9XG59OyIsInZhciBfX2hhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIF9fZXh0ZW5kczogZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH1cbn07IiwidmFyIFBhcnNlckZhY3RvcnkgPSByZXF1aXJlKCcuL3BhcnNlcnMvUGFyc2VyRmFjdG9yeScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgRmV5bm1hbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERyYXcgZGlhZ3JhbSBvbnRvIGNhbnZhcy5cbiAgICogQHBhcmFtIGNhbnZhcyBJZCBvZiBjYW52YXMgZWxlbWVudFxuICAgKiBAcGFyYW0gZGF0YSAgIERpYWdyYW0gcHJvcGVydGllc1xuICAgKi9cbiAgRmV5bm1hbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcywgZGF0YSkge1xuXG4gICAgaWYgKHR5cGVvZiBjYW52YXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgY2FudmFzI2lkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdmdDYW52YXMgID0gbmV3IFNWRyhjYW52YXMpO1xuICAgIHZhciBwYXJzZXIgICAgID0gUGFyc2VyRmFjdG9yeS5nZXRQYXJzZXIoZGF0YS5sYW5nKTtcbiAgICB2YXIgc3RhZ2UgICAgICA9IHBhcnNlci5wYXJzZShkYXRhKTtcblxuICAgIHN0YWdlLnNldENhbnZhcyhzdmdDYW52YXMpLmRyYXcoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBGZXlubWFuO1xufSkoKTsiLCJ2YXIgU3RhZ2UgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIExhdGV4UGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBMYXRleFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgU3RhZ2UoKTtcbiAgfTtcblxuICByZXR1cm4gTGF0ZXhQYXJzZXI7XG59KSgpOyIsInZhciBTdGFuZGFyZFBhcnNlciA9IHJlcXVpcmUoJy4vU3RhbmRhcmRQYXJzZXInKTtcbnZhciBMYXRleFBhcnNlciAgICA9IHJlcXVpcmUoJy4vTGF0ZXhQYXJzZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0UGFyc2VyOiBmdW5jdGlvbihsYW5nKSB7XG5cbiAgICBpZihsYW5nID09PSAnbGF0ZXgnKSB7XG4gICAgICByZXR1cm4gbmV3IExhdGV4UGFyc2VyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3RhbmRhcmRQYXJzZXIoKTtcbiAgfVxufTsiLCJ2YXIgU3RhZ2UgICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG52YXIgUGFydGljbGVHZW5lcmF0b3IgPSByZXF1aXJlKCcuLy4uL1BhcnRpY2xlR2VuZXJhdG9yJyk7XG52YXIgVmVydGV4ICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1ZlcnRleCcpO1xudmFyIEV4Y2hhbmdlICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9FeGNoYW5nZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBTdGFuZGFyZFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhbmRhcmRQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcblxuICAgIF9zZXRUaXRsZShzdGFnZSwgZGF0YS50aXRsZSk7XG4gICAgX3NldExheW91dChzdGFnZSwgZGF0YS5sYXlvdXQpO1xuICAgIF9zZXREaW1lbnNpb24oc3RhZ2UsIGRhdGEud2lkdGgsIGRhdGEuaGVpZ2h0KTtcbiAgICBfc2V0U2hvd0F4ZXMoc3RhZ2UsIGRhdGEuc2hvd0F4ZXMpO1xuICAgIF9zZXRQcm9wYWdhdG9ycyhzdGFnZSwgZGF0YS5wcm9wYWdhdG9ycyk7XG4gICAgX3NldFZlcnRpY2VzKHN0YWdlLCBkYXRhLnZlcnRpY2VzKTtcbiAgICBfc2V0RXhjaGFuZ2VzKHN0YWdlLCBkYXRhLmV4Y2hhbmdlcyk7XG5cbiAgICByZXR1cm4gc3RhZ2U7XG4gIH07XG5cbiAgdmFyIF9zZXRUaXRsZSA9IGZ1bmN0aW9uKHN0YWdlLCB0aXRsZSkge1xuXG4gICAgaWYodGl0bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UudGl0bGUgPSB0aXRsZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRMYXlvdXQgPSBmdW5jdGlvbihzdGFnZSwgbGF5b3V0KSB7XG5cbiAgICBpZihsYXlvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UubGF5b3V0ID0gbGF5b3V0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldERpbWVuc2lvbiA9IGZ1bmN0aW9uKHN0YWdlLCB3aWR0aCwgaGVpZ2h0KSB7XG5cbiAgICBpZih3aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS53aWR0aCA9IHdpZHRoO1xuICAgIH1cbiAgICBpZihoZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFNob3dBeGVzID0gZnVuY3Rpb24oc3RhZ2UsIHNob3dBeGVzKSB7XG5cbiAgICBpZihzaG93QXhlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5zaG93QXhlcyA9IHNob3dBeGVzO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFByb3BhZ2F0b3JzID0gZnVuY3Rpb24oc3RhZ2UsIHByb3BhZ2F0b3JzKSB7XG5cbiAgICBpZihwcm9wYWdhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcHJvcGFnYXRvcnMhJyk7XG4gICAgfVxuXG4gICAgcHJvcGFnYXRvcnMuZm9yRWFjaChmdW5jdGlvbihwcm9wYWdhdG9yQXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgcCA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHByb3BhZ2F0b3JBdHRyaWJ1dGVzKTtcblxuICAgICAgaWYocCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YWdlLnByb3BhZ2F0b3JzLnB1c2gocCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9zZXRWZXJ0aWNlcyA9IGZ1bmN0aW9uKHN0YWdlLCB2ZXJ0aWNlcykge1xuXG4gICAgaWYodmVydGljZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHZlcnRpY2VzIScpO1xuICAgIH1cblxuICAgIHZlcnRpY2VzLmZvckVhY2goZnVuY3Rpb24odmVydGV4QXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgdiA9IG5ldyBWZXJ0ZXgodmVydGV4QXR0cmlidXRlcy5pZCwgdmVydGV4QXR0cmlidXRlcy5pbmJvdW5kLCB2ZXJ0ZXhBdHRyaWJ1dGVzLm91dGJvdW5kKTtcblxuICAgICAgaWYodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YWdlLnZlcnRpY2VzLnB1c2godik7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9zZXRFeGNoYW5nZXMgPSBmdW5jdGlvbihzdGFnZSwgZXhjaGFuZ2VzKSB7XG5cbiAgICBpZihleGNoYW5nZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGV4Y2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGV4Y2hhbmdlQXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgZSA9IG5ldyBFeGNoYW5nZShleGNoYW5nZUF0dHJpYnV0ZXMuaWQsIGV4Y2hhbmdlQXR0cmlidXRlcy5pbmJvdW5kLCBleGNoYW5nZUF0dHJpYnV0ZXMub3V0Ym91bmQsIGV4Y2hhbmdlQXR0cmlidXRlcy5wYXJ0aWNsZXMpO1xuXG4gICAgICBpZihlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhZ2UuZXhjaGFuZ2VzLnB1c2goZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIFN0YW5kYXJkUGFyc2VyO1xufSkoKTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgX2NvbG9yICA9ICcjMDAwJztcbiAgdmFyIF9sZW5ndGggPSAxMDk7XG5cbiAgdmFyIEFic3RyYWN0UGFydGljbGUgPSBmdW5jdGlvbihpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHRoaXMuYW50aSAgID0gYW50aTtcbiAgICB0aGlzLmNvbG9yICA9IGNvbG9yICB8fCBfY29sb3I7XG4gICAgdGhpcy5sZW5ndGggPSBsZW5ndGggfHwgX2xlbmd0aDtcbiAgICB0aGlzLnggICAgICA9IDA7XG4gICAgdGhpcy55ICAgICAgPSAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgQWJzdHJhY3RQYXJ0aWNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBhYnN0cmFjdCBtZXRob2QhJyk7XG4gIH07XG5cbiAgQWJzdHJhY3RQYXJ0aWNsZS5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBhYnN0cmFjdCBtZXRob2QhJyk7XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0UGFydGljbGU7XG5cbn0pKCk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoRWxlY3Ryb24sIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gRWxlY3Ryb24oaWQsIGFudGksIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIEVsZWN0cm9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIGFudGkgfHwgZmFsc2UsIGNvbG9yLCBsZW5ndGhdKTtcbiAgfVxuXG4gIEVsZWN0cm9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICBjYW52YXMucGF0aCh0aGlzLmdldFBhdGgoJ2xpbmUnKSlcbiAgICAgICAgICAuZmlsbCgnbm9uZScpXG4gICAgICAgICAgLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KVxuICAgICAgICAgIC50cmFuc2xhdGUoMTUwLCAxNTApO1xuICB9O1xuXG4gIEVsZWN0cm9uLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oc2hhcGUpIHtcblxuICAgIHZhciB0aWxlID0gWyBbMSwgMV0sIFsyLCAxXSBdO1xuICAgIHZhciBsICAgID0gMTtcblxuICAgIHN3aXRjaChzaGFwZSkge1xuICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZSh0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdhcmMnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmFyYygnZWxlY3Ryb24nLCB0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdsb29wJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5sb29wKCdlbGVjdHJvbicsIHRpbGUsIGwsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZSh0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBFbGVjdHJvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhHbHVvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBHbHVvbihpZCwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgR2x1b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgdW5kZWZpbmVkLCBjb2xvciB8fCAnIzAwOTkzMycsIGxlbmd0aCB8fCA5Nl0pO1xuICB9XG5cbiAgR2x1b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHZhciBsb29wTGVuZ3RoID0gMTI7XG4gICAgdmFyIGxvb3BzICAgICAgPSBNYXRoLmZsb29yKHRoaXMubGVuZ3RoIC8gbG9vcExlbmd0aCk7XG4gICAgdmFyIHBhdGhTdHJpbmcgPSAnJztcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsb29wczsgaSsrKSB7XG5cbiAgICAgIGlmKGkgPT09IDApIHtcbiAgICAgICAgcGF0aFN0cmluZyArPSAnTSc7XG4gICAgICB9XG5cbiAgICAgIHBhdGhTdHJpbmcgKz0gKGkgKiAxMikgKyAnLDEgUScgKyAoaSAqIDEyICsgMykgKyAnLDEgJyArIChpICogMTIgKyA2KSArICcsMiBRJyArIChpICogMTIgKyA5KSArICcsNCAnICsgKGkgKiAxMiArIDEwKSArICcsOSBRJyArIChpICogMTIgKyAxMikgKyAnLDE1ICcgKyAoaSAqIDEyICsgNikgKyAnLDE1IFEnICsgKGkgKiAxMikgKyAnLDE1ICcgKyAoaSAqIDEyICsgMikgKyAnLDkgUScgKyAoaSAqIDEyICsgMykgKyAnLDQgJyArIChpICogMTIgKyA2KSArICcsMiBRJyArIChpICogMTIgKyA5KSArICcsMSAnXG5cbiAgICAgIGlmKGkgKyAxID09PSBsb29wcykge1xuICAgICAgICBwYXRoU3RyaW5nICs9IChpICogMTIgKyAxMikgKyAnLDAnXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoY2FudmFzKSB7XG5cbiAgICAgIGNhbnZhcy5wYXRoKHBhdGhTdHJpbmcsIHRydWUpLmZpbGwoJ25vbmUnKS5zdHJva2UoeyB3aWR0aDogMSwgY29sb3I6IHRoaXMuY29sb3IgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0aFN0cmluZztcbiAgfTtcblxuICBHbHVvbi5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIHJldHVybiBHbHVvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKFBob3RvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBQaG90b24oaWQsIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIFBob3Rvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCB1bmRlZmluZWQsIGNvbG9yIHx8ICcjMDA2NkZGJywgbGVuZ3RoIHx8IDEwOV0pO1xuICB9XG5cbiAgUGhvdG9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB2YXIgcGF0aCA9IHRoaXMuZ2V0UGF0aCgnYXJjJyk7XG4gICAgY2FudmFzLnBhdGgocGF0aCwgdHJ1ZSlcbiAgICAgICAgICAuZmlsbCgnbm9uZScpXG4gICAgICAgICAgLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KVxuICAgICAgICAgIC50cmFuc2xhdGUoMTUwLCAxNTApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHByb3hpbWF0aW9uIG9mIHRoZSBmaXJzdCBxdWFydGVyIG9mIG9uZSBwZXJpb2Qgb2YgYSBzaW5lIGN1cnZlXG4gICAqIGlzIGEgY3ViaWMgQmV6aWVyIGN1cnZlIHdpdGggdGhlIGZvbGxvd2luZyBjb250cm9sIHBvaW50czpcbiAgICpcbiAgICogKDAsIDApIChsYW1iZGEgKiBwIC8gUEksIGxhbWJkYSAqIGEgLyAyKSAoMiAqIHAgLyBQSSwgYSkgKHAsIGEpXG4gICAqXG4gICAqIFJlZmVyZW5jZXM6XG4gICAqXG4gICAqIFsxXSBodHRwOi8vbWF0aGIuaW4vMTQ0N1xuICAgKiBbMl0gaHR0cHM6Ly9naXRodWIuY29tL3Bob3Rpbm8vanF1ZXJ5LWZleW4vYmxvYi9tYXN0ZXIvanMvanF1ZXJ5LmZleW4tMS4wLjEuanNcbiAgICpcbiAgICogQHBhcmFtIHNoYXBlXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgUGhvdG9uLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oc2hhcGUpIHtcblxuICAgIHZhciBQSSAgICAgPSBNYXRoLlBJO1xuICAgIHZhciBsYW1iZGEgPSAwLjUxMTI4NzMzO1xuICAgIHZhciBhICAgICAgPSA1O1xuICAgIHZhciBiICAgICAgPSAwLjUgKiBsYW1iZGEgKiBhO1xuICAgIHZhciBwICAgICAgPSA1O1xuICAgIHZhciBxICAgICAgPSAyICogcCAvIFBJO1xuICAgIHZhciB0ICAgICAgPSBsYW1iZGEgKiBwIC8gUEk7XG4gICAgdmFyIGRpciAgICA9IGZhbHNlO1xuXG4gICAgdmFyIHB0cyA9IChkaXJcbiAgICAgID8gW1swLCAwXSwgJ0MnLCBbdCwgLWJdLCBbcSwgLWFdLCBbcCwgLWFdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwLCAwXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbMiAqIHAgKyBxLCBhXSwgWzMgKiBwLCBhXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbNCAqIHAgLSB0LCBiXV1cbiAgICAgIDogW1swLCAwXSwgJ0MnLCBbdCwgYl0sIFtxLCBhXSwgW3AsIGFdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCAtIHQsIGJdLCBbMiAqIHAsIDBdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCArIHEsIC1hXSwgWzMgKiBwLCAtYV0sXG4gICAgICAgICAgICAgICAgICdTJywgWzQgKiBwIC0gdCwgLWJdXVxuICAgICk7XG5cbiAgICB2YXIgdGlsZSA9IChkaXJcbiAgICAgID8gW1snQycsIFt0LCAtYl0sIFtxLCAtYV0sIFtwLCAtYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCArIDAuNSwgMF1dLFxuICAgICAgICAgWydDJywgW3QsIGJdLCBbcSwgYV0sIFtwLCBhXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwIC0gMC41LCAwXV1dXG4gICAgICA6IFtbJ0MnLCBbdCwgYl0sIFtxLCBhXSwgW3AsIGFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgYl0sIFsyICogcCAtIDAuNSwgMF1dLFxuICAgICAgICAgWydDJywgW3QsIC1iXSwgW3EsIC1hXSwgW3AsIC1hXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwICsgMC41LCAwXV1dXG4gICAgKTtcblxuICAgIHN3aXRjaChzaGFwZSkge1xuICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZShwdHMsIDQgKiBwLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdhcmMnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmFyYygncGhvdG9uJywgdGlsZSwgcCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnbG9vcCc6XG4gICAgICAgIHJldHVybiBCZXppZXIubG9vcCgncGhvdG9uJywgdGlsZSwgcCwgdGhpcy5sZW5ndGgpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgNCAqIHAsIHRoaXMubGVuZ3RoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFBob3RvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhRdWFyaywgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBRdWFyayhpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgUXVhcmsuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgYW50aSB8fCBmYWxzZSwgY29sb3IsIGxlbmd0aF0pO1xuICB9XG5cbiAgUXVhcmsucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICB9O1xuXG4gIFF1YXJrLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cbiAgcmV0dXJuIFF1YXJrO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiXX0=
(7)
});
;