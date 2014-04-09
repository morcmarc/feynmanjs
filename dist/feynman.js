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
      family : 'Georgia',
      size   :  14,
      style  : 'italic',
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
var Bezier           = require('./../helpers/Bezier');

module.exports = (function(_super) {

  Klass.__extends(Gluon, _super);

  function Gluon(id, color, length) {

    Gluon.__super__.constructor.apply(this, [id, undefined, color || '#009933', length || 96]);
  }

  Gluon.prototype.draw = function(canvas) {

    var path = this.getPath('arc');
    canvas.path(path, true)
      .fill('none')
      .stroke({ width: 1, color: this.color })
      .translate(150, 150);
  };

  Gluon.prototype.getPath = function(shape) {

    var gluon = {
      width  : 15,   // the coil width of gluon propagators
      height : 15,   // the coil height of gluon propagators
      factor : 0.75, // the factor parameter for gluon propagators
      percent: 0.6,  // the percent parameter for gluon propagators
      scale  : 1.15  // the scale parameter for gluon arcs and loops
    };

    var kappa = 0.55191502;
    // a and b are one-half of the ellipse's major and minor axes
    var a     = gluon.height * gluon.factor;
    var b     = gluon.width  * gluon.percent;
    // c and d are one-half of major and minor axes of the other ellipse
    var c     = gluon.height * (gluon.factor - 0.5);
    var d     = gluon.width  * (1 - gluon.percent);

    var dir   = false;
    var pts   = (dir
      ? [[0, 0], 'A ' + a + ' ' + b, 0, 0, 1, [a, b],
                 'A ' + c + ' ' + d, 0, 1, 1, [a - 2 * c, b],
                 'A ' + a + ' ' + b, 0, 0, 1]
      : [[0, 0], 'A ' + a + ' ' + b, 0, 0, 0, [a, -b],
                 'A ' + c + ' ' + d, 0, 1, 0, [a - 2 * c, -b],
                 'A ' + a + ' ' + b, 0, 0, 0]
    );

    a = (dir ? a : gluon.scale * a);
    var lift = a / Math.pow(this.length, 0.6);

    var tile = (dir
      ? ['C', [kappa * a, lift], [a, b - kappa * b], [a, b],
         'C', [a, b + kappa * d], [a - c + kappa * c, b + d], [a - c, b + d],
         'S', [a - 2 * c, b + kappa * d], [a - 2 * c, b],
         'C', [a - 2 * c, b - kappa * b], [2 * (a - c) - kappa * a, 0], [2 * (a - c), -lift]]
      : ['C', [kappa * a, lift], [a, -b + kappa * b], [a, -b],
         'C', [a, -b - kappa * d], [a - c + kappa * c, -b - d], [a - c, -b - d],
         'S', [a - 2 * c, -b - kappa * d], [a - 2 * c, -b],
         'C', [a - 2 * c, -b + kappa * b], [2 * (a - c) - kappa * a, 0], [2 * (a - c), -lift]]
    );

    switch(shape) {
      case 'line':
        return Bezier.line(pts, gluon.height, this.length);
      case 'arc':
        return Bezier.arc('gluon', tile, a - c, this.length);
      case 'loop':
        return Bezier.loop('gluon', tile, a - c, this.length);
      default:
        return Bezier.line(pts, gluon.height, this.length);
    }
  };

  return Gluon;

})(AbstractParticle);
},{"./../helpers/Bezier":5,"./../helpers/Klass":6,"./AbstractParticle":11}],14:[function(require,module,exports){
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9FeGNoYW5nZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1BhcnRpY2xlR2VuZXJhdG9yLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvU3RhZ2UuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9WZXJ0ZXguanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9oZWxwZXJzL0Jlemllci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2hlbHBlcnMvS2xhc3MuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvTGF0ZXhQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1BhcnNlckZhY3RvcnkuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvQWJzdHJhY3RQYXJ0aWNsZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL0VsZWN0cm9uLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvR2x1b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9QaG90b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9RdWFyay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vUGFydGljbGVHZW5lcmF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEV4Y2hhbmdlID0gZnVuY3Rpb24oaWQsIGluYm91bmQsIG91dGJvdW5kLCBwYXJ0aWNsZXMpIHtcblxuICAgIGlmKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZihpbmJvdW5kID09PSB1bmRlZmluZWQgfHwgb3V0Ym91bmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeGNoYW5nZSBtdXN0IGhhdmUgYm90aCBhbiBpbmJvdW5kIGFuZCBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgaWYocGFydGljbGVzID09PSB1bmRlZmluZWQgfHwgcGFydGljbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBwYXJ0aWNsZXMgZ2l2ZW4hJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgICAgPSBpZDtcbiAgICB0aGlzLmluYm91bmQgICA9IGluYm91bmQ7XG4gICAgdGhpcy5vdXRib3VuZCAgPSBvdXRib3VuZDtcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuXG4gICAgX2NyZWF0ZUV4Y2hhbmdlUGFydGljbGVzKHRoaXMsIHBhcnRpY2xlcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFeGNoYW5nZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZSkge1xuICAgICAgcGFydGljbGUuZHJhdyhjYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfY3JlYXRlRXhjaGFuZ2VQYXJ0aWNsZXMgPSBmdW5jdGlvbihjdHgsIHBhcnRpY2xlcykge1xuXG4gICAgcGFydGljbGVzLmZvckVhY2goZnVuY3Rpb24ocGFydGljbGVBdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciBwID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUocGFydGljbGVBdHRyaWJ1dGVzKTtcblxuICAgICAgaWYocCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN0eC5wYXJ0aWNsZXMucHVzaChwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gRXhjaGFuZ2U7XG59KSgpOyIsInZhciBFbGVjdHJvbiA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvRWxlY3Ryb24nKTtcbnZhciBRdWFyayAgICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvUXVhcmsnKTtcbnZhciBHbHVvbiAgICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvR2x1b24nKTtcbnZhciBQaG90b24gICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvUGhvdG9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldFBhcnRpY2xlOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2UtJykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVjdHJvbihkYXRhLmlkLCBmYWxzZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2UrJykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVjdHJvbihkYXRhLmlkLCB0cnVlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAncScpIHtcbiAgICAgIHJldHVybiBuZXcgUXVhcmsoZGF0YS5pZCwgZmFsc2UsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdhcScpIHtcbiAgICAgIHJldHVybiBuZXcgUXVhcmsoZGF0YS5pZCwgdHJ1ZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2cnKSB7XG4gICAgICByZXR1cm4gbmV3IEdsdW9uKGRhdGEuaWQsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdwaCcpIHtcbiAgICAgIHJldHVybiBuZXcgUGhvdG9uKGRhdGEuaWQsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFN0YWdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBHZW5lcmljIEF0dHJpYnV0ZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMudGl0bGUgICAgPSAnRmV5bm1hbic7XG4gICAgdGhpcy5sYXlvdXQgICA9ICd0aW1lLXNwYWNlJztcbiAgICB0aGlzLndpZHRoICAgID0gMTAwO1xuICAgIHRoaXMuaGVpZ2h0ICAgPSAxMDA7XG4gICAgdGhpcy5zaG93QXhlcyA9IHRydWU7XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKHJlcXVpcmVkKVxuICAgIHRoaXMucHJvcGFnYXRvcnMgPSBbXTtcbiAgICB0aGlzLnZlcnRpY2VzICAgID0gW107XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMuZXhjaGFuZ2VzICAgPSBbXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5zZXRDYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIHRoaXMuY2FudmFzLnNpemUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBfZHJhd1RpdGxlKHRoaXMpO1xuICAgIF9kcmF3VmVydGljZXModGhpcyk7XG4gICAgX2RyYXdQcm9wYWdhdG9ycyh0aGlzKTtcbiAgICBfZHJhd0V4Y2hhbmdlcyh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgX2RyYXdUaXRsZSA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgY3R4LmNhbnZhcy50ZXh0KGN0eC50aXRsZSkuZm9udCh7XG4gICAgICBmYW1pbHkgOiAnR2VvcmdpYScsXG4gICAgICBzaXplICAgOiAgMTQsXG4gICAgICBzdHlsZSAgOiAnaXRhbGljJyxcbiAgICAgIGFuY2hvciA6ICdsZWZ0J1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZHJhd1ZlcnRpY2VzID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHgudmVydGljZXMuZm9yRWFjaChmdW5jdGlvbih2ZXJ0ZXgpIHtcbiAgICAgIHZlcnRleC5kcmF3KGN0eC5jYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZHJhd1Byb3BhZ2F0b3JzID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHgucHJvcGFnYXRvcnMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZSkge1xuICAgICAgcGFydGljbGUuZHJhdyhjdHguY2FudmFzKTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX2RyYXdFeGNoYW5nZXMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC5leGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbihleGNoYW5nZSkge1xuICAgICAgZXhjaGFuZ2UuZHJhdyhjdHguY2FudmFzKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gU3RhZ2U7XG59KSgpOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBWZXJ0ZXggPSBmdW5jdGlvbihpZCwgaW5ib3VuZCwgb3V0Ym91bmQpIHtcblxuICAgIGlmKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZihpbmJvdW5kID09PSB1bmRlZmluZWQgJiYgb3V0Ym91bmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdWZXJ0aWNlcyBtdXN0IGhhdmUgZWl0aGVyIGFuIGluYm91bmQgb3Igb3V0Ym91bmQgYXR0cmlidXRlIScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgIT09IHVuZGVmaW5lZCAmJiBpbmJvdW5kLmxlbmd0aCA9PT0gMCAmJiBvdXRib3VuZCAhPT0gdW5kZWZpbmVkICYmIG91dGJvdW5kLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdWZXJ0aWNlcyBtdXN0IGhhdmUgZWl0aGVyIGFuIGluYm91bmQgb3Igb3V0Ym91bmQgYXR0cmlidXRlIScpO1xuICAgIH1cblxuICAgIHRoaXMuaWQgICAgICAgPSBpZDtcbiAgICB0aGlzLmluYm91bmQgID0gaW5ib3VuZCAgfHwgW107XG4gICAgdGhpcy5vdXRib3VuZCA9IG91dGJvdW5kIHx8IFtdO1xuICAgIHRoaXMueCAgICAgICAgPSAwO1xuICAgIHRoaXMueSAgICAgICAgPSAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgVmVydGV4LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICBjYW52YXMuY2lyY2xlKDMpXG4gICAgICAgICAgLmZpbGwoeyBjb2xvcjogJyMwMDAnIH0pXG4gICAgICAgICAgLnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gIH07XG5cbiAgcmV0dXJuIFZlcnRleDtcbn0pKCk7IiwidmFyIFBJICAgICAgPSBNYXRoLlBJO1xudmFyIGlzQXJyYXkgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBub3JtYWxpemVQYXRoU3RyaW5nOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzdHIgPSAnJztcblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIGl0ZW0gPSBhcmd1bWVudHNbaV07XG4gICAgICBzdHIgKz0gJyAnICsgKHR5cGVvZiBpdGVtICE9PSAnbnVtYmVyJyA/XG4gICAgICAgIGl0ZW0gOlxuICAgICAgICBpdGVtLnRvRml4ZWQoMykucmVwbGFjZSgvKC5cXGQqPykwKyQvLCAnJDEnKS5yZXBsYWNlKC9cXC4kLywgJycpXG4gICAgICApO1xuICAgIH1cbiAgICB2YXIgdHJpbW1lZCA9IHN0ci50cmltKCk7XG5cbiAgICByZXR1cm4gdHJpbW1lZC5yZXBsYWNlKC8gPywgPy9nLCAnLCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgY29vcmRpbmF0ZXMgb2YgYSBnaXZlbiBwb2ludCBpbiByZWZlcmVuY2UgdG8gYSBnaXZlbiBCZXppZXIgY3VydmUgc2VnbWVudFxuICAgKlxuICAgKiBAcGFyYW0gc3ggU3RhcnQgb2Ygc2VnbWVudCBYXG4gICAqIEBwYXJhbSBzeSBTdGFydCBvZiBzZWdtZW50IFlcbiAgICogQHBhcmFtIGV4IEVuZCBvZiBzZWdtZW50IFhcbiAgICogQHBhcmFtIGV5IEVuZCBvZiBzZWdtZW50IFlcbiAgICogQHBhcmFtIHggIFBvaW50IHRvIGZpdCBYXG4gICAqIEBwYXJhbSB5ICBQb2ludCB0byBmaXQgWVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldENvb3JkaW5hdGVzSW5CZXppZXI6IGZ1bmN0aW9uKHN4LCBzeSwgZXgsIGV5LCB4LCB5KSB7XG5cbiAgICB2YXIgYW5nID0gTWF0aC5hdGFuMihleSAtIHN5LCBleCAtIHN4KTtcblxuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVBhdGhTdHJpbmcoeCAqIE1hdGguY29zKGFuZykgLSB5ICogTWF0aC5zaW4oYW5nKSArIHN4LCAnLCcsIHggKiBNYXRoLnNpbihhbmcpICsgeSAqIE1hdGguY29zKGFuZykgKyBzeSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIDEvNCBwZXJpb2QgbG9uZyBCZXppZXIgc3BsaW5lIChDKSBvbnRvIGFuIChMbCkgbG9uZyBzdHJhaWdodCBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgIEN1cnZlIHNlZ21lbnRcbiAgICogQHBhcmFtIHBlcmlvZCAgICAgKExwKSBMZW5ndGggb2YgYSBxdWFydGVyIHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTGwpIExlbmd0aCBvZiBwcm9wYWdhdG9yXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBsaW5lOiBmdW5jdGlvbih0aWxlLCBwZXJpb2QsIGxlbmd0aCkge1xuXG4gICAgdmFyIGJlemllciA9IFsnTSddO1xuICAgIHZhciBudW0gICAgPSBNYXRoLmZsb29yKGxlbmd0aCAvIHBlcmlvZCk7XG4gICAgdmFyIGV4dHJhICA9IGxlbmd0aCAtIHBlcmlvZCAqIG51bSArIDAuMTtcblxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gbnVtOyBuKyspIHtcblxuICAgICAgZm9yKHZhciBpID0gMCwgbCA9IHRpbGUubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgICAgaXRlbSA9IHRpbGVbaV07XG5cbiAgICAgICAgaWYoaXNBcnJheShpdGVtKSkge1xuXG4gICAgICAgICAgaWYobiA8IG51bSB8fCBpdGVtWzBdIDwgZXh0cmEpIHtcbiAgICAgICAgICAgIGJlemllci5wdXNoKHRoaXMubm9ybWFsaXplUGF0aFN0cmluZyhpdGVtWzBdICsgcGVyaW9kICogbiwgJywnLCBpdGVtWzFdKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZXppZXIucHVzaChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXppZXIuam9pbignICcpLnJlcGxhY2UoL1xcc1tBLVpdW15BLVpdKiQvLCAnJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIHF1YXJ0ZXIgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGxvbmcgYXJjLlxuICAgKlxuICAgKiBAcGFyYW0gcGFydGljbGUgICBUeXBlIG9mIHBhcnRpY2xlLCBlLmcuOiBcInBob3RvblwiXG4gICAqIEBwYXJhbSB0aWxlICAgICAgIChDKSAgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTHApIExlbmd0aCBvZiBhIDEvNCBwZXJpb2RcbiAgICogQHBhcmFtIGxlbmd0aCAgICAgKExsKSBMZW5ndGhcbiAgICogQHJldHVybnMge3N0cmluZ30gU1ZHIHBhdGhcbiAgICovXG4gIGFyYzogZnVuY3Rpb24ocGFydGljbGUsIHRpbGUsIHBlcmlvZCwgbGVuZ3RoKSB7XG5cbiAgICB2YXIgdGVuc2lvbiA9IDI7XG4gICAgdmFyIHQgICAgICAgPSAwLjI1ICogTWF0aC5tYXgodGVuc2lvbiwgMik7XG4gICAgdmFyIHBoaSAgICAgPSBNYXRoLmFjb3MoLTAuNSAvIHQpO1xuICAgIHZhciB0aGV0YSAgID0gLTIgKiBNYXRoLmFzaW4ocGVyaW9kIC8gKHQgKiBsZW5ndGgpKTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBiZXppZXIgID0gWydNJywgJzAsMCddO1xuXG4gICAgLy8gZ2V0IGNvb3JkaW5hdGUgcGFpcnMgZm9yIHRoZSBlbmRwb2ludCBvZiBzZWdtZW50XG4gICAgZm9yKHZhciBuID0gMDsgbiA8PSAoUEkgLSAyICogcGhpKSAvIHRoZXRhOyBuKyspIHtcbiAgICAgIHNlZ21lbnQucHVzaChbbGVuZ3RoICogKHQgKiBNYXRoLmNvcyh0aGV0YSAqIG4gKyBwaGkpICsgMC41KSwgbGVuZ3RoICogKHQgKiBNYXRoLnNpbih0aGV0YSAqIG4gKyBwaGkpIC0gTWF0aC5zcXJ0KHQgKiB0IC0gMC4yNSkpXSk7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMCwgbCA9IHNlZ21lbnQubGVuZ3RoIC0gMSwgbW9kZWw7IGkgPCBsOyBpKyspIHtcblxuICAgICAgbW9kZWwgPSAocGFydGljbGUgPT09ICdwaG90b24nID8gdGlsZVtpICUgMl0gOiB0aWxlKTtcblxuICAgICAgZm9yKHZhciBqID0gMCwgbSA9IG1vZGVsLmxlbmd0aCwgaXRlbTsgaiA8IG07IGorKykge1xuICAgICAgICBpdGVtID0gbW9kZWxbal07XG4gICAgICAgIGJlemllci5wdXNoKGlzQXJyYXkoaXRlbSlcbiAgICAgICAgICA/IHRoaXMuZ2V0Q29vcmRpbmF0ZXNJbkJlemllcihzZWdtZW50W2ldWzBdLCBzZWdtZW50W2ldWzFdLCBzZWdtZW50W2krMV1bMF0sIHNlZ21lbnRbaSsxXVsxXSwgaXRlbVswXSwgaXRlbVsxXSlcbiAgICAgICAgICA6IGl0ZW1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmV6aWVyLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHNbQS1aXSQvLCAnJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIHF1YXJ0ZXIgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGRpYW1ldGVyIGNpcmNsZS5cbiAgICpcbiAgICogQHBhcmFtIHBhcnRpY2xlICAgVHlwZSBvZiBwYXJ0aWNsZSwgZS5nLjogXCJwaG90b25cIlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTikgTGVuZ3RoIG9mIGEgMS80IHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTCkgTGVuZ3RoXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBsb29wOiBmdW5jdGlvbihwYXJ0aWNsZSwgdGlsZSwgcGVyaW9kLCBsZW5ndGgpIHtcblxuICAgIHZhciBjdyAgICAgID0gdHJ1ZTtcbiAgICB2YXIgdGhldGEgICA9IDIgKiBNYXRoLmFzaW4oMiAqIHBlcmlvZCAvIGxlbmd0aCk7XG4gICAgdmFyIG51bSAgICAgPSAyICogUEkgLyB0aGV0YTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBsaWZ0ICAgID0gKGN3ID8gLTAuNSA6IDAuNSk7XG4gICAgdmFyIGJlemllciAgPSBbJ00nLCAocGFydGljbGUgPT09ICdnbHVvbicgPyBsaWZ0ICsgJywwJyA6ICcwLCcgKyBsaWZ0KV07XG5cbiAgICAvLyBmaW5kIHRoZSBtb2RpZmllZCBkaXN0YW5jZSBzdWNoIHRoYXQgdGhlIG51bWJlciBvZiB0aWxlcyBpcyBhbiBpbnRlZ2VyXG4gICAgZm9yKHZhciB4ID0gLTAuMSwgZGlzID0gbGVuZ3RoOyBNYXRoLmZsb29yKG51bSkgJSA0IHx8IG51bSAtIE1hdGguZmxvb3IobnVtKSA+IDAuMTsgeCArPSAwLjAwMSkge1xuXG4gICAgICBsZW5ndGggPSAoMSArIHgpICogZGlzO1xuICAgICAgdGhldGEgID0gMiAqIE1hdGguYXNpbigyICogcGVyaW9kIC8gbGVuZ3RoKTtcbiAgICAgIG51bSAgICA9IDIgKiBQSSAvIHRoZXRhO1xuICAgIH1cblxuICAgIC8vIGdldCBjb29yZGluYXRlIHBhaXJzIGZvciB0aGUgZW5kcG9pbnQgb2Ygc2VnbWVudFxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gbnVtOyBuKyspIHtcblxuICAgICAgdmFyIHN4ID0gMC41ICogbGVuZ3RoICogKDEgLSBNYXRoLmNvcyh0aGV0YSAqIG4pKTtcbiAgICAgIHZhciBzeSA9IDAuNSAqIGxlbmd0aCAqIE1hdGguc2luKHRoZXRhICogbik7XG4gICAgICBzZWdtZW50LnB1c2goW3N4LCBzeV0pO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBzZWdtZW50Lmxlbmd0aCAtIDEsIG1vZGVsOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIC8vIHR3byBwaG90b24gdGlsZXMgZm9ybSBhIHBlcmlvZCB3aGVyZWFzIG9uZSBnbHVvbiB0aWxlIGlzIGEgcGVyaW9kXG4gICAgICBtb2RlbCA9IChwYXJ0aWNsZSA9PT0gJ3Bob3RvbicgPyB0aWxlW2kgJSAyXSA6IHRpbGUpO1xuXG4gICAgICAvLyBnZXQgYmV6aWVyIHBhdGggZm9yIHBob3RvbiBhbmQgZ2x1b24gYXJjXG4gICAgICBmb3IodmFyIGogPSAwLCBtID0gbW9kZWwubGVuZ3RoLCBpdGVtOyBqIDwgbTsgaisrKSB7XG5cbiAgICAgICAgaXRlbSA9IG1vZGVsW2pdO1xuICAgICAgICBiZXppZXIucHVzaChpc0FycmF5KGl0ZW0pXG4gICAgICAgICAgPyB0aGlzLmdldENvb3JkaW5hdGVzSW5CZXppZXIoc2VnbWVudFtpXVswXSwgc2VnbWVudFtpXVsxXSwgc2VnbWVudFtpKzFdWzBdLCBzZWdtZW50W2krMV1bMV0sIGl0ZW1bMF0sIGl0ZW1bMV0pXG4gICAgICAgICAgOiBpdGVtXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlemllci5qb2luKCcgJykucmVwbGFjZSgvXFxzW0EtWl0kLywgJycpICsgJyBaJztcbiAgfVxufTsiLCJ2YXIgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBfX2V4dGVuZHM6IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9XG59OyIsInZhciBQYXJzZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9wYXJzZXJzL1BhcnNlckZhY3RvcnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEZleW5tYW4gPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEcmF3IGRpYWdyYW0gb250byBjYW52YXMuXG4gICAqIEBwYXJhbSBjYW52YXMgSWQgb2YgY2FudmFzIGVsZW1lbnRcbiAgICogQHBhcmFtIGRhdGEgICBEaWFncmFtIHByb3BlcnRpZXNcbiAgICovXG4gIEZleW5tYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMsIGRhdGEpIHtcblxuICAgIGlmICh0eXBlb2YgY2FudmFzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNhbnZhcyNpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3ZnQ2FudmFzICA9IG5ldyBTVkcoY2FudmFzKTtcbiAgICB2YXIgcGFyc2VyICAgICA9IFBhcnNlckZhY3RvcnkuZ2V0UGFyc2VyKGRhdGEubGFuZyk7XG4gICAgdmFyIHN0YWdlICAgICAgPSBwYXJzZXIucGFyc2UoZGF0YSk7XG5cbiAgICBzdGFnZS5zZXRDYW52YXMoc3ZnQ2FudmFzKS5kcmF3KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gRmV5bm1hbjtcbn0pKCk7IiwidmFyIFN0YWdlID0gcmVxdWlyZSgnLi8uLi9TdGFnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBMYXRleFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTGF0ZXhQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFN0YWdlKCk7XG4gIH07XG5cbiAgcmV0dXJuIExhdGV4UGFyc2VyO1xufSkoKTsiLCJ2YXIgU3RhbmRhcmRQYXJzZXIgPSByZXF1aXJlKCcuL1N0YW5kYXJkUGFyc2VyJyk7XG52YXIgTGF0ZXhQYXJzZXIgICAgPSByZXF1aXJlKCcuL0xhdGV4UGFyc2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldFBhcnNlcjogZnVuY3Rpb24obGFuZykge1xuXG4gICAgaWYobGFuZyA9PT0gJ2xhdGV4Jykge1xuICAgICAgcmV0dXJuIG5ldyBMYXRleFBhcnNlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN0YW5kYXJkUGFyc2VyKCk7XG4gIH1cbn07IiwidmFyIFN0YWdlICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9TdGFnZScpO1xudmFyIFBhcnRpY2xlR2VuZXJhdG9yID0gcmVxdWlyZSgnLi8uLi9QYXJ0aWNsZUdlbmVyYXRvcicpO1xudmFyIFZlcnRleCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9WZXJ0ZXgnKTtcbnZhciBFeGNoYW5nZSAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vRXhjaGFuZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIFxuICB2YXIgU3RhbmRhcmRQYXJzZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YW5kYXJkUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgdmFyIHN0YWdlID0gbmV3IFN0YWdlKCk7XG5cbiAgICBfc2V0VGl0bGUoc3RhZ2UsIGRhdGEudGl0bGUpO1xuICAgIF9zZXRMYXlvdXQoc3RhZ2UsIGRhdGEubGF5b3V0KTtcbiAgICBfc2V0RGltZW5zaW9uKHN0YWdlLCBkYXRhLndpZHRoLCBkYXRhLmhlaWdodCk7XG4gICAgX3NldFNob3dBeGVzKHN0YWdlLCBkYXRhLnNob3dBeGVzKTtcbiAgICBfc2V0UHJvcGFnYXRvcnMoc3RhZ2UsIGRhdGEucHJvcGFnYXRvcnMpO1xuICAgIF9zZXRWZXJ0aWNlcyhzdGFnZSwgZGF0YS52ZXJ0aWNlcyk7XG4gICAgX3NldEV4Y2hhbmdlcyhzdGFnZSwgZGF0YS5leGNoYW5nZXMpO1xuXG4gICAgcmV0dXJuIHN0YWdlO1xuICB9O1xuXG4gIHZhciBfc2V0VGl0bGUgPSBmdW5jdGlvbihzdGFnZSwgdGl0bGUpIHtcblxuICAgIGlmKHRpdGxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnRpdGxlID0gdGl0bGU7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0TGF5b3V0ID0gZnVuY3Rpb24oc3RhZ2UsIGxheW91dCkge1xuXG4gICAgaWYobGF5b3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmxheW91dCA9IGxheW91dDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXREaW1lbnNpb24gPSBmdW5jdGlvbihzdGFnZSwgd2lkdGgsIGhlaWdodCkge1xuXG4gICAgaWYod2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2Uud2lkdGggPSB3aWR0aDtcbiAgICB9XG4gICAgaWYoaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmhlaWdodCA9IGhlaWdodDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRTaG93QXhlcyA9IGZ1bmN0aW9uKHN0YWdlLCBzaG93QXhlcykge1xuXG4gICAgaWYoc2hvd0F4ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2Uuc2hvd0F4ZXMgPSBzaG93QXhlcztcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRQcm9wYWdhdG9ycyA9IGZ1bmN0aW9uKHN0YWdlLCBwcm9wYWdhdG9ycykge1xuXG4gICAgaWYocHJvcGFnYXRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHByb3BhZ2F0b3JzIScpO1xuICAgIH1cblxuICAgIHByb3BhZ2F0b3JzLmZvckVhY2goZnVuY3Rpb24ocHJvcGFnYXRvckF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIHAgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZShwcm9wYWdhdG9yQXR0cmlidXRlcyk7XG5cbiAgICAgIGlmKHAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdGFnZS5wcm9wYWdhdG9ycy5wdXNoKHApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfc2V0VmVydGljZXMgPSBmdW5jdGlvbihzdGFnZSwgdmVydGljZXMpIHtcblxuICAgIGlmKHZlcnRpY2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyB2ZXJ0aWNlcyEnKTtcbiAgICB9XG5cbiAgICB2ZXJ0aWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleEF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIHYgPSBuZXcgVmVydGV4KHZlcnRleEF0dHJpYnV0ZXMuaWQsIHZlcnRleEF0dHJpYnV0ZXMuaW5ib3VuZCwgdmVydGV4QXR0cmlidXRlcy5vdXRib3VuZCk7XG5cbiAgICAgIGlmKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdGFnZS52ZXJ0aWNlcy5wdXNoKHYpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfc2V0RXhjaGFuZ2VzID0gZnVuY3Rpb24oc3RhZ2UsIGV4Y2hhbmdlcykge1xuXG4gICAgaWYoZXhjaGFuZ2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBleGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbihleGNoYW5nZUF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIGUgPSBuZXcgRXhjaGFuZ2UoZXhjaGFuZ2VBdHRyaWJ1dGVzLmlkLCBleGNoYW5nZUF0dHJpYnV0ZXMuaW5ib3VuZCwgZXhjaGFuZ2VBdHRyaWJ1dGVzLm91dGJvdW5kLCBleGNoYW5nZUF0dHJpYnV0ZXMucGFydGljbGVzKTtcblxuICAgICAgaWYoZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YWdlLmV4Y2hhbmdlcy5wdXNoKGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBTdGFuZGFyZFBhcnNlcjtcbn0pKCk7IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIF9jb2xvciAgPSAnIzAwMCc7XG4gIHZhciBfbGVuZ3RoID0gMTA5O1xuXG4gIHZhciBBYnN0cmFjdFBhcnRpY2xlID0gZnVuY3Rpb24oaWQsIGFudGksIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIGlmKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB0aGlzLmFudGkgICA9IGFudGk7XG4gICAgdGhpcy5jb2xvciAgPSBjb2xvciAgfHwgX2NvbG9yO1xuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoIHx8IF9sZW5ndGg7XG4gICAgdGhpcy54ICAgICAgPSAwO1xuICAgIHRoaXMueSAgICAgID0gMDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEFic3RyYWN0UGFydGljbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNhbGwgYWJzdHJhY3QgbWV0aG9kIScpO1xuICB9O1xuXG4gIEFic3RyYWN0UGFydGljbGUucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbigpIHtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNhbGwgYWJzdHJhY3QgbWV0aG9kIScpO1xuICB9O1xuXG4gIHJldHVybiBBYnN0cmFjdFBhcnRpY2xlO1xuXG59KSgpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xudmFyIEJlemllciAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvQmV6aWVyJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKEVsZWN0cm9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIEVsZWN0cm9uKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBFbGVjdHJvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCBhbnRpIHx8IGZhbHNlLCBjb2xvciwgbGVuZ3RoXSk7XG4gIH1cblxuICBFbGVjdHJvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgY2FudmFzLnBhdGgodGhpcy5nZXRQYXRoKCdsaW5lJykpXG4gICAgICAgICAgLmZpbGwoJ25vbmUnKVxuICAgICAgICAgIC5zdHJva2UoeyB3aWR0aDogMSwgY29sb3I6IHRoaXMuY29sb3IgfSlcbiAgICAgICAgICAudHJhbnNsYXRlKDE1MCwgMTUwKTtcbiAgfTtcblxuICBFbGVjdHJvbi5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKHNoYXBlKSB7XG5cbiAgICB2YXIgdGlsZSA9IFsgWzEsIDFdLCBbMiwgMV0gXTtcbiAgICB2YXIgbCAgICA9IDE7XG5cbiAgICBzd2l0Y2goc2hhcGUpIHtcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUodGlsZSwgbCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnYXJjJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5hcmMoJ2VsZWN0cm9uJywgdGlsZSwgbCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnbG9vcCc6XG4gICAgICAgIHJldHVybiBCZXppZXIubG9vcCgnZWxlY3Ryb24nLCB0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUodGlsZSwgbCwgdGhpcy5sZW5ndGgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gRWxlY3Ryb247XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xudmFyIEJlemllciAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvQmV6aWVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhHbHVvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBHbHVvbihpZCwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgR2x1b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgdW5kZWZpbmVkLCBjb2xvciB8fCAnIzAwOTkzMycsIGxlbmd0aCB8fCA5Nl0pO1xuICB9XG5cbiAgR2x1b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHZhciBwYXRoID0gdGhpcy5nZXRQYXRoKCdhcmMnKTtcbiAgICBjYW52YXMucGF0aChwYXRoLCB0cnVlKVxuICAgICAgLmZpbGwoJ25vbmUnKVxuICAgICAgLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KVxuICAgICAgLnRyYW5zbGF0ZSgxNTAsIDE1MCk7XG4gIH07XG5cbiAgR2x1b24ucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbihzaGFwZSkge1xuXG4gICAgdmFyIGdsdW9uID0ge1xuICAgICAgd2lkdGggIDogMTUsICAgLy8gdGhlIGNvaWwgd2lkdGggb2YgZ2x1b24gcHJvcGFnYXRvcnNcbiAgICAgIGhlaWdodCA6IDE1LCAgIC8vIHRoZSBjb2lsIGhlaWdodCBvZiBnbHVvbiBwcm9wYWdhdG9yc1xuICAgICAgZmFjdG9yIDogMC43NSwgLy8gdGhlIGZhY3RvciBwYXJhbWV0ZXIgZm9yIGdsdW9uIHByb3BhZ2F0b3JzXG4gICAgICBwZXJjZW50OiAwLjYsICAvLyB0aGUgcGVyY2VudCBwYXJhbWV0ZXIgZm9yIGdsdW9uIHByb3BhZ2F0b3JzXG4gICAgICBzY2FsZSAgOiAxLjE1ICAvLyB0aGUgc2NhbGUgcGFyYW1ldGVyIGZvciBnbHVvbiBhcmNzIGFuZCBsb29wc1xuICAgIH07XG5cbiAgICB2YXIga2FwcGEgPSAwLjU1MTkxNTAyO1xuICAgIC8vIGEgYW5kIGIgYXJlIG9uZS1oYWxmIG9mIHRoZSBlbGxpcHNlJ3MgbWFqb3IgYW5kIG1pbm9yIGF4ZXNcbiAgICB2YXIgYSAgICAgPSBnbHVvbi5oZWlnaHQgKiBnbHVvbi5mYWN0b3I7XG4gICAgdmFyIGIgICAgID0gZ2x1b24ud2lkdGggICogZ2x1b24ucGVyY2VudDtcbiAgICAvLyBjIGFuZCBkIGFyZSBvbmUtaGFsZiBvZiBtYWpvciBhbmQgbWlub3IgYXhlcyBvZiB0aGUgb3RoZXIgZWxsaXBzZVxuICAgIHZhciBjICAgICA9IGdsdW9uLmhlaWdodCAqIChnbHVvbi5mYWN0b3IgLSAwLjUpO1xuICAgIHZhciBkICAgICA9IGdsdW9uLndpZHRoICAqICgxIC0gZ2x1b24ucGVyY2VudCk7XG5cbiAgICB2YXIgZGlyICAgPSBmYWxzZTtcbiAgICB2YXIgcHRzICAgPSAoZGlyXG4gICAgICA/IFtbMCwgMF0sICdBICcgKyBhICsgJyAnICsgYiwgMCwgMCwgMSwgW2EsIGJdLFxuICAgICAgICAgICAgICAgICAnQSAnICsgYyArICcgJyArIGQsIDAsIDEsIDEsIFthIC0gMiAqIGMsIGJdLFxuICAgICAgICAgICAgICAgICAnQSAnICsgYSArICcgJyArIGIsIDAsIDAsIDFdXG4gICAgICA6IFtbMCwgMF0sICdBICcgKyBhICsgJyAnICsgYiwgMCwgMCwgMCwgW2EsIC1iXSxcbiAgICAgICAgICAgICAgICAgJ0EgJyArIGMgKyAnICcgKyBkLCAwLCAxLCAwLCBbYSAtIDIgKiBjLCAtYl0sXG4gICAgICAgICAgICAgICAgICdBICcgKyBhICsgJyAnICsgYiwgMCwgMCwgMF1cbiAgICApO1xuXG4gICAgYSA9IChkaXIgPyBhIDogZ2x1b24uc2NhbGUgKiBhKTtcbiAgICB2YXIgbGlmdCA9IGEgLyBNYXRoLnBvdyh0aGlzLmxlbmd0aCwgMC42KTtcblxuICAgIHZhciB0aWxlID0gKGRpclxuICAgICAgPyBbJ0MnLCBba2FwcGEgKiBhLCBsaWZ0XSwgW2EsIGIgLSBrYXBwYSAqIGJdLCBbYSwgYl0sXG4gICAgICAgICAnQycsIFthLCBiICsga2FwcGEgKiBkXSwgW2EgLSBjICsga2FwcGEgKiBjLCBiICsgZF0sIFthIC0gYywgYiArIGRdLFxuICAgICAgICAgJ1MnLCBbYSAtIDIgKiBjLCBiICsga2FwcGEgKiBkXSwgW2EgLSAyICogYywgYl0sXG4gICAgICAgICAnQycsIFthIC0gMiAqIGMsIGIgLSBrYXBwYSAqIGJdLCBbMiAqIChhIC0gYykgLSBrYXBwYSAqIGEsIDBdLCBbMiAqIChhIC0gYyksIC1saWZ0XV1cbiAgICAgIDogWydDJywgW2thcHBhICogYSwgbGlmdF0sIFthLCAtYiArIGthcHBhICogYl0sIFthLCAtYl0sXG4gICAgICAgICAnQycsIFthLCAtYiAtIGthcHBhICogZF0sIFthIC0gYyArIGthcHBhICogYywgLWIgLSBkXSwgW2EgLSBjLCAtYiAtIGRdLFxuICAgICAgICAgJ1MnLCBbYSAtIDIgKiBjLCAtYiAtIGthcHBhICogZF0sIFthIC0gMiAqIGMsIC1iXSxcbiAgICAgICAgICdDJywgW2EgLSAyICogYywgLWIgKyBrYXBwYSAqIGJdLCBbMiAqIChhIC0gYykgLSBrYXBwYSAqIGEsIDBdLCBbMiAqIChhIC0gYyksIC1saWZ0XV1cbiAgICApO1xuXG4gICAgc3dpdGNoKHNoYXBlKSB7XG4gICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgZ2x1b24uaGVpZ2h0LCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdhcmMnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmFyYygnZ2x1b24nLCB0aWxlLCBhIC0gYywgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnbG9vcCc6XG4gICAgICAgIHJldHVybiBCZXppZXIubG9vcCgnZ2x1b24nLCB0aWxlLCBhIC0gYywgdGhpcy5sZW5ndGgpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgZ2x1b24uaGVpZ2h0LCB0aGlzLmxlbmd0aCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBHbHVvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKFBob3RvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBQaG90b24oaWQsIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIFBob3Rvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCB1bmRlZmluZWQsIGNvbG9yIHx8ICcjMDA2NkZGJywgbGVuZ3RoIHx8IDEwOV0pO1xuICB9XG5cbiAgUGhvdG9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB2YXIgcGF0aCA9IHRoaXMuZ2V0UGF0aCgnYXJjJyk7XG4gICAgY2FudmFzLnBhdGgocGF0aCwgdHJ1ZSlcbiAgICAgICAgICAuZmlsbCgnbm9uZScpXG4gICAgICAgICAgLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KVxuICAgICAgICAgIC50cmFuc2xhdGUoMTUwLCAxNTApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHByb3hpbWF0aW9uIG9mIHRoZSBmaXJzdCBxdWFydGVyIG9mIG9uZSBwZXJpb2Qgb2YgYSBzaW5lIGN1cnZlXG4gICAqIGlzIGEgY3ViaWMgQmV6aWVyIGN1cnZlIHdpdGggdGhlIGZvbGxvd2luZyBjb250cm9sIHBvaW50czpcbiAgICpcbiAgICogKDAsIDApIChsYW1iZGEgKiBwIC8gUEksIGxhbWJkYSAqIGEgLyAyKSAoMiAqIHAgLyBQSSwgYSkgKHAsIGEpXG4gICAqXG4gICAqIFJlZmVyZW5jZXM6XG4gICAqXG4gICAqIFsxXSBodHRwOi8vbWF0aGIuaW4vMTQ0N1xuICAgKiBbMl0gaHR0cHM6Ly9naXRodWIuY29tL3Bob3Rpbm8vanF1ZXJ5LWZleW4vYmxvYi9tYXN0ZXIvanMvanF1ZXJ5LmZleW4tMS4wLjEuanNcbiAgICpcbiAgICogQHBhcmFtIHNoYXBlXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgUGhvdG9uLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oc2hhcGUpIHtcblxuICAgIHZhciBQSSAgICAgPSBNYXRoLlBJO1xuICAgIHZhciBsYW1iZGEgPSAwLjUxMTI4NzMzO1xuICAgIHZhciBhICAgICAgPSA1O1xuICAgIHZhciBiICAgICAgPSAwLjUgKiBsYW1iZGEgKiBhO1xuICAgIHZhciBwICAgICAgPSA1O1xuICAgIHZhciBxICAgICAgPSAyICogcCAvIFBJO1xuICAgIHZhciB0ICAgICAgPSBsYW1iZGEgKiBwIC8gUEk7XG4gICAgdmFyIGRpciAgICA9IGZhbHNlO1xuXG4gICAgdmFyIHB0cyA9IChkaXJcbiAgICAgID8gW1swLCAwXSwgJ0MnLCBbdCwgLWJdLCBbcSwgLWFdLCBbcCwgLWFdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwLCAwXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbMiAqIHAgKyBxLCBhXSwgWzMgKiBwLCBhXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbNCAqIHAgLSB0LCBiXV1cbiAgICAgIDogW1swLCAwXSwgJ0MnLCBbdCwgYl0sIFtxLCBhXSwgW3AsIGFdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCAtIHQsIGJdLCBbMiAqIHAsIDBdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCArIHEsIC1hXSwgWzMgKiBwLCAtYV0sXG4gICAgICAgICAgICAgICAgICdTJywgWzQgKiBwIC0gdCwgLWJdXVxuICAgICk7XG5cbiAgICB2YXIgdGlsZSA9IChkaXJcbiAgICAgID8gW1snQycsIFt0LCAtYl0sIFtxLCAtYV0sIFtwLCAtYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCArIDAuNSwgMF1dLFxuICAgICAgICAgWydDJywgW3QsIGJdLCBbcSwgYV0sIFtwLCBhXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwIC0gMC41LCAwXV1dXG4gICAgICA6IFtbJ0MnLCBbdCwgYl0sIFtxLCBhXSwgW3AsIGFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgYl0sIFsyICogcCAtIDAuNSwgMF1dLFxuICAgICAgICAgWydDJywgW3QsIC1iXSwgW3EsIC1hXSwgW3AsIC1hXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwICsgMC41LCAwXV1dXG4gICAgKTtcblxuICAgIHN3aXRjaChzaGFwZSkge1xuICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZShwdHMsIDQgKiBwLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdhcmMnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmFyYygncGhvdG9uJywgdGlsZSwgcCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnbG9vcCc6XG4gICAgICAgIHJldHVybiBCZXppZXIubG9vcCgncGhvdG9uJywgdGlsZSwgcCwgdGhpcy5sZW5ndGgpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgNCAqIHAsIHRoaXMubGVuZ3RoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFBob3RvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhRdWFyaywgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBRdWFyayhpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgUXVhcmsuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgYW50aSB8fCBmYWxzZSwgY29sb3IsIGxlbmd0aF0pO1xuICB9XG5cbiAgUXVhcmsucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICB9O1xuXG4gIFF1YXJrLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cbiAgcmV0dXJuIFF1YXJrO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiXX0=
(7)
});
;