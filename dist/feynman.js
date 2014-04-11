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
    this.vertices    = {
      left   : [],
      right  : [],
      top    : [],
      bottom : []
    };

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

    // ctx.vertices.forEach(function(vertex) {
    //   vertex.draw(ctx.canvas);
    // });
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

  var _getVertexCoordinates = function(vertex, ctx) {

    var wUnit = Math.floor(ctx.width  / 4);
    var hUnit = Math.floor(ctx.height / 4);

    var x = 0;
    var y = 0;

    switch(vertex.position[0]) {
      case 'l':
        x = wUnit;
        break;
      case 'c':
        x = wUnit * 2;
        break;
      case 'r':
        x = wUnit * 3;
        break;
    }

    y = vertex.position[1] * hUnit;

    return [x, y];
  };

  return Stage;
})();
},{}],4:[function(require,module,exports){
module.exports = (function() {

  var Vertex = function(id, position, inbound, outbound) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    if(position === undefined) {
      throw new Error('Missing position argument!');
    }

    if(inbound === undefined && outbound === undefined) {
      throw new Error('Vertices must have either an inbound or outbound attribute!');
    }

    if(inbound !== undefined && inbound.length === 0 && outbound !== undefined && outbound.length === 0) {
      throw new Error('Vertices must have either an inbound or outbound attribute!');
    }

    this.id       = id;
    this.position = position;
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

  window.Feynman = Feynman;

  return Feynman;
})();
},{"./parsers/ParserFactory":9}],8:[function(require,module,exports){
var Stage             = require('./../Stage');
var ParticleGenerator = require('./../ParticleGenerator');
var Vertex            = require('./../Vertex');
var Exchange          = require('./../Exchange');

module.exports = (function() {

  var stage = new Stage();

  var LatexParser = function() {

    return this;
  };

  LatexParser.prototype.parse = function(data) {

    if(data === undefined) {
      throw new Error('Missing data argument!');
    }

    stage        = new Stage();
    stage.title  = data.title;
    stage.width  = data.width;
    stage.height = data.height;

    data.diagram.forEach(function(command) {
      _processCommand(command);
    }, this);

    return stage;
  };

  var _processCommand = function(command) {

    var keyword   = command.match(/\w+/g)[0];
    var args      = _explodeArgs(_stripCurlies(command.match(/(\{(\w+,?)+\})/g)));

    if(keyword !== undefined && _keywordFunctionMap[keyword] !== undefined) {

      _keywordFunctionMap[keyword](args);
    }
  };

  var _processFermion = function(args) {

    // "In fermion"
    var particle = _getParticle(args[0][0], args[1][0]);
    stage.propagators.push(particle);

    // "Out fermion"
    if(args[1][2]) {
      var outParticle = _getParticle(args[0][0], args[1][2]);
      stage.propagators.push(outParticle);
    }
  };

  var _processVertex = function(pos, args) {

    var localId  = stage.vertices[pos].length + 1;
    var globalId = _getNumberOfVertices() + 1;
    var vertexId = 'v' + globalId;
    var vertex   = new Vertex(vertexId, [ pos, localId ], [ args[0][0] ], [ args[0][1] ]);

    stage.vertices[pos].push(vertex);
  };

  var _processRight = function(args) {

    _processVertex('right', args);
  };

  var _processLeft = function(args) {

    _processVertex('left', args);
  };

  var _processTop = function(args) {

    _processVertex('top', args);
  };

  var _processBottom = function(args) {

    _processVertex('bottom', args);
  };

  var _processDot = function(args) {

  };

  var _stripCurlies = function(args) {

    var pattern = /\{|\}/g;
    var escaped = [];

    escaped = args.map(function(arg) {
      return arg.replace(pattern, '');
    });

    return escaped;
  };

  var _explodeArgs = function(args) {

    var explodedArgs = [];

    args.forEach(function(arg) {
      var e = arg.split(',');
      explodedArgs.push(e);
    });

    return explodedArgs;
  };

  var _getNumberOfVertices = function() {

    var sum = 0;

    for(var key in stage.vertices) {
      if(stage.vertices.hasOwnProperty(key)) {
        sum += stage.vertices[key].length;
      }
    }

    return sum;
  };

  var _getParticle = function(type, id) {

    var particle;

    switch(type) {

      case 'electron':
        particle = ParticleGenerator.getParticle({ id: id, type: 'e-' });
        break;
      case 'quark':
        particle = ParticleGenerator.getParticle({ id: id, type: 'q' });
        break;
      case 'photon':
        particle = ParticleGenerator.getParticle({ id: id, type: 'ph' });
        break;
      case 'gluon':
        particle = ParticleGenerator.getParticle({ id: id, type: 'g' });
        break;
      default:
        particle = ParticleGenerator.getParticle({ id: id, type: 'e-' });
        break;
    }

    return particle;
  };

  var _keywordFunctionMap = {
    'fmf'       : _processFermion,
    'fmfright'  : _processRight,
    'fmfleft'   : _processLeft,
    'fmftop'    : _processTop,
    'fmfbottom' : _processBottom,
    'fmfdot'    : _processDot
  };

  return LatexParser;
})();
},{"./../Exchange":1,"./../ParticleGenerator":2,"./../Stage":3,"./../Vertex":4}],9:[function(require,module,exports){
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

      var v = new Vertex(vertexAttributes.id, vertexAttributes.position, vertexAttributes.inbound, vertexAttributes.outbound);

      if(v !== undefined) {
        stage.vertices[vertexAttributes.position[0]].push(v);
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

    this.id     = id;
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
          .stroke({ width: 1, color: this.color });
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

    var path = this.getPath('line');
    canvas.path(path, true)
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9FeGNoYW5nZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1BhcnRpY2xlR2VuZXJhdG9yLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvU3RhZ2UuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9WZXJ0ZXguanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9oZWxwZXJzL0Jlemllci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2hlbHBlcnMvS2xhc3MuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvTGF0ZXhQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1BhcnNlckZhY3RvcnkuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvQWJzdHJhY3RQYXJ0aWNsZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL0VsZWN0cm9uLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvR2x1b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9QaG90b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9RdWFyay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFBhcnRpY2xlR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9QYXJ0aWNsZUdlbmVyYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgRXhjaGFuZ2UgPSBmdW5jdGlvbihpZCwgaW5ib3VuZCwgb3V0Ym91bmQsIHBhcnRpY2xlcykge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgPT09IHVuZGVmaW5lZCB8fCBvdXRib3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4Y2hhbmdlIG11c3QgaGF2ZSBib3RoIGFuIGluYm91bmQgYW5kIG91dGJvdW5kIGF0dHJpYnV0ZSEnKTtcbiAgICB9XG5cbiAgICBpZihwYXJ0aWNsZXMgPT09IHVuZGVmaW5lZCB8fCBwYXJ0aWNsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHBhcnRpY2xlcyBnaXZlbiEnKTtcbiAgICB9XG5cbiAgICB0aGlzLmlkICAgICAgICA9IGlkO1xuICAgIHRoaXMuaW5ib3VuZCAgID0gaW5ib3VuZDtcbiAgICB0aGlzLm91dGJvdW5kICA9IG91dGJvdW5kO1xuICAgIHRoaXMucGFydGljbGVzID0gW107XG5cbiAgICBfY3JlYXRlRXhjaGFuZ2VQYXJ0aWNsZXModGhpcywgcGFydGljbGVzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV4Y2hhbmdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRpY2xlKSB7XG4gICAgICBwYXJ0aWNsZS5kcmF3KGNhbnZhcyk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9jcmVhdGVFeGNoYW5nZVBhcnRpY2xlcyA9IGZ1bmN0aW9uKGN0eCwgcGFydGljbGVzKSB7XG5cbiAgICBwYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZUF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIHAgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZShwYXJ0aWNsZUF0dHJpYnV0ZXMpO1xuXG4gICAgICBpZihwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY3R4LnBhcnRpY2xlcy5wdXNoKHApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBFeGNoYW5nZTtcbn0pKCk7IiwidmFyIEVsZWN0cm9uID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9FbGVjdHJvbicpO1xudmFyIFF1YXJrICAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9RdWFyaycpO1xudmFyIEdsdW9uICAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9HbHVvbicpO1xudmFyIFBob3RvbiAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9QaG90b24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0UGFydGljbGU6IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZS0nKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZWN0cm9uKGRhdGEuaWQsIGZhbHNlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZSsnKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZWN0cm9uKGRhdGEuaWQsIHRydWUsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdxJykge1xuICAgICAgcmV0dXJuIG5ldyBRdWFyayhkYXRhLmlkLCBmYWxzZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2FxJykge1xuICAgICAgcmV0dXJuIG5ldyBRdWFyayhkYXRhLmlkLCB0cnVlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZycpIHtcbiAgICAgIHJldHVybiBuZXcgR2x1b24oZGF0YS5pZCwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ3BoJykge1xuICAgICAgcmV0dXJuIG5ldyBQaG90b24oZGF0YS5pZCwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgU3RhZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIEdlbmVyaWMgQXR0cmlidXRlcyAob3B0aW9uYWwpXG4gICAgdGhpcy50aXRsZSAgICA9ICdGZXlubWFuJztcbiAgICB0aGlzLmxheW91dCAgID0gJ3RpbWUtc3BhY2UnO1xuICAgIHRoaXMud2lkdGggICAgPSAxMDA7XG4gICAgdGhpcy5oZWlnaHQgICA9IDEwMDtcbiAgICB0aGlzLnNob3dBeGVzID0gdHJ1ZTtcblxuICAgIC8vIE1haW4gcHJvcGVydGllcyAocmVxdWlyZWQpXG4gICAgdGhpcy5wcm9wYWdhdG9ycyA9IFtdO1xuICAgIHRoaXMudmVydGljZXMgICAgPSB7XG4gICAgICBsZWZ0ICAgOiBbXSxcbiAgICAgIHJpZ2h0ICA6IFtdLFxuICAgICAgdG9wICAgIDogW10sXG4gICAgICBib3R0b20gOiBbXVxuICAgIH07XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMuZXhjaGFuZ2VzICAgPSBbXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5zZXRDYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIHRoaXMuY2FudmFzLnNpemUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhZ2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcblxuICAgIF9kcmF3VGl0bGUodGhpcyk7XG4gICAgX2RyYXdWZXJ0aWNlcyh0aGlzKTtcbiAgICBfZHJhd1Byb3BhZ2F0b3JzKHRoaXMpO1xuICAgIF9kcmF3RXhjaGFuZ2VzKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBfZHJhd1RpdGxlID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHguY2FudmFzLnRleHQoY3R4LnRpdGxlKS5mb250KHtcbiAgICAgIGZhbWlseSA6ICdHZW9yZ2lhJyxcbiAgICAgIHNpemUgICA6ICAxNCxcbiAgICAgIHN0eWxlICA6ICdpdGFsaWMnLFxuICAgICAgYW5jaG9yIDogJ2xlZnQnXG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9kcmF3VmVydGljZXMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIC8vIGN0eC52ZXJ0aWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleCkge1xuICAgIC8vICAgdmVydGV4LmRyYXcoY3R4LmNhbnZhcyk7XG4gICAgLy8gfSk7XG4gIH07XG5cbiAgdmFyIF9kcmF3UHJvcGFnYXRvcnMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC5wcm9wYWdhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRpY2xlKSB7XG4gICAgICBwYXJ0aWNsZS5kcmF3KGN0eC5jYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZHJhd0V4Y2hhbmdlcyA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgY3R4LmV4Y2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGV4Y2hhbmdlKSB7XG4gICAgICBleGNoYW5nZS5kcmF3KGN0eC5jYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZ2V0VmVydGV4Q29vcmRpbmF0ZXMgPSBmdW5jdGlvbih2ZXJ0ZXgsIGN0eCkge1xuXG4gICAgdmFyIHdVbml0ID0gTWF0aC5mbG9vcihjdHgud2lkdGggIC8gNCk7XG4gICAgdmFyIGhVbml0ID0gTWF0aC5mbG9vcihjdHguaGVpZ2h0IC8gNCk7XG5cbiAgICB2YXIgeCA9IDA7XG4gICAgdmFyIHkgPSAwO1xuXG4gICAgc3dpdGNoKHZlcnRleC5wb3NpdGlvblswXSkge1xuICAgICAgY2FzZSAnbCc6XG4gICAgICAgIHggPSB3VW5pdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjJzpcbiAgICAgICAgeCA9IHdVbml0ICogMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyJzpcbiAgICAgICAgeCA9IHdVbml0ICogMztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgeSA9IHZlcnRleC5wb3NpdGlvblsxXSAqIGhVbml0O1xuXG4gICAgcmV0dXJuIFt4LCB5XTtcbiAgfTtcblxuICByZXR1cm4gU3RhZ2U7XG59KSgpOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBWZXJ0ZXggPSBmdW5jdGlvbihpZCwgcG9zaXRpb24sIGluYm91bmQsIG91dGJvdW5kKSB7XG5cbiAgICBpZihpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgaWQgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgaWYocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHBvc2l0aW9uIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgPT09IHVuZGVmaW5lZCAmJiBvdXRib3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgaWYoaW5ib3VuZCAhPT0gdW5kZWZpbmVkICYmIGluYm91bmQubGVuZ3RoID09PSAwICYmIG91dGJvdW5kICE9PSB1bmRlZmluZWQgJiYgb3V0Ym91bmQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgICA9IGlkO1xuICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLmluYm91bmQgID0gaW5ib3VuZCAgfHwgW107XG4gICAgdGhpcy5vdXRib3VuZCA9IG91dGJvdW5kIHx8IFtdO1xuICAgIHRoaXMueCAgICAgICAgPSAwO1xuICAgIHRoaXMueSAgICAgICAgPSAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgVmVydGV4LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICBjYW52YXMuY2lyY2xlKDMpXG4gICAgICAgICAgLmZpbGwoeyBjb2xvcjogJyMwMDAnIH0pXG4gICAgICAgICAgLnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gIH07XG5cbiAgcmV0dXJuIFZlcnRleDtcbn0pKCk7IiwidmFyIFBJICAgICAgPSBNYXRoLlBJO1xudmFyIGlzQXJyYXkgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBub3JtYWxpemVQYXRoU3RyaW5nOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzdHIgPSAnJztcblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIGl0ZW0gPSBhcmd1bWVudHNbaV07XG4gICAgICBzdHIgKz0gJyAnICsgKHR5cGVvZiBpdGVtICE9PSAnbnVtYmVyJyA/XG4gICAgICAgIGl0ZW0gOlxuICAgICAgICBpdGVtLnRvRml4ZWQoMykucmVwbGFjZSgvKC5cXGQqPykwKyQvLCAnJDEnKS5yZXBsYWNlKC9cXC4kLywgJycpXG4gICAgICApO1xuICAgIH1cbiAgICB2YXIgdHJpbW1lZCA9IHN0ci50cmltKCk7XG5cbiAgICByZXR1cm4gdHJpbW1lZC5yZXBsYWNlKC8gPywgPy9nLCAnLCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgY29vcmRpbmF0ZXMgb2YgYSBnaXZlbiBwb2ludCBpbiByZWZlcmVuY2UgdG8gYSBnaXZlbiBCZXppZXIgY3VydmUgc2VnbWVudFxuICAgKlxuICAgKiBAcGFyYW0gc3ggU3RhcnQgb2Ygc2VnbWVudCBYXG4gICAqIEBwYXJhbSBzeSBTdGFydCBvZiBzZWdtZW50IFlcbiAgICogQHBhcmFtIGV4IEVuZCBvZiBzZWdtZW50IFhcbiAgICogQHBhcmFtIGV5IEVuZCBvZiBzZWdtZW50IFlcbiAgICogQHBhcmFtIHggIFBvaW50IHRvIGZpdCBYXG4gICAqIEBwYXJhbSB5ICBQb2ludCB0byBmaXQgWVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldENvb3JkaW5hdGVzSW5CZXppZXI6IGZ1bmN0aW9uKHN4LCBzeSwgZXgsIGV5LCB4LCB5KSB7XG5cbiAgICB2YXIgYW5nID0gTWF0aC5hdGFuMihleSAtIHN5LCBleCAtIHN4KTtcblxuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVBhdGhTdHJpbmcoeCAqIE1hdGguY29zKGFuZykgLSB5ICogTWF0aC5zaW4oYW5nKSArIHN4LCAnLCcsIHggKiBNYXRoLnNpbihhbmcpICsgeSAqIE1hdGguY29zKGFuZykgKyBzeSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIDEvNCBwZXJpb2QgbG9uZyBCZXppZXIgc3BsaW5lIChDKSBvbnRvIGFuIChMbCkgbG9uZyBzdHJhaWdodCBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgIEN1cnZlIHNlZ21lbnRcbiAgICogQHBhcmFtIHBlcmlvZCAgICAgKExwKSBMZW5ndGggb2YgYSBxdWFydGVyIHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTGwpIExlbmd0aCBvZiBwcm9wYWdhdG9yXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBsaW5lOiBmdW5jdGlvbih0aWxlLCBwZXJpb2QsIGxlbmd0aCkge1xuXG4gICAgdmFyIGJlemllciA9IFsnTSddO1xuICAgIHZhciBudW0gICAgPSBNYXRoLmZsb29yKGxlbmd0aCAvIHBlcmlvZCk7XG4gICAgdmFyIGV4dHJhICA9IGxlbmd0aCAtIHBlcmlvZCAqIG51bSArIDAuMTtcblxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gbnVtOyBuKyspIHtcblxuICAgICAgZm9yKHZhciBpID0gMCwgbCA9IHRpbGUubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgICAgaXRlbSA9IHRpbGVbaV07XG5cbiAgICAgICAgaWYoaXNBcnJheShpdGVtKSkge1xuXG4gICAgICAgICAgaWYobiA8IG51bSB8fCBpdGVtWzBdIDwgZXh0cmEpIHtcbiAgICAgICAgICAgIGJlemllci5wdXNoKHRoaXMubm9ybWFsaXplUGF0aFN0cmluZyhpdGVtWzBdICsgcGVyaW9kICogbiwgJywnLCBpdGVtWzFdKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZXppZXIucHVzaChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXppZXIuam9pbignICcpLnJlcGxhY2UoL1xcc1tBLVpdW15BLVpdKiQvLCAnJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIHF1YXJ0ZXIgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGxvbmcgYXJjLlxuICAgKlxuICAgKiBAcGFyYW0gcGFydGljbGUgICBUeXBlIG9mIHBhcnRpY2xlLCBlLmcuOiBcInBob3RvblwiXG4gICAqIEBwYXJhbSB0aWxlICAgICAgIChDKSAgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTHApIExlbmd0aCBvZiBhIDEvNCBwZXJpb2RcbiAgICogQHBhcmFtIGxlbmd0aCAgICAgKExsKSBMZW5ndGhcbiAgICogQHJldHVybnMge3N0cmluZ30gU1ZHIHBhdGhcbiAgICovXG4gIGFyYzogZnVuY3Rpb24ocGFydGljbGUsIHRpbGUsIHBlcmlvZCwgbGVuZ3RoKSB7XG5cbiAgICB2YXIgdGVuc2lvbiA9IDI7XG4gICAgdmFyIHQgICAgICAgPSAwLjI1ICogTWF0aC5tYXgodGVuc2lvbiwgMik7XG4gICAgdmFyIHBoaSAgICAgPSBNYXRoLmFjb3MoLTAuNSAvIHQpO1xuICAgIHZhciB0aGV0YSAgID0gLTIgKiBNYXRoLmFzaW4ocGVyaW9kIC8gKHQgKiBsZW5ndGgpKTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBiZXppZXIgID0gWydNJywgJzAsMCddO1xuXG4gICAgLy8gZ2V0IGNvb3JkaW5hdGUgcGFpcnMgZm9yIHRoZSBlbmRwb2ludCBvZiBzZWdtZW50XG4gICAgZm9yKHZhciBuID0gMDsgbiA8PSAoUEkgLSAyICogcGhpKSAvIHRoZXRhOyBuKyspIHtcbiAgICAgIHNlZ21lbnQucHVzaChbbGVuZ3RoICogKHQgKiBNYXRoLmNvcyh0aGV0YSAqIG4gKyBwaGkpICsgMC41KSwgbGVuZ3RoICogKHQgKiBNYXRoLnNpbih0aGV0YSAqIG4gKyBwaGkpIC0gTWF0aC5zcXJ0KHQgKiB0IC0gMC4yNSkpXSk7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMCwgbCA9IHNlZ21lbnQubGVuZ3RoIC0gMSwgbW9kZWw7IGkgPCBsOyBpKyspIHtcblxuICAgICAgbW9kZWwgPSAocGFydGljbGUgPT09ICdwaG90b24nID8gdGlsZVtpICUgMl0gOiB0aWxlKTtcblxuICAgICAgZm9yKHZhciBqID0gMCwgbSA9IG1vZGVsLmxlbmd0aCwgaXRlbTsgaiA8IG07IGorKykge1xuICAgICAgICBpdGVtID0gbW9kZWxbal07XG4gICAgICAgIGJlemllci5wdXNoKGlzQXJyYXkoaXRlbSlcbiAgICAgICAgICA/IHRoaXMuZ2V0Q29vcmRpbmF0ZXNJbkJlemllcihzZWdtZW50W2ldWzBdLCBzZWdtZW50W2ldWzFdLCBzZWdtZW50W2krMV1bMF0sIHNlZ21lbnRbaSsxXVsxXSwgaXRlbVswXSwgaXRlbVsxXSlcbiAgICAgICAgICA6IGl0ZW1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmV6aWVyLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHNbQS1aXSQvLCAnJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIHF1YXJ0ZXIgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGRpYW1ldGVyIGNpcmNsZS5cbiAgICpcbiAgICogQHBhcmFtIHBhcnRpY2xlICAgVHlwZSBvZiBwYXJ0aWNsZSwgZS5nLjogXCJwaG90b25cIlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTikgTGVuZ3RoIG9mIGEgMS80IHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTCkgTGVuZ3RoXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBsb29wOiBmdW5jdGlvbihwYXJ0aWNsZSwgdGlsZSwgcGVyaW9kLCBsZW5ndGgpIHtcblxuICAgIHZhciBjdyAgICAgID0gdHJ1ZTtcbiAgICB2YXIgdGhldGEgICA9IDIgKiBNYXRoLmFzaW4oMiAqIHBlcmlvZCAvIGxlbmd0aCk7XG4gICAgdmFyIG51bSAgICAgPSAyICogUEkgLyB0aGV0YTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBsaWZ0ICAgID0gKGN3ID8gLTAuNSA6IDAuNSk7XG4gICAgdmFyIGJlemllciAgPSBbJ00nLCAocGFydGljbGUgPT09ICdnbHVvbicgPyBsaWZ0ICsgJywwJyA6ICcwLCcgKyBsaWZ0KV07XG5cbiAgICAvLyBmaW5kIHRoZSBtb2RpZmllZCBkaXN0YW5jZSBzdWNoIHRoYXQgdGhlIG51bWJlciBvZiB0aWxlcyBpcyBhbiBpbnRlZ2VyXG4gICAgZm9yKHZhciB4ID0gLTAuMSwgZGlzID0gbGVuZ3RoOyBNYXRoLmZsb29yKG51bSkgJSA0IHx8IG51bSAtIE1hdGguZmxvb3IobnVtKSA+IDAuMTsgeCArPSAwLjAwMSkge1xuXG4gICAgICBsZW5ndGggPSAoMSArIHgpICogZGlzO1xuICAgICAgdGhldGEgID0gMiAqIE1hdGguYXNpbigyICogcGVyaW9kIC8gbGVuZ3RoKTtcbiAgICAgIG51bSAgICA9IDIgKiBQSSAvIHRoZXRhO1xuICAgIH1cblxuICAgIC8vIGdldCBjb29yZGluYXRlIHBhaXJzIGZvciB0aGUgZW5kcG9pbnQgb2Ygc2VnbWVudFxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gbnVtOyBuKyspIHtcblxuICAgICAgdmFyIHN4ID0gMC41ICogbGVuZ3RoICogKDEgLSBNYXRoLmNvcyh0aGV0YSAqIG4pKTtcbiAgICAgIHZhciBzeSA9IDAuNSAqIGxlbmd0aCAqIE1hdGguc2luKHRoZXRhICogbik7XG4gICAgICBzZWdtZW50LnB1c2goW3N4LCBzeV0pO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBzZWdtZW50Lmxlbmd0aCAtIDEsIG1vZGVsOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIC8vIHR3byBwaG90b24gdGlsZXMgZm9ybSBhIHBlcmlvZCB3aGVyZWFzIG9uZSBnbHVvbiB0aWxlIGlzIGEgcGVyaW9kXG4gICAgICBtb2RlbCA9IChwYXJ0aWNsZSA9PT0gJ3Bob3RvbicgPyB0aWxlW2kgJSAyXSA6IHRpbGUpO1xuXG4gICAgICAvLyBnZXQgYmV6aWVyIHBhdGggZm9yIHBob3RvbiBhbmQgZ2x1b24gYXJjXG4gICAgICBmb3IodmFyIGogPSAwLCBtID0gbW9kZWwubGVuZ3RoLCBpdGVtOyBqIDwgbTsgaisrKSB7XG5cbiAgICAgICAgaXRlbSA9IG1vZGVsW2pdO1xuICAgICAgICBiZXppZXIucHVzaChpc0FycmF5KGl0ZW0pXG4gICAgICAgICAgPyB0aGlzLmdldENvb3JkaW5hdGVzSW5CZXppZXIoc2VnbWVudFtpXVswXSwgc2VnbWVudFtpXVsxXSwgc2VnbWVudFtpKzFdWzBdLCBzZWdtZW50W2krMV1bMV0sIGl0ZW1bMF0sIGl0ZW1bMV0pXG4gICAgICAgICAgOiBpdGVtXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlemllci5qb2luKCcgJykucmVwbGFjZSgvXFxzW0EtWl0kLywgJycpICsgJyBaJztcbiAgfVxufTsiLCJ2YXIgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBfX2V4dGVuZHM6IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9XG59OyIsInZhciBQYXJzZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9wYXJzZXJzL1BhcnNlckZhY3RvcnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEZleW5tYW4gPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEcmF3IGRpYWdyYW0gb250byBjYW52YXMuXG4gICAqIEBwYXJhbSBjYW52YXMgSWQgb2YgY2FudmFzIGVsZW1lbnRcbiAgICogQHBhcmFtIGRhdGEgICBEaWFncmFtIHByb3BlcnRpZXNcbiAgICovXG4gIEZleW5tYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMsIGRhdGEpIHtcblxuICAgIGlmICh0eXBlb2YgY2FudmFzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNhbnZhcyNpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3ZnQ2FudmFzICA9IG5ldyBTVkcoY2FudmFzKTtcbiAgICB2YXIgcGFyc2VyICAgICA9IFBhcnNlckZhY3RvcnkuZ2V0UGFyc2VyKGRhdGEubGFuZyk7XG4gICAgdmFyIHN0YWdlICAgICAgPSBwYXJzZXIucGFyc2UoZGF0YSk7XG5cbiAgICBzdGFnZS5zZXRDYW52YXMoc3ZnQ2FudmFzKS5kcmF3KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB3aW5kb3cuRmV5bm1hbiA9IEZleW5tYW47XG5cbiAgcmV0dXJuIEZleW5tYW47XG59KSgpOyIsInZhciBTdGFnZSAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vU3RhZ2UnKTtcbnZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vLi4vUGFydGljbGVHZW5lcmF0b3InKTtcbnZhciBWZXJ0ZXggICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vVmVydGV4Jyk7XG52YXIgRXhjaGFuZ2UgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL0V4Y2hhbmdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBzdGFnZSA9IG5ldyBTdGFnZSgpO1xuXG4gIHZhciBMYXRleFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTGF0ZXhQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBzdGFnZSAgICAgICAgPSBuZXcgU3RhZ2UoKTtcbiAgICBzdGFnZS50aXRsZSAgPSBkYXRhLnRpdGxlO1xuICAgIHN0YWdlLndpZHRoICA9IGRhdGEud2lkdGg7XG4gICAgc3RhZ2UuaGVpZ2h0ID0gZGF0YS5oZWlnaHQ7XG5cbiAgICBkYXRhLmRpYWdyYW0uZm9yRWFjaChmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICBfcHJvY2Vzc0NvbW1hbmQoY29tbWFuZCk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXR1cm4gc3RhZ2U7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzQ29tbWFuZCA9IGZ1bmN0aW9uKGNvbW1hbmQpIHtcblxuICAgIHZhciBrZXl3b3JkICAgPSBjb21tYW5kLm1hdGNoKC9cXHcrL2cpWzBdO1xuICAgIHZhciBhcmdzICAgICAgPSBfZXhwbG9kZUFyZ3MoX3N0cmlwQ3VybGllcyhjb21tYW5kLm1hdGNoKC8oXFx7KFxcdyssPykrXFx9KS9nKSkpO1xuXG4gICAgaWYoa2V5d29yZCAhPT0gdW5kZWZpbmVkICYmIF9rZXl3b3JkRnVuY3Rpb25NYXBba2V5d29yZF0gIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICBfa2V5d29yZEZ1bmN0aW9uTWFwW2tleXdvcmRdKGFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3Byb2Nlc3NGZXJtaW9uID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgLy8gXCJJbiBmZXJtaW9uXCJcbiAgICB2YXIgcGFydGljbGUgPSBfZ2V0UGFydGljbGUoYXJnc1swXVswXSwgYXJnc1sxXVswXSk7XG4gICAgc3RhZ2UucHJvcGFnYXRvcnMucHVzaChwYXJ0aWNsZSk7XG5cbiAgICAvLyBcIk91dCBmZXJtaW9uXCJcbiAgICBpZihhcmdzWzFdWzJdKSB7XG4gICAgICB2YXIgb3V0UGFydGljbGUgPSBfZ2V0UGFydGljbGUoYXJnc1swXVswXSwgYXJnc1sxXVsyXSk7XG4gICAgICBzdGFnZS5wcm9wYWdhdG9ycy5wdXNoKG91dFBhcnRpY2xlKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzVmVydGV4ID0gZnVuY3Rpb24ocG9zLCBhcmdzKSB7XG5cbiAgICB2YXIgbG9jYWxJZCAgPSBzdGFnZS52ZXJ0aWNlc1twb3NdLmxlbmd0aCArIDE7XG4gICAgdmFyIGdsb2JhbElkID0gX2dldE51bWJlck9mVmVydGljZXMoKSArIDE7XG4gICAgdmFyIHZlcnRleElkID0gJ3YnICsgZ2xvYmFsSWQ7XG4gICAgdmFyIHZlcnRleCAgID0gbmV3IFZlcnRleCh2ZXJ0ZXhJZCwgWyBwb3MsIGxvY2FsSWQgXSwgWyBhcmdzWzBdWzBdIF0sIFsgYXJnc1swXVsxXSBdKTtcblxuICAgIHN0YWdlLnZlcnRpY2VzW3Bvc10ucHVzaCh2ZXJ0ZXgpO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc1JpZ2h0ID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgX3Byb2Nlc3NWZXJ0ZXgoJ3JpZ2h0JywgYXJncyk7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzTGVmdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIF9wcm9jZXNzVmVydGV4KCdsZWZ0JywgYXJncyk7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzVG9wID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgX3Byb2Nlc3NWZXJ0ZXgoJ3RvcCcsIGFyZ3MpO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc0JvdHRvbSA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIF9wcm9jZXNzVmVydGV4KCdib3R0b20nLCBhcmdzKTtcbiAgfTtcblxuICB2YXIgX3Byb2Nlc3NEb3QgPSBmdW5jdGlvbihhcmdzKSB7XG5cbiAgfTtcblxuICB2YXIgX3N0cmlwQ3VybGllcyA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIHZhciBwYXR0ZXJuID0gL1xce3xcXH0vZztcbiAgICB2YXIgZXNjYXBlZCA9IFtdO1xuXG4gICAgZXNjYXBlZCA9IGFyZ3MubWFwKGZ1bmN0aW9uKGFyZykge1xuICAgICAgcmV0dXJuIGFyZy5yZXBsYWNlKHBhdHRlcm4sICcnKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBlc2NhcGVkO1xuICB9O1xuXG4gIHZhciBfZXhwbG9kZUFyZ3MgPSBmdW5jdGlvbihhcmdzKSB7XG5cbiAgICB2YXIgZXhwbG9kZWRBcmdzID0gW107XG5cbiAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24oYXJnKSB7XG4gICAgICB2YXIgZSA9IGFyZy5zcGxpdCgnLCcpO1xuICAgICAgZXhwbG9kZWRBcmdzLnB1c2goZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZXhwbG9kZWRBcmdzO1xuICB9O1xuXG4gIHZhciBfZ2V0TnVtYmVyT2ZWZXJ0aWNlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHN1bSA9IDA7XG5cbiAgICBmb3IodmFyIGtleSBpbiBzdGFnZS52ZXJ0aWNlcykge1xuICAgICAgaWYoc3RhZ2UudmVydGljZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzdW0gKz0gc3RhZ2UudmVydGljZXNba2V5XS5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1bTtcbiAgfTtcblxuICB2YXIgX2dldFBhcnRpY2xlID0gZnVuY3Rpb24odHlwZSwgaWQpIHtcblxuICAgIHZhciBwYXJ0aWNsZTtcblxuICAgIHN3aXRjaCh0eXBlKSB7XG5cbiAgICAgIGNhc2UgJ2VsZWN0cm9uJzpcbiAgICAgICAgcGFydGljbGUgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZSh7IGlkOiBpZCwgdHlwZTogJ2UtJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdxdWFyayc6XG4gICAgICAgIHBhcnRpY2xlID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUoeyBpZDogaWQsIHR5cGU6ICdxJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwaG90b24nOlxuICAgICAgICBwYXJ0aWNsZSA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHsgaWQ6IGlkLCB0eXBlOiAncGgnIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dsdW9uJzpcbiAgICAgICAgcGFydGljbGUgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZSh7IGlkOiBpZCwgdHlwZTogJ2cnIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHBhcnRpY2xlID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUoeyBpZDogaWQsIHR5cGU6ICdlLScgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJ0aWNsZTtcbiAgfTtcblxuICB2YXIgX2tleXdvcmRGdW5jdGlvbk1hcCA9IHtcbiAgICAnZm1mJyAgICAgICA6IF9wcm9jZXNzRmVybWlvbixcbiAgICAnZm1mcmlnaHQnICA6IF9wcm9jZXNzUmlnaHQsXG4gICAgJ2ZtZmxlZnQnICAgOiBfcHJvY2Vzc0xlZnQsXG4gICAgJ2ZtZnRvcCcgICAgOiBfcHJvY2Vzc1RvcCxcbiAgICAnZm1mYm90dG9tJyA6IF9wcm9jZXNzQm90dG9tLFxuICAgICdmbWZkb3QnICAgIDogX3Byb2Nlc3NEb3RcbiAgfTtcblxuICByZXR1cm4gTGF0ZXhQYXJzZXI7XG59KSgpOyIsInZhciBTdGFuZGFyZFBhcnNlciA9IHJlcXVpcmUoJy4vU3RhbmRhcmRQYXJzZXInKTtcbnZhciBMYXRleFBhcnNlciAgICA9IHJlcXVpcmUoJy4vTGF0ZXhQYXJzZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0UGFyc2VyOiBmdW5jdGlvbihsYW5nKSB7XG5cbiAgICBpZihsYW5nID09PSAnbGF0ZXgnKSB7XG4gICAgICByZXR1cm4gbmV3IExhdGV4UGFyc2VyKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3RhbmRhcmRQYXJzZXIoKTtcbiAgfVxufTsiLCJ2YXIgU3RhZ2UgICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG52YXIgUGFydGljbGVHZW5lcmF0b3IgPSByZXF1aXJlKCcuLy4uL1BhcnRpY2xlR2VuZXJhdG9yJyk7XG52YXIgVmVydGV4ICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1ZlcnRleCcpO1xudmFyIEV4Y2hhbmdlICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9FeGNoYW5nZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBTdGFuZGFyZFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhbmRhcmRQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcblxuICAgIF9zZXRUaXRsZShzdGFnZSwgZGF0YS50aXRsZSk7XG4gICAgX3NldExheW91dChzdGFnZSwgZGF0YS5sYXlvdXQpO1xuICAgIF9zZXREaW1lbnNpb24oc3RhZ2UsIGRhdGEud2lkdGgsIGRhdGEuaGVpZ2h0KTtcbiAgICBfc2V0U2hvd0F4ZXMoc3RhZ2UsIGRhdGEuc2hvd0F4ZXMpO1xuICAgIF9zZXRQcm9wYWdhdG9ycyhzdGFnZSwgZGF0YS5wcm9wYWdhdG9ycyk7XG4gICAgX3NldFZlcnRpY2VzKHN0YWdlLCBkYXRhLnZlcnRpY2VzKTtcbiAgICBfc2V0RXhjaGFuZ2VzKHN0YWdlLCBkYXRhLmV4Y2hhbmdlcyk7XG5cbiAgICByZXR1cm4gc3RhZ2U7XG4gIH07XG5cbiAgdmFyIF9zZXRUaXRsZSA9IGZ1bmN0aW9uKHN0YWdlLCB0aXRsZSkge1xuXG4gICAgaWYodGl0bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UudGl0bGUgPSB0aXRsZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRMYXlvdXQgPSBmdW5jdGlvbihzdGFnZSwgbGF5b3V0KSB7XG5cbiAgICBpZihsYXlvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UubGF5b3V0ID0gbGF5b3V0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldERpbWVuc2lvbiA9IGZ1bmN0aW9uKHN0YWdlLCB3aWR0aCwgaGVpZ2h0KSB7XG5cbiAgICBpZih3aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS53aWR0aCA9IHdpZHRoO1xuICAgIH1cbiAgICBpZihoZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFNob3dBeGVzID0gZnVuY3Rpb24oc3RhZ2UsIHNob3dBeGVzKSB7XG5cbiAgICBpZihzaG93QXhlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5zaG93QXhlcyA9IHNob3dBeGVzO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFByb3BhZ2F0b3JzID0gZnVuY3Rpb24oc3RhZ2UsIHByb3BhZ2F0b3JzKSB7XG5cbiAgICBpZihwcm9wYWdhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcHJvcGFnYXRvcnMhJyk7XG4gICAgfVxuXG4gICAgcHJvcGFnYXRvcnMuZm9yRWFjaChmdW5jdGlvbihwcm9wYWdhdG9yQXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgcCA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHByb3BhZ2F0b3JBdHRyaWJ1dGVzKTtcblxuICAgICAgaWYocCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YWdlLnByb3BhZ2F0b3JzLnB1c2gocCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9zZXRWZXJ0aWNlcyA9IGZ1bmN0aW9uKHN0YWdlLCB2ZXJ0aWNlcykge1xuXG4gICAgaWYodmVydGljZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHZlcnRpY2VzIScpO1xuICAgIH1cblxuICAgIHZlcnRpY2VzLmZvckVhY2goZnVuY3Rpb24odmVydGV4QXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgdiA9IG5ldyBWZXJ0ZXgodmVydGV4QXR0cmlidXRlcy5pZCwgdmVydGV4QXR0cmlidXRlcy5wb3NpdGlvbiwgdmVydGV4QXR0cmlidXRlcy5pbmJvdW5kLCB2ZXJ0ZXhBdHRyaWJ1dGVzLm91dGJvdW5kKTtcblxuICAgICAgaWYodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YWdlLnZlcnRpY2VzW3ZlcnRleEF0dHJpYnV0ZXMucG9zaXRpb25bMF1dLnB1c2godik7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9zZXRFeGNoYW5nZXMgPSBmdW5jdGlvbihzdGFnZSwgZXhjaGFuZ2VzKSB7XG5cbiAgICBpZihleGNoYW5nZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGV4Y2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGV4Y2hhbmdlQXR0cmlidXRlcykge1xuXG4gICAgICB2YXIgZSA9IG5ldyBFeGNoYW5nZShleGNoYW5nZUF0dHJpYnV0ZXMuaWQsIGV4Y2hhbmdlQXR0cmlidXRlcy5pbmJvdW5kLCBleGNoYW5nZUF0dHJpYnV0ZXMub3V0Ym91bmQsIGV4Y2hhbmdlQXR0cmlidXRlcy5wYXJ0aWNsZXMpO1xuXG4gICAgICBpZihlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhZ2UuZXhjaGFuZ2VzLnB1c2goZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIFN0YW5kYXJkUGFyc2VyO1xufSkoKTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgX2NvbG9yICA9ICcjMDAwJztcbiAgdmFyIF9sZW5ndGggPSAxMDk7XG5cbiAgdmFyIEFic3RyYWN0UGFydGljbGUgPSBmdW5jdGlvbihpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHRoaXMuaWQgICAgID0gaWQ7XG4gICAgdGhpcy5hbnRpICAgPSBhbnRpO1xuICAgIHRoaXMuY29sb3IgID0gY29sb3IgIHx8IF9jb2xvcjtcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aCB8fCBfbGVuZ3RoO1xuICAgIHRoaXMueCAgICAgID0gMDtcbiAgICB0aGlzLnkgICAgICA9IDA7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBBYnN0cmFjdFBhcnRpY2xlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjYWxsIGFic3RyYWN0IG1ldGhvZCEnKTtcbiAgfTtcblxuICBBYnN0cmFjdFBhcnRpY2xlLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjYWxsIGFic3RyYWN0IG1ldGhvZCEnKTtcbiAgfTtcblxuICByZXR1cm4gQWJzdHJhY3RQYXJ0aWNsZTtcblxufSkoKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcbnZhciBCZXppZXIgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0JlemllcicpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhFbGVjdHJvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBFbGVjdHJvbihpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgRWxlY3Ryb24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgYW50aSB8fCBmYWxzZSwgY29sb3IsIGxlbmd0aF0pO1xuICB9XG5cbiAgRWxlY3Ryb24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIGNhbnZhcy5wYXRoKHRoaXMuZ2V0UGF0aCgnbGluZScpKVxuICAgICAgICAgIC5maWxsKCdub25lJylcbiAgICAgICAgICAuc3Ryb2tlKHsgd2lkdGg6IDEsIGNvbG9yOiB0aGlzLmNvbG9yIH0pO1xuICB9O1xuXG4gIEVsZWN0cm9uLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oc2hhcGUpIHtcblxuICAgIHZhciB0aWxlID0gWyBbMSwgMV0sIFsyLCAxXSBdO1xuICAgIHZhciBsICAgID0gMTtcblxuICAgIHN3aXRjaChzaGFwZSkge1xuICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZSh0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdhcmMnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmFyYygnZWxlY3Ryb24nLCB0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdsb29wJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5sb29wKCdlbGVjdHJvbicsIHRpbGUsIGwsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZSh0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBFbGVjdHJvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKEdsdW9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIEdsdW9uKGlkLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBHbHVvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCB1bmRlZmluZWQsIGNvbG9yIHx8ICcjMDA5OTMzJywgbGVuZ3RoIHx8IDk2XSk7XG4gIH1cblxuICBHbHVvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdmFyIHBhdGggPSB0aGlzLmdldFBhdGgoJ2FyYycpO1xuICAgIGNhbnZhcy5wYXRoKHBhdGgsIHRydWUpXG4gICAgICAuZmlsbCgnbm9uZScpXG4gICAgICAuc3Ryb2tlKHsgd2lkdGg6IDEsIGNvbG9yOiB0aGlzLmNvbG9yIH0pXG4gICAgICAudHJhbnNsYXRlKDE1MCwgMTUwKTtcbiAgfTtcblxuICBHbHVvbi5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKHNoYXBlKSB7XG5cbiAgICB2YXIgZ2x1b24gPSB7XG4gICAgICB3aWR0aCAgOiAxNSwgICAvLyB0aGUgY29pbCB3aWR0aCBvZiBnbHVvbiBwcm9wYWdhdG9yc1xuICAgICAgaGVpZ2h0IDogMTUsICAgLy8gdGhlIGNvaWwgaGVpZ2h0IG9mIGdsdW9uIHByb3BhZ2F0b3JzXG4gICAgICBmYWN0b3IgOiAwLjc1LCAvLyB0aGUgZmFjdG9yIHBhcmFtZXRlciBmb3IgZ2x1b24gcHJvcGFnYXRvcnNcbiAgICAgIHBlcmNlbnQ6IDAuNiwgIC8vIHRoZSBwZXJjZW50IHBhcmFtZXRlciBmb3IgZ2x1b24gcHJvcGFnYXRvcnNcbiAgICAgIHNjYWxlICA6IDEuMTUgIC8vIHRoZSBzY2FsZSBwYXJhbWV0ZXIgZm9yIGdsdW9uIGFyY3MgYW5kIGxvb3BzXG4gICAgfTtcblxuICAgIHZhciBrYXBwYSA9IDAuNTUxOTE1MDI7XG4gICAgLy8gYSBhbmQgYiBhcmUgb25lLWhhbGYgb2YgdGhlIGVsbGlwc2UncyBtYWpvciBhbmQgbWlub3IgYXhlc1xuICAgIHZhciBhICAgICA9IGdsdW9uLmhlaWdodCAqIGdsdW9uLmZhY3RvcjtcbiAgICB2YXIgYiAgICAgPSBnbHVvbi53aWR0aCAgKiBnbHVvbi5wZXJjZW50O1xuICAgIC8vIGMgYW5kIGQgYXJlIG9uZS1oYWxmIG9mIG1ham9yIGFuZCBtaW5vciBheGVzIG9mIHRoZSBvdGhlciBlbGxpcHNlXG4gICAgdmFyIGMgICAgID0gZ2x1b24uaGVpZ2h0ICogKGdsdW9uLmZhY3RvciAtIDAuNSk7XG4gICAgdmFyIGQgICAgID0gZ2x1b24ud2lkdGggICogKDEgLSBnbHVvbi5wZXJjZW50KTtcblxuICAgIHZhciBkaXIgICA9IGZhbHNlO1xuICAgIHZhciBwdHMgICA9IChkaXJcbiAgICAgID8gW1swLCAwXSwgJ0EgJyArIGEgKyAnICcgKyBiLCAwLCAwLCAxLCBbYSwgYl0sXG4gICAgICAgICAgICAgICAgICdBICcgKyBjICsgJyAnICsgZCwgMCwgMSwgMSwgW2EgLSAyICogYywgYl0sXG4gICAgICAgICAgICAgICAgICdBICcgKyBhICsgJyAnICsgYiwgMCwgMCwgMV1cbiAgICAgIDogW1swLCAwXSwgJ0EgJyArIGEgKyAnICcgKyBiLCAwLCAwLCAwLCBbYSwgLWJdLFxuICAgICAgICAgICAgICAgICAnQSAnICsgYyArICcgJyArIGQsIDAsIDEsIDAsIFthIC0gMiAqIGMsIC1iXSxcbiAgICAgICAgICAgICAgICAgJ0EgJyArIGEgKyAnICcgKyBiLCAwLCAwLCAwXVxuICAgICk7XG5cbiAgICBhID0gKGRpciA/IGEgOiBnbHVvbi5zY2FsZSAqIGEpO1xuICAgIHZhciBsaWZ0ID0gYSAvIE1hdGgucG93KHRoaXMubGVuZ3RoLCAwLjYpO1xuXG4gICAgdmFyIHRpbGUgPSAoZGlyXG4gICAgICA/IFsnQycsIFtrYXBwYSAqIGEsIGxpZnRdLCBbYSwgYiAtIGthcHBhICogYl0sIFthLCBiXSxcbiAgICAgICAgICdDJywgW2EsIGIgKyBrYXBwYSAqIGRdLCBbYSAtIGMgKyBrYXBwYSAqIGMsIGIgKyBkXSwgW2EgLSBjLCBiICsgZF0sXG4gICAgICAgICAnUycsIFthIC0gMiAqIGMsIGIgKyBrYXBwYSAqIGRdLCBbYSAtIDIgKiBjLCBiXSxcbiAgICAgICAgICdDJywgW2EgLSAyICogYywgYiAtIGthcHBhICogYl0sIFsyICogKGEgLSBjKSAtIGthcHBhICogYSwgMF0sIFsyICogKGEgLSBjKSwgLWxpZnRdXVxuICAgICAgOiBbJ0MnLCBba2FwcGEgKiBhLCBsaWZ0XSwgW2EsIC1iICsga2FwcGEgKiBiXSwgW2EsIC1iXSxcbiAgICAgICAgICdDJywgW2EsIC1iIC0ga2FwcGEgKiBkXSwgW2EgLSBjICsga2FwcGEgKiBjLCAtYiAtIGRdLCBbYSAtIGMsIC1iIC0gZF0sXG4gICAgICAgICAnUycsIFthIC0gMiAqIGMsIC1iIC0ga2FwcGEgKiBkXSwgW2EgLSAyICogYywgLWJdLFxuICAgICAgICAgJ0MnLCBbYSAtIDIgKiBjLCAtYiArIGthcHBhICogYl0sIFsyICogKGEgLSBjKSAtIGthcHBhICogYSwgMF0sIFsyICogKGEgLSBjKSwgLWxpZnRdXVxuICAgICk7XG5cbiAgICBzd2l0Y2goc2hhcGUpIHtcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUocHRzLCBnbHVvbi5oZWlnaHQsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGNhc2UgJ2FyYyc6XG4gICAgICAgIHJldHVybiBCZXppZXIuYXJjKCdnbHVvbicsIHRpbGUsIGEgLSBjLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdsb29wJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5sb29wKCdnbHVvbicsIHRpbGUsIGEgLSBjLCB0aGlzLmxlbmd0aCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUocHRzLCBnbHVvbi5oZWlnaHQsIHRoaXMubGVuZ3RoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIEdsdW9uO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcbnZhciBCZXppZXIgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0JlemllcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoUGhvdG9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIFBob3RvbihpZCwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgUGhvdG9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIHVuZGVmaW5lZCwgY29sb3IgfHwgJyMwMDY2RkYnLCBsZW5ndGggfHwgMTA5XSk7XG4gIH1cblxuICBQaG90b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHZhciBwYXRoID0gdGhpcy5nZXRQYXRoKCdsaW5lJyk7XG4gICAgY2FudmFzLnBhdGgocGF0aCwgdHJ1ZSlcbiAgICAgICAgICAuZmlsbCgnbm9uZScpXG4gICAgICAgICAgLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQXBwcm94aW1hdGlvbiBvZiB0aGUgZmlyc3QgcXVhcnRlciBvZiBvbmUgcGVyaW9kIG9mIGEgc2luZSBjdXJ2ZVxuICAgKiBpcyBhIGN1YmljIEJlemllciBjdXJ2ZSB3aXRoIHRoZSBmb2xsb3dpbmcgY29udHJvbCBwb2ludHM6XG4gICAqXG4gICAqICgwLCAwKSAobGFtYmRhICogcCAvIFBJLCBsYW1iZGEgKiBhIC8gMikgKDIgKiBwIC8gUEksIGEpIChwLCBhKVxuICAgKlxuICAgKiBSZWZlcmVuY2VzOlxuICAgKlxuICAgKiBbMV0gaHR0cDovL21hdGhiLmluLzE0NDdcbiAgICogWzJdIGh0dHBzOi8vZ2l0aHViLmNvbS9waG90aW5vL2pxdWVyeS1mZXluL2Jsb2IvbWFzdGVyL2pzL2pxdWVyeS5mZXluLTEuMC4xLmpzXG4gICAqXG4gICAqIEBwYXJhbSBzaGFwZVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIFBob3Rvbi5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKHNoYXBlKSB7XG5cbiAgICB2YXIgUEkgICAgID0gTWF0aC5QSTtcbiAgICB2YXIgbGFtYmRhID0gMC41MTEyODczMztcbiAgICB2YXIgYSAgICAgID0gNTtcbiAgICB2YXIgYiAgICAgID0gMC41ICogbGFtYmRhICogYTtcbiAgICB2YXIgcCAgICAgID0gNTtcbiAgICB2YXIgcSAgICAgID0gMiAqIHAgLyBQSTtcbiAgICB2YXIgdCAgICAgID0gbGFtYmRhICogcCAvIFBJO1xuICAgIHZhciBkaXIgICAgPSBmYWxzZTtcblxuICAgIHZhciBwdHMgPSAoZGlyXG4gICAgICA/IFtbMCwgMF0sICdDJywgW3QsIC1iXSwgW3EsIC1hXSwgW3AsIC1hXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCwgMF0sXG4gICAgICAgICAgICAgICAgICdTJywgWzIgKiBwICsgcSwgYV0sIFszICogcCwgYV0sXG4gICAgICAgICAgICAgICAgICdTJywgWzQgKiBwIC0gdCwgYl1dXG4gICAgICA6IFtbMCwgMF0sICdDJywgW3QsIGJdLCBbcSwgYV0sIFtwLCBhXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCBiXSwgWzIgKiBwLCAwXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbMiAqIHAgKyBxLCAtYV0sIFszICogcCwgLWFdLFxuICAgICAgICAgICAgICAgICAnUycsIFs0ICogcCAtIHQsIC1iXV1cbiAgICApO1xuXG4gICAgdmFyIHRpbGUgPSAoZGlyXG4gICAgICA/IFtbJ0MnLCBbdCwgLWJdLCBbcSwgLWFdLCBbcCwgLWFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgLWJdLCBbMiAqIHAgKyAwLjUsIDBdXSxcbiAgICAgICAgIFsnQycsIFt0LCBiXSwgW3EsIGFdLCBbcCwgYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCAtIDAuNSwgMF1dXVxuICAgICAgOiBbWydDJywgW3QsIGJdLCBbcSwgYV0sIFtwLCBhXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIGJdLCBbMiAqIHAgLSAwLjUsIDBdXSxcbiAgICAgICAgIFsnQycsIFt0LCAtYl0sIFtxLCAtYV0sIFtwLCAtYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCArIDAuNSwgMF1dXVxuICAgICk7XG5cbiAgICBzd2l0Y2goc2hhcGUpIHtcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUocHRzLCA0ICogcCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnYXJjJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5hcmMoJ3Bob3RvbicsIHRpbGUsIHAsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGNhc2UgJ2xvb3AnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxvb3AoJ3Bob3RvbicsIHRpbGUsIHAsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZShwdHMsIDQgKiBwLCB0aGlzLmxlbmd0aCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBQaG90b247XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoUXVhcmssIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gUXVhcmsoaWQsIGFudGksIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIFF1YXJrLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIGFudGkgfHwgZmFsc2UsIGNvbG9yLCBsZW5ndGhdKTtcbiAgfVxuXG4gIFF1YXJrLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgfTtcblxuICBRdWFyay5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gIHJldHVybiBRdWFyaztcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7Il19
(7)
});
;