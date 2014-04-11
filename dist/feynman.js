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

  Stage.prototype.getVertexById = function(id) {

    var result = undefined;

    for(var key in this.vertices) {
      if(this.vertices.hasOwnProperty(key)) {
        this.vertices[key].forEach(function(vertex) {
          if(vertex.id === id) {
            result = vertex;
          }
        });
      }
    }

    return result;
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

    for(var key in ctx.vertices) {
      if(ctx.vertices.hasOwnProperty(key)) {
        ctx.vertices[key].forEach(function(vertex) {
          vertex.draw(ctx);
        });
      }
    }
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
    this.visible  = false;

    return this;
  };

  Vertex.prototype.move = function(stage) {

    var coords    = _getVertexCoordinates(this, stage);
    this.x        = coords[0];
    this.y        = coords[1];
  };

  Vertex.prototype.draw = function(stage) {

    if(!this.visible) {
      return;
    }

    this.move(stage);

    stage.canvas.circle(3)
          .fill({ color: '#000' })
          .translate(this.x, this.y);
  };

  var _getVertexCoordinates = function(vertex, stage) {

    var wUnit = Math.floor(stage.width  / 4);
    var hUnit = Math.floor(stage.height / 4);

    var x = 0;
    var y = 0;

    switch(vertex.position[0]) {
      case 'left':
        x = wUnit;
        break;
      case 'right':
        x = wUnit * 3;
        break;
    }

    y = vertex.position[1] * hUnit;

    return [x, y];
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

    // "Exchange fermion" : fmf{photon}{v1,v2}
    // if(args[1][0][0] === 'v') {
      
    // }

    // "In fermion" : fmf{electron}{*i1*,v1,o1}
    var particle = _getParticle(args[0][0], args[1][0]);
    stage.propagators.push(particle);

    // "Out fermion" : fmf{electron}{i1,v1,*o1*}
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

    vertex.move(stage);

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

    args[0].forEach(function(vertexId) {

      var vertex = stage.getVertexById(vertexId);

      if(vertex !== undefined) {
        vertex.visible = true;
      }
    });
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9FeGNoYW5nZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1BhcnRpY2xlR2VuZXJhdG9yLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvU3RhZ2UuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9WZXJ0ZXguanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9oZWxwZXJzL0Jlemllci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2hlbHBlcnMvS2xhc3MuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvTGF0ZXhQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1BhcnNlckZhY3RvcnkuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvQWJzdHJhY3RQYXJ0aWNsZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL0VsZWN0cm9uLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvR2x1b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9QaG90b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9RdWFyay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vUGFydGljbGVHZW5lcmF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEV4Y2hhbmdlID0gZnVuY3Rpb24oaWQsIGluYm91bmQsIG91dGJvdW5kLCBwYXJ0aWNsZXMpIHtcblxuICAgIGlmKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZihpbmJvdW5kID09PSB1bmRlZmluZWQgfHwgb3V0Ym91bmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeGNoYW5nZSBtdXN0IGhhdmUgYm90aCBhbiBpbmJvdW5kIGFuZCBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgaWYocGFydGljbGVzID09PSB1bmRlZmluZWQgfHwgcGFydGljbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBwYXJ0aWNsZXMgZ2l2ZW4hJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgICAgPSBpZDtcbiAgICB0aGlzLmluYm91bmQgICA9IGluYm91bmQ7XG4gICAgdGhpcy5vdXRib3VuZCAgPSBvdXRib3VuZDtcbiAgICB0aGlzLnBhcnRpY2xlcyA9IFtdO1xuXG4gICAgX2NyZWF0ZUV4Y2hhbmdlUGFydGljbGVzKHRoaXMsIHBhcnRpY2xlcyk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFeGNoYW5nZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdGhpcy5wYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZSkge1xuICAgICAgcGFydGljbGUuZHJhdyhjYW52YXMpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfY3JlYXRlRXhjaGFuZ2VQYXJ0aWNsZXMgPSBmdW5jdGlvbihjdHgsIHBhcnRpY2xlcykge1xuXG4gICAgcGFydGljbGVzLmZvckVhY2goZnVuY3Rpb24ocGFydGljbGVBdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciBwID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUocGFydGljbGVBdHRyaWJ1dGVzKTtcblxuICAgICAgaWYocCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGN0eC5wYXJ0aWNsZXMucHVzaChwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gRXhjaGFuZ2U7XG59KSgpOyIsInZhciBFbGVjdHJvbiA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvRWxlY3Ryb24nKTtcbnZhciBRdWFyayAgICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvUXVhcmsnKTtcbnZhciBHbHVvbiAgICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvR2x1b24nKTtcbnZhciBQaG90b24gICA9IHJlcXVpcmUoJy4vcHJvcGFnYXRvcnMvUGhvdG9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldFBhcnRpY2xlOiBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2UtJykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVjdHJvbihkYXRhLmlkLCBmYWxzZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2UrJykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVjdHJvbihkYXRhLmlkLCB0cnVlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAncScpIHtcbiAgICAgIHJldHVybiBuZXcgUXVhcmsoZGF0YS5pZCwgZmFsc2UsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdhcScpIHtcbiAgICAgIHJldHVybiBuZXcgUXVhcmsoZGF0YS5pZCwgdHJ1ZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2cnKSB7XG4gICAgICByZXR1cm4gbmV3IEdsdW9uKGRhdGEuaWQsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdwaCcpIHtcbiAgICAgIHJldHVybiBuZXcgUGhvdG9uKGRhdGEuaWQsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIFN0YWdlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBHZW5lcmljIEF0dHJpYnV0ZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMudGl0bGUgICAgPSAnRmV5bm1hbic7XG4gICAgdGhpcy5sYXlvdXQgICA9ICd0aW1lLXNwYWNlJztcbiAgICB0aGlzLndpZHRoICAgID0gMTAwO1xuICAgIHRoaXMuaGVpZ2h0ICAgPSAxMDA7XG4gICAgdGhpcy5zaG93QXhlcyA9IHRydWU7XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKHJlcXVpcmVkKVxuICAgIHRoaXMucHJvcGFnYXRvcnMgPSBbXTtcbiAgICB0aGlzLnZlcnRpY2VzICAgID0ge1xuICAgICAgbGVmdCAgIDogW10sXG4gICAgICByaWdodCAgOiBbXSxcbiAgICAgIHRvcCAgICA6IFtdLFxuICAgICAgYm90dG9tIDogW11cbiAgICB9O1xuXG4gICAgLy8gTWFpbiBwcm9wZXJ0aWVzIChvcHRpb25hbClcbiAgICB0aGlzLmV4Y2hhbmdlcyAgID0gW107XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFnZS5wcm90b3R5cGUuZ2V0VmVydGV4QnlJZCA9IGZ1bmN0aW9uKGlkKSB7XG5cbiAgICB2YXIgcmVzdWx0ID0gdW5kZWZpbmVkO1xuXG4gICAgZm9yKHZhciBrZXkgaW4gdGhpcy52ZXJ0aWNlcykge1xuICAgICAgaWYodGhpcy52ZXJ0aWNlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHRoaXMudmVydGljZXNba2V5XS5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleCkge1xuICAgICAgICAgIGlmKHZlcnRleC5pZCA9PT0gaWQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHZlcnRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgU3RhZ2UucHJvdG90eXBlLnNldENhbnZhcyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgdGhpcy5jYW52YXMuc2l6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFnZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgX2RyYXdUaXRsZSh0aGlzKTtcbiAgICBfZHJhd1ZlcnRpY2VzKHRoaXMpO1xuICAgIF9kcmF3UHJvcGFnYXRvcnModGhpcyk7XG4gICAgX2RyYXdFeGNoYW5nZXModGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIF9kcmF3VGl0bGUgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC5jYW52YXMudGV4dChjdHgudGl0bGUpLmZvbnQoe1xuICAgICAgZmFtaWx5IDogJ0dlb3JnaWEnLFxuICAgICAgc2l6ZSAgIDogIDE0LFxuICAgICAgc3R5bGUgIDogJ2l0YWxpYycsXG4gICAgICBhbmNob3IgOiAnbGVmdCdcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX2RyYXdWZXJ0aWNlcyA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgZm9yKHZhciBrZXkgaW4gY3R4LnZlcnRpY2VzKSB7XG4gICAgICBpZihjdHgudmVydGljZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBjdHgudmVydGljZXNba2V5XS5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleCkge1xuICAgICAgICAgIHZlcnRleC5kcmF3KGN0eCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgX2RyYXdQcm9wYWdhdG9ycyA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgY3R4LnByb3BhZ2F0b3JzLmZvckVhY2goZnVuY3Rpb24ocGFydGljbGUpIHtcbiAgICAgIHBhcnRpY2xlLmRyYXcoY3R4LmNhbnZhcyk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9kcmF3RXhjaGFuZ2VzID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHguZXhjaGFuZ2VzLmZvckVhY2goZnVuY3Rpb24oZXhjaGFuZ2UpIHtcbiAgICAgIGV4Y2hhbmdlLmRyYXcoY3R4LmNhbnZhcyk7XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIFN0YWdlO1xufSkoKTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgVmVydGV4ID0gZnVuY3Rpb24oaWQsIHBvc2l0aW9uLCBpbmJvdW5kLCBvdXRib3VuZCkge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKHBvc2l0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBwb3NpdGlvbiBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZihpbmJvdW5kID09PSB1bmRlZmluZWQgJiYgb3V0Ym91bmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdWZXJ0aWNlcyBtdXN0IGhhdmUgZWl0aGVyIGFuIGluYm91bmQgb3Igb3V0Ym91bmQgYXR0cmlidXRlIScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgIT09IHVuZGVmaW5lZCAmJiBpbmJvdW5kLmxlbmd0aCA9PT0gMCAmJiBvdXRib3VuZCAhPT0gdW5kZWZpbmVkICYmIG91dGJvdW5kLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdWZXJ0aWNlcyBtdXN0IGhhdmUgZWl0aGVyIGFuIGluYm91bmQgb3Igb3V0Ym91bmQgYXR0cmlidXRlIScpO1xuICAgIH1cblxuICAgIHRoaXMuaWQgICAgICAgPSBpZDtcbiAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5pbmJvdW5kICA9IGluYm91bmQgIHx8IFtdO1xuICAgIHRoaXMub3V0Ym91bmQgPSBvdXRib3VuZCB8fCBbXTtcbiAgICB0aGlzLnggICAgICAgID0gMDtcbiAgICB0aGlzLnkgICAgICAgID0gMDtcbiAgICB0aGlzLnZpc2libGUgID0gZmFsc2U7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBWZXJ0ZXgucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihzdGFnZSkge1xuXG4gICAgdmFyIGNvb3JkcyAgICA9IF9nZXRWZXJ0ZXhDb29yZGluYXRlcyh0aGlzLCBzdGFnZSk7XG4gICAgdGhpcy54ICAgICAgICA9IGNvb3Jkc1swXTtcbiAgICB0aGlzLnkgICAgICAgID0gY29vcmRzWzFdO1xuICB9O1xuXG4gIFZlcnRleC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHN0YWdlKSB7XG5cbiAgICBpZighdGhpcy52aXNpYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlKHN0YWdlKTtcblxuICAgIHN0YWdlLmNhbnZhcy5jaXJjbGUoMylcbiAgICAgICAgICAuZmlsbCh7IGNvbG9yOiAnIzAwMCcgfSlcbiAgICAgICAgICAudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgfTtcblxuICB2YXIgX2dldFZlcnRleENvb3JkaW5hdGVzID0gZnVuY3Rpb24odmVydGV4LCBzdGFnZSkge1xuXG4gICAgdmFyIHdVbml0ID0gTWF0aC5mbG9vcihzdGFnZS53aWR0aCAgLyA0KTtcbiAgICB2YXIgaFVuaXQgPSBNYXRoLmZsb29yKHN0YWdlLmhlaWdodCAvIDQpO1xuXG4gICAgdmFyIHggPSAwO1xuICAgIHZhciB5ID0gMDtcblxuICAgIHN3aXRjaCh2ZXJ0ZXgucG9zaXRpb25bMF0pIHtcbiAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICB4ID0gd1VuaXQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICB4ID0gd1VuaXQgKiAzO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB5ID0gdmVydGV4LnBvc2l0aW9uWzFdICogaFVuaXQ7XG5cbiAgICByZXR1cm4gW3gsIHldO1xuICB9O1xuXG4gIHJldHVybiBWZXJ0ZXg7XG59KSgpOyIsInZhciBQSSAgICAgID0gTWF0aC5QSTtcbnZhciBpc0FycmF5ID0gZnVuY3Rpb24oYSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbm9ybWFsaXplUGF0aFN0cmluZzogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc3RyID0gJyc7XG5cbiAgICBmb3IodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aCwgaXRlbTsgaSA8IGw7IGkrKykge1xuXG4gICAgICBpdGVtID0gYXJndW1lbnRzW2ldO1xuICAgICAgc3RyICs9ICcgJyArICh0eXBlb2YgaXRlbSAhPT0gJ251bWJlcicgP1xuICAgICAgICBpdGVtIDpcbiAgICAgICAgaXRlbS50b0ZpeGVkKDMpLnJlcGxhY2UoLyguXFxkKj8pMCskLywgJyQxJykucmVwbGFjZSgvXFwuJC8sICcnKVxuICAgICAgKTtcbiAgICB9XG4gICAgdmFyIHRyaW1tZWQgPSBzdHIudHJpbSgpO1xuXG4gICAgcmV0dXJuIHRyaW1tZWQucmVwbGFjZSgvID8sID8vZywgJywnKTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IGNvb3JkaW5hdGVzIG9mIGEgZ2l2ZW4gcG9pbnQgaW4gcmVmZXJlbmNlIHRvIGEgZ2l2ZW4gQmV6aWVyIGN1cnZlIHNlZ21lbnRcbiAgICpcbiAgICogQHBhcmFtIHN4IFN0YXJ0IG9mIHNlZ21lbnQgWFxuICAgKiBAcGFyYW0gc3kgU3RhcnQgb2Ygc2VnbWVudCBZXG4gICAqIEBwYXJhbSBleCBFbmQgb2Ygc2VnbWVudCBYXG4gICAqIEBwYXJhbSBleSBFbmQgb2Ygc2VnbWVudCBZXG4gICAqIEBwYXJhbSB4ICBQb2ludCB0byBmaXQgWFxuICAgKiBAcGFyYW0geSAgUG9pbnQgdG8gZml0IFlcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBnZXRDb29yZGluYXRlc0luQmV6aWVyOiBmdW5jdGlvbihzeCwgc3ksIGV4LCBleSwgeCwgeSkge1xuXG4gICAgdmFyIGFuZyA9IE1hdGguYXRhbjIoZXkgLSBzeSwgZXggLSBzeCk7XG5cbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemVQYXRoU3RyaW5nKHggKiBNYXRoLmNvcyhhbmcpIC0geSAqIE1hdGguc2luKGFuZykgKyBzeCwgJywnLCB4ICogTWF0aC5zaW4oYW5nKSArIHkgKiBNYXRoLmNvcyhhbmcpICsgc3kpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm9qZWN0IGEgZ2l2ZW4gKExwKSAxLzQgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGxvbmcgc3RyYWlnaHQgbGluZS5cbiAgICpcbiAgICogQHBhcmFtIHRpbGUgICAgICAgKEMpICBDdXJ2ZSBzZWdtZW50XG4gICAqIEBwYXJhbSBwZXJpb2QgICAgIChMcCkgTGVuZ3RoIG9mIGEgcXVhcnRlciBwZXJpb2RcbiAgICogQHBhcmFtIGxlbmd0aCAgICAgKExsKSBMZW5ndGggb2YgcHJvcGFnYXRvclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBTVkcgcGF0aFxuICAgKi9cbiAgbGluZTogZnVuY3Rpb24odGlsZSwgcGVyaW9kLCBsZW5ndGgpIHtcblxuICAgIHZhciBiZXppZXIgPSBbJ00nXTtcbiAgICB2YXIgbnVtICAgID0gTWF0aC5mbG9vcihsZW5ndGggLyBwZXJpb2QpO1xuICAgIHZhciBleHRyYSAgPSBsZW5ndGggLSBwZXJpb2QgKiBudW0gKyAwLjE7XG5cbiAgICBmb3IodmFyIG4gPSAwOyBuIDw9IG51bTsgbisrKSB7XG5cbiAgICAgIGZvcih2YXIgaSA9IDAsIGwgPSB0aWxlLmxlbmd0aCwgaXRlbTsgaSA8IGw7IGkrKykge1xuXG4gICAgICAgIGl0ZW0gPSB0aWxlW2ldO1xuXG4gICAgICAgIGlmKGlzQXJyYXkoaXRlbSkpIHtcblxuICAgICAgICAgIGlmKG4gPCBudW0gfHwgaXRlbVswXSA8IGV4dHJhKSB7XG4gICAgICAgICAgICBiZXppZXIucHVzaCh0aGlzLm5vcm1hbGl6ZVBhdGhTdHJpbmcoaXRlbVswXSArIHBlcmlvZCAqIG4sICcsJywgaXRlbVsxXSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmV6aWVyLnB1c2goaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmV6aWVyLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHNbQS1aXVteQS1aXSokLywgJycpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm9qZWN0IGEgZ2l2ZW4gKExwKSBxdWFydGVyIHBlcmlvZCBsb25nIEJlemllciBzcGxpbmUgKEMpIG9udG8gYW4gKExsKSBsb25nIGFyYy5cbiAgICpcbiAgICogQHBhcmFtIHBhcnRpY2xlICAgVHlwZSBvZiBwYXJ0aWNsZSwgZS5nLjogXCJwaG90b25cIlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgIEN1cnZlIHNlZ21lbnRcbiAgICogQHBhcmFtIHBlcmlvZCAgICAgKExwKSBMZW5ndGggb2YgYSAxLzQgcGVyaW9kXG4gICAqIEBwYXJhbSBsZW5ndGggICAgIChMbCkgTGVuZ3RoXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBhcmM6IGZ1bmN0aW9uKHBhcnRpY2xlLCB0aWxlLCBwZXJpb2QsIGxlbmd0aCkge1xuXG4gICAgdmFyIHRlbnNpb24gPSAyO1xuICAgIHZhciB0ICAgICAgID0gMC4yNSAqIE1hdGgubWF4KHRlbnNpb24sIDIpO1xuICAgIHZhciBwaGkgICAgID0gTWF0aC5hY29zKC0wLjUgLyB0KTtcbiAgICB2YXIgdGhldGEgICA9IC0yICogTWF0aC5hc2luKHBlcmlvZCAvICh0ICogbGVuZ3RoKSk7XG4gICAgdmFyIHNlZ21lbnQgPSBbXTtcbiAgICB2YXIgYmV6aWVyICA9IFsnTScsICcwLDAnXTtcblxuICAgIC8vIGdldCBjb29yZGluYXRlIHBhaXJzIGZvciB0aGUgZW5kcG9pbnQgb2Ygc2VnbWVudFxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gKFBJIC0gMiAqIHBoaSkgLyB0aGV0YTsgbisrKSB7XG4gICAgICBzZWdtZW50LnB1c2goW2xlbmd0aCAqICh0ICogTWF0aC5jb3ModGhldGEgKiBuICsgcGhpKSArIDAuNSksIGxlbmd0aCAqICh0ICogTWF0aC5zaW4odGhldGEgKiBuICsgcGhpKSAtIE1hdGguc3FydCh0ICogdCAtIDAuMjUpKV0pO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBzZWdtZW50Lmxlbmd0aCAtIDEsIG1vZGVsOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIG1vZGVsID0gKHBhcnRpY2xlID09PSAncGhvdG9uJyA/IHRpbGVbaSAlIDJdIDogdGlsZSk7XG5cbiAgICAgIGZvcih2YXIgaiA9IDAsIG0gPSBtb2RlbC5sZW5ndGgsIGl0ZW07IGogPCBtOyBqKyspIHtcbiAgICAgICAgaXRlbSA9IG1vZGVsW2pdO1xuICAgICAgICBiZXppZXIucHVzaChpc0FycmF5KGl0ZW0pXG4gICAgICAgICAgPyB0aGlzLmdldENvb3JkaW5hdGVzSW5CZXppZXIoc2VnbWVudFtpXVswXSwgc2VnbWVudFtpXVsxXSwgc2VnbWVudFtpKzFdWzBdLCBzZWdtZW50W2krMV1bMV0sIGl0ZW1bMF0sIGl0ZW1bMV0pXG4gICAgICAgICAgOiBpdGVtXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlemllci5qb2luKCcgJykucmVwbGFjZSgvXFxzW0EtWl0kLywgJycpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcm9qZWN0IGEgZ2l2ZW4gKExwKSBxdWFydGVyIHBlcmlvZCBsb25nIEJlemllciBzcGxpbmUgKEMpIG9udG8gYW4gKExsKSBkaWFtZXRlciBjaXJjbGUuXG4gICAqXG4gICAqIEBwYXJhbSBwYXJ0aWNsZSAgIFR5cGUgb2YgcGFydGljbGUsIGUuZy46IFwicGhvdG9uXCJcbiAgICogQHBhcmFtIHRpbGUgICAgICAgKEMpIEN1cnZlIHNlZ21lbnRcbiAgICogQHBhcmFtIHBlcmlvZCAgICAgKE4pIExlbmd0aCBvZiBhIDEvNCBwZXJpb2RcbiAgICogQHBhcmFtIGxlbmd0aCAgICAgKEwpIExlbmd0aFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBTVkcgcGF0aFxuICAgKi9cbiAgbG9vcDogZnVuY3Rpb24ocGFydGljbGUsIHRpbGUsIHBlcmlvZCwgbGVuZ3RoKSB7XG5cbiAgICB2YXIgY3cgICAgICA9IHRydWU7XG4gICAgdmFyIHRoZXRhICAgPSAyICogTWF0aC5hc2luKDIgKiBwZXJpb2QgLyBsZW5ndGgpO1xuICAgIHZhciBudW0gICAgID0gMiAqIFBJIC8gdGhldGE7XG4gICAgdmFyIHNlZ21lbnQgPSBbXTtcbiAgICB2YXIgbGlmdCAgICA9IChjdyA/IC0wLjUgOiAwLjUpO1xuICAgIHZhciBiZXppZXIgID0gWydNJywgKHBhcnRpY2xlID09PSAnZ2x1b24nID8gbGlmdCArICcsMCcgOiAnMCwnICsgbGlmdCldO1xuXG4gICAgLy8gZmluZCB0aGUgbW9kaWZpZWQgZGlzdGFuY2Ugc3VjaCB0aGF0IHRoZSBudW1iZXIgb2YgdGlsZXMgaXMgYW4gaW50ZWdlclxuICAgIGZvcih2YXIgeCA9IC0wLjEsIGRpcyA9IGxlbmd0aDsgTWF0aC5mbG9vcihudW0pICUgNCB8fCBudW0gLSBNYXRoLmZsb29yKG51bSkgPiAwLjE7IHggKz0gMC4wMDEpIHtcblxuICAgICAgbGVuZ3RoID0gKDEgKyB4KSAqIGRpcztcbiAgICAgIHRoZXRhICA9IDIgKiBNYXRoLmFzaW4oMiAqIHBlcmlvZCAvIGxlbmd0aCk7XG4gICAgICBudW0gICAgPSAyICogUEkgLyB0aGV0YTtcbiAgICB9XG5cbiAgICAvLyBnZXQgY29vcmRpbmF0ZSBwYWlycyBmb3IgdGhlIGVuZHBvaW50IG9mIHNlZ21lbnRcbiAgICBmb3IodmFyIG4gPSAwOyBuIDw9IG51bTsgbisrKSB7XG5cbiAgICAgIHZhciBzeCA9IDAuNSAqIGxlbmd0aCAqICgxIC0gTWF0aC5jb3ModGhldGEgKiBuKSk7XG4gICAgICB2YXIgc3kgPSAwLjUgKiBsZW5ndGggKiBNYXRoLnNpbih0aGV0YSAqIG4pO1xuICAgICAgc2VnbWVudC5wdXNoKFtzeCwgc3ldKTtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwLCBsID0gc2VnbWVudC5sZW5ndGggLSAxLCBtb2RlbDsgaSA8IGw7IGkrKykge1xuXG4gICAgICAvLyB0d28gcGhvdG9uIHRpbGVzIGZvcm0gYSBwZXJpb2Qgd2hlcmVhcyBvbmUgZ2x1b24gdGlsZSBpcyBhIHBlcmlvZFxuICAgICAgbW9kZWwgPSAocGFydGljbGUgPT09ICdwaG90b24nID8gdGlsZVtpICUgMl0gOiB0aWxlKTtcblxuICAgICAgLy8gZ2V0IGJlemllciBwYXRoIGZvciBwaG90b24gYW5kIGdsdW9uIGFyY1xuICAgICAgZm9yKHZhciBqID0gMCwgbSA9IG1vZGVsLmxlbmd0aCwgaXRlbTsgaiA8IG07IGorKykge1xuXG4gICAgICAgIGl0ZW0gPSBtb2RlbFtqXTtcbiAgICAgICAgYmV6aWVyLnB1c2goaXNBcnJheShpdGVtKVxuICAgICAgICAgID8gdGhpcy5nZXRDb29yZGluYXRlc0luQmV6aWVyKHNlZ21lbnRbaV1bMF0sIHNlZ21lbnRbaV1bMV0sIHNlZ21lbnRbaSsxXVswXSwgc2VnbWVudFtpKzFdWzFdLCBpdGVtWzBdLCBpdGVtWzFdKVxuICAgICAgICAgIDogaXRlbVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBiZXppZXIuam9pbignICcpLnJlcGxhY2UoL1xcc1tBLVpdJC8sICcnKSArICcgWic7XG4gIH1cbn07IiwidmFyIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgX19leHRlbmRzOiBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKF9faGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfVxufTsiLCJ2YXIgUGFyc2VyRmFjdG9yeSA9IHJlcXVpcmUoJy4vcGFyc2Vycy9QYXJzZXJGYWN0b3J5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBGZXlubWFuID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogRHJhdyBkaWFncmFtIG9udG8gY2FudmFzLlxuICAgKiBAcGFyYW0gY2FudmFzIElkIG9mIGNhbnZhcyBlbGVtZW50XG4gICAqIEBwYXJhbSBkYXRhICAgRGlhZ3JhbSBwcm9wZXJ0aWVzXG4gICAqL1xuICBGZXlubWFuLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzLCBkYXRhKSB7XG5cbiAgICBpZiAodHlwZW9mIGNhbnZhcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBjYW52YXMjaWQgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgdmFyIHN2Z0NhbnZhcyAgPSBuZXcgU1ZHKGNhbnZhcyk7XG4gICAgdmFyIHBhcnNlciAgICAgPSBQYXJzZXJGYWN0b3J5LmdldFBhcnNlcihkYXRhLmxhbmcpO1xuICAgIHZhciBzdGFnZSAgICAgID0gcGFyc2VyLnBhcnNlKGRhdGEpO1xuXG4gICAgc3RhZ2Uuc2V0Q2FudmFzKHN2Z0NhbnZhcykuZHJhdygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgd2luZG93LkZleW5tYW4gPSBGZXlubWFuO1xuXG4gIHJldHVybiBGZXlubWFuO1xufSkoKTsiLCJ2YXIgU3RhZ2UgICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG52YXIgUGFydGljbGVHZW5lcmF0b3IgPSByZXF1aXJlKCcuLy4uL1BhcnRpY2xlR2VuZXJhdG9yJyk7XG52YXIgVmVydGV4ICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1ZlcnRleCcpO1xudmFyIEV4Y2hhbmdlICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9FeGNoYW5nZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcblxuICB2YXIgTGF0ZXhQYXJzZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIExhdGV4UGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgc3RhZ2UgICAgICAgID0gbmV3IFN0YWdlKCk7XG4gICAgc3RhZ2UudGl0bGUgID0gZGF0YS50aXRsZTtcbiAgICBzdGFnZS53aWR0aCAgPSBkYXRhLndpZHRoO1xuICAgIHN0YWdlLmhlaWdodCA9IGRhdGEuaGVpZ2h0O1xuXG4gICAgZGF0YS5kaWFncmFtLmZvckVhY2goZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgX3Byb2Nlc3NDb21tYW5kKGNvbW1hbmQpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgcmV0dXJuIHN0YWdlO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc0NvbW1hbmQgPSBmdW5jdGlvbihjb21tYW5kKSB7XG5cbiAgICB2YXIga2V5d29yZCAgID0gY29tbWFuZC5tYXRjaCgvXFx3Ky9nKVswXTtcbiAgICB2YXIgYXJncyAgICAgID0gX2V4cGxvZGVBcmdzKF9zdHJpcEN1cmxpZXMoY29tbWFuZC5tYXRjaCgvKFxceyhcXHcrLD8pK1xcfSkvZykpKTtcblxuICAgIGlmKGtleXdvcmQgIT09IHVuZGVmaW5lZCAmJiBfa2V5d29yZEZ1bmN0aW9uTWFwW2tleXdvcmRdICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgX2tleXdvcmRGdW5jdGlvbk1hcFtrZXl3b3JkXShhcmdzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzRmVybWlvbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIC8vIFwiRXhjaGFuZ2UgZmVybWlvblwiIDogZm1me3Bob3Rvbn17djEsdjJ9XG4gICAgLy8gaWYoYXJnc1sxXVswXVswXSA9PT0gJ3YnKSB7XG4gICAgICBcbiAgICAvLyB9XG5cbiAgICAvLyBcIkluIGZlcm1pb25cIiA6IGZtZntlbGVjdHJvbn17KmkxKix2MSxvMX1cbiAgICB2YXIgcGFydGljbGUgPSBfZ2V0UGFydGljbGUoYXJnc1swXVswXSwgYXJnc1sxXVswXSk7XG4gICAgc3RhZ2UucHJvcGFnYXRvcnMucHVzaChwYXJ0aWNsZSk7XG5cbiAgICAvLyBcIk91dCBmZXJtaW9uXCIgOiBmbWZ7ZWxlY3Ryb259e2kxLHYxLCpvMSp9XG4gICAgaWYoYXJnc1sxXVsyXSkge1xuICAgICAgdmFyIG91dFBhcnRpY2xlID0gX2dldFBhcnRpY2xlKGFyZ3NbMF1bMF0sIGFyZ3NbMV1bMl0pO1xuICAgICAgc3RhZ2UucHJvcGFnYXRvcnMucHVzaChvdXRQYXJ0aWNsZSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfcHJvY2Vzc1ZlcnRleCA9IGZ1bmN0aW9uKHBvcywgYXJncykge1xuXG4gICAgdmFyIGxvY2FsSWQgID0gc3RhZ2UudmVydGljZXNbcG9zXS5sZW5ndGggKyAxO1xuICAgIHZhciBnbG9iYWxJZCA9IF9nZXROdW1iZXJPZlZlcnRpY2VzKCkgKyAxO1xuICAgIHZhciB2ZXJ0ZXhJZCA9ICd2JyArIGdsb2JhbElkO1xuICAgIHZhciB2ZXJ0ZXggICA9IG5ldyBWZXJ0ZXgodmVydGV4SWQsIFsgcG9zLCBsb2NhbElkIF0sIFsgYXJnc1swXVswXSBdLCBbIGFyZ3NbMF1bMV0gXSk7XG5cbiAgICB2ZXJ0ZXgubW92ZShzdGFnZSk7XG5cbiAgICBzdGFnZS52ZXJ0aWNlc1twb3NdLnB1c2godmVydGV4KTtcbiAgfTtcblxuICB2YXIgX3Byb2Nlc3NSaWdodCA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIF9wcm9jZXNzVmVydGV4KCdyaWdodCcsIGFyZ3MpO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc0xlZnQgPSBmdW5jdGlvbihhcmdzKSB7XG5cbiAgICBfcHJvY2Vzc1ZlcnRleCgnbGVmdCcsIGFyZ3MpO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc1RvcCA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIF9wcm9jZXNzVmVydGV4KCd0b3AnLCBhcmdzKTtcbiAgfTtcblxuICB2YXIgX3Byb2Nlc3NCb3R0b20gPSBmdW5jdGlvbihhcmdzKSB7XG5cbiAgICBfcHJvY2Vzc1ZlcnRleCgnYm90dG9tJywgYXJncyk7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzRG90ID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgYXJnc1swXS5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleElkKSB7XG5cbiAgICAgIHZhciB2ZXJ0ZXggPSBzdGFnZS5nZXRWZXJ0ZXhCeUlkKHZlcnRleElkKTtcblxuICAgICAgaWYodmVydGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmVydGV4LnZpc2libGUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfc3RyaXBDdXJsaWVzID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgdmFyIHBhdHRlcm4gPSAvXFx7fFxcfS9nO1xuICAgIHZhciBlc2NhcGVkID0gW107XG5cbiAgICBlc2NhcGVkID0gYXJncy5tYXAoZnVuY3Rpb24oYXJnKSB7XG4gICAgICByZXR1cm4gYXJnLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGVzY2FwZWQ7XG4gIH07XG5cbiAgdmFyIF9leHBsb2RlQXJncyA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIHZhciBleHBsb2RlZEFyZ3MgPSBbXTtcblxuICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbihhcmcpIHtcbiAgICAgIHZhciBlID0gYXJnLnNwbGl0KCcsJyk7XG4gICAgICBleHBsb2RlZEFyZ3MucHVzaChlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBleHBsb2RlZEFyZ3M7XG4gIH07XG5cbiAgdmFyIF9nZXROdW1iZXJPZlZlcnRpY2VzID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc3VtID0gMDtcblxuICAgIGZvcih2YXIga2V5IGluIHN0YWdlLnZlcnRpY2VzKSB7XG4gICAgICBpZihzdGFnZS52ZXJ0aWNlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHN1bSArPSBzdGFnZS52ZXJ0aWNlc1trZXldLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3VtO1xuICB9O1xuXG4gIHZhciBfZ2V0UGFydGljbGUgPSBmdW5jdGlvbih0eXBlLCBpZCkge1xuXG4gICAgdmFyIHBhcnRpY2xlO1xuXG4gICAgc3dpdGNoKHR5cGUpIHtcblxuICAgICAgY2FzZSAnZWxlY3Ryb24nOlxuICAgICAgICBwYXJ0aWNsZSA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHsgaWQ6IGlkLCB0eXBlOiAnZS0nIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3F1YXJrJzpcbiAgICAgICAgcGFydGljbGUgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZSh7IGlkOiBpZCwgdHlwZTogJ3EnIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Bob3Rvbic6XG4gICAgICAgIHBhcnRpY2xlID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUoeyBpZDogaWQsIHR5cGU6ICdwaCcgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ2x1b24nOlxuICAgICAgICBwYXJ0aWNsZSA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHsgaWQ6IGlkLCB0eXBlOiAnZycgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcGFydGljbGUgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZSh7IGlkOiBpZCwgdHlwZTogJ2UtJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnRpY2xlO1xuICB9O1xuXG4gIHZhciBfa2V5d29yZEZ1bmN0aW9uTWFwID0ge1xuICAgICdmbWYnICAgICAgIDogX3Byb2Nlc3NGZXJtaW9uLFxuICAgICdmbWZyaWdodCcgIDogX3Byb2Nlc3NSaWdodCxcbiAgICAnZm1mbGVmdCcgICA6IF9wcm9jZXNzTGVmdCxcbiAgICAnZm1mdG9wJyAgICA6IF9wcm9jZXNzVG9wLFxuICAgICdmbWZib3R0b20nIDogX3Byb2Nlc3NCb3R0b20sXG4gICAgJ2ZtZmRvdCcgICAgOiBfcHJvY2Vzc0RvdFxuICB9O1xuXG4gIHJldHVybiBMYXRleFBhcnNlcjtcbn0pKCk7IiwidmFyIFN0YW5kYXJkUGFyc2VyID0gcmVxdWlyZSgnLi9TdGFuZGFyZFBhcnNlcicpO1xudmFyIExhdGV4UGFyc2VyICAgID0gcmVxdWlyZSgnLi9MYXRleFBhcnNlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXRQYXJzZXI6IGZ1bmN0aW9uKGxhbmcpIHtcblxuICAgIGlmKGxhbmcgPT09ICdsYXRleCcpIHtcbiAgICAgIHJldHVybiBuZXcgTGF0ZXhQYXJzZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTdGFuZGFyZFBhcnNlcigpO1xuICB9XG59OyIsInZhciBTdGFnZSAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vU3RhZ2UnKTtcbnZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vLi4vUGFydGljbGVHZW5lcmF0b3InKTtcbnZhciBWZXJ0ZXggICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vVmVydGV4Jyk7XG52YXIgRXhjaGFuZ2UgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL0V4Y2hhbmdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIFN0YW5kYXJkUGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBTdGFuZGFyZFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdGFnZSA9IG5ldyBTdGFnZSgpO1xuXG4gICAgX3NldFRpdGxlKHN0YWdlLCBkYXRhLnRpdGxlKTtcbiAgICBfc2V0TGF5b3V0KHN0YWdlLCBkYXRhLmxheW91dCk7XG4gICAgX3NldERpbWVuc2lvbihzdGFnZSwgZGF0YS53aWR0aCwgZGF0YS5oZWlnaHQpO1xuICAgIF9zZXRTaG93QXhlcyhzdGFnZSwgZGF0YS5zaG93QXhlcyk7XG4gICAgX3NldFByb3BhZ2F0b3JzKHN0YWdlLCBkYXRhLnByb3BhZ2F0b3JzKTtcbiAgICBfc2V0VmVydGljZXMoc3RhZ2UsIGRhdGEudmVydGljZXMpO1xuICAgIF9zZXRFeGNoYW5nZXMoc3RhZ2UsIGRhdGEuZXhjaGFuZ2VzKTtcblxuICAgIHJldHVybiBzdGFnZTtcbiAgfTtcblxuICB2YXIgX3NldFRpdGxlID0gZnVuY3Rpb24oc3RhZ2UsIHRpdGxlKSB7XG5cbiAgICBpZih0aXRsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS50aXRsZSA9IHRpdGxlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldExheW91dCA9IGZ1bmN0aW9uKHN0YWdlLCBsYXlvdXQpIHtcblxuICAgIGlmKGxheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5sYXlvdXQgPSBsYXlvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0RGltZW5zaW9uID0gZnVuY3Rpb24oc3RhZ2UsIHdpZHRoLCBoZWlnaHQpIHtcblxuICAgIGlmKHdpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLndpZHRoID0gd2lkdGg7XG4gICAgfVxuICAgIGlmKGhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0U2hvd0F4ZXMgPSBmdW5jdGlvbihzdGFnZSwgc2hvd0F4ZXMpIHtcblxuICAgIGlmKHNob3dBeGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnNob3dBeGVzID0gc2hvd0F4ZXM7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0UHJvcGFnYXRvcnMgPSBmdW5jdGlvbihzdGFnZSwgcHJvcGFnYXRvcnMpIHtcblxuICAgIGlmKHByb3BhZ2F0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBwcm9wYWdhdG9ycyEnKTtcbiAgICB9XG5cbiAgICBwcm9wYWdhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BhZ2F0b3JBdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciBwID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUocHJvcGFnYXRvckF0dHJpYnV0ZXMpO1xuXG4gICAgICBpZihwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhZ2UucHJvcGFnYXRvcnMucHVzaChwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX3NldFZlcnRpY2VzID0gZnVuY3Rpb24oc3RhZ2UsIHZlcnRpY2VzKSB7XG5cbiAgICBpZih2ZXJ0aWNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgdmVydGljZXMhJyk7XG4gICAgfVxuXG4gICAgdmVydGljZXMuZm9yRWFjaChmdW5jdGlvbih2ZXJ0ZXhBdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciB2ID0gbmV3IFZlcnRleCh2ZXJ0ZXhBdHRyaWJ1dGVzLmlkLCB2ZXJ0ZXhBdHRyaWJ1dGVzLnBvc2l0aW9uLCB2ZXJ0ZXhBdHRyaWJ1dGVzLmluYm91bmQsIHZlcnRleEF0dHJpYnV0ZXMub3V0Ym91bmQpO1xuXG4gICAgICBpZih2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3RhZ2UudmVydGljZXNbdmVydGV4QXR0cmlidXRlcy5wb3NpdGlvblswXV0ucHVzaCh2KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX3NldEV4Y2hhbmdlcyA9IGZ1bmN0aW9uKHN0YWdlLCBleGNoYW5nZXMpIHtcblxuICAgIGlmKGV4Y2hhbmdlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgZXhjaGFuZ2VzLmZvckVhY2goZnVuY3Rpb24oZXhjaGFuZ2VBdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciBlID0gbmV3IEV4Y2hhbmdlKGV4Y2hhbmdlQXR0cmlidXRlcy5pZCwgZXhjaGFuZ2VBdHRyaWJ1dGVzLmluYm91bmQsIGV4Y2hhbmdlQXR0cmlidXRlcy5vdXRib3VuZCwgZXhjaGFuZ2VBdHRyaWJ1dGVzLnBhcnRpY2xlcyk7XG5cbiAgICAgIGlmKGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdGFnZS5leGNoYW5nZXMucHVzaChlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gU3RhbmRhcmRQYXJzZXI7XG59KSgpOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBfY29sb3IgID0gJyMwMDAnO1xuICB2YXIgX2xlbmd0aCA9IDEwOTtcblxuICB2YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IGZ1bmN0aW9uKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBpZihpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgaWQgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgPSBpZDtcbiAgICB0aGlzLmFudGkgICA9IGFudGk7XG4gICAgdGhpcy5jb2xvciAgPSBjb2xvciAgfHwgX2NvbG9yO1xuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoIHx8IF9sZW5ndGg7XG4gICAgdGhpcy54ICAgICAgPSAwO1xuICAgIHRoaXMueSAgICAgID0gMDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEFic3RyYWN0UGFydGljbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNhbGwgYWJzdHJhY3QgbWV0aG9kIScpO1xuICB9O1xuXG4gIEFic3RyYWN0UGFydGljbGUucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbigpIHtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNhbGwgYWJzdHJhY3QgbWV0aG9kIScpO1xuICB9O1xuXG4gIHJldHVybiBBYnN0cmFjdFBhcnRpY2xlO1xuXG59KSgpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xudmFyIEJlemllciAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvQmV6aWVyJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKEVsZWN0cm9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIEVsZWN0cm9uKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBFbGVjdHJvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCBhbnRpIHx8IGZhbHNlLCBjb2xvciwgbGVuZ3RoXSk7XG4gIH1cblxuICBFbGVjdHJvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgY2FudmFzLnBhdGgodGhpcy5nZXRQYXRoKCdsaW5lJykpXG4gICAgICAgICAgLmZpbGwoJ25vbmUnKVxuICAgICAgICAgIC5zdHJva2UoeyB3aWR0aDogMSwgY29sb3I6IHRoaXMuY29sb3IgfSk7XG4gIH07XG5cbiAgRWxlY3Ryb24ucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbihzaGFwZSkge1xuXG4gICAgdmFyIHRpbGUgPSBbIFsxLCAxXSwgWzIsIDFdIF07XG4gICAgdmFyIGwgICAgPSAxO1xuXG4gICAgc3dpdGNoKHNoYXBlKSB7XG4gICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHRpbGUsIGwsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGNhc2UgJ2FyYyc6XG4gICAgICAgIHJldHVybiBCZXppZXIuYXJjKCdlbGVjdHJvbicsIHRpbGUsIGwsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGNhc2UgJ2xvb3AnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxvb3AoJ2VsZWN0cm9uJywgdGlsZSwgbCwgdGhpcy5sZW5ndGgpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHRpbGUsIGwsIHRoaXMubGVuZ3RoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIEVsZWN0cm9uO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcbnZhciBCZXppZXIgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0JlemllcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoR2x1b24sIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gR2x1b24oaWQsIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIEdsdW9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIHVuZGVmaW5lZCwgY29sb3IgfHwgJyMwMDk5MzMnLCBsZW5ndGggfHwgOTZdKTtcbiAgfVxuXG4gIEdsdW9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB2YXIgcGF0aCA9IHRoaXMuZ2V0UGF0aCgnYXJjJyk7XG4gICAgY2FudmFzLnBhdGgocGF0aCwgdHJ1ZSlcbiAgICAgIC5maWxsKCdub25lJylcbiAgICAgIC5zdHJva2UoeyB3aWR0aDogMSwgY29sb3I6IHRoaXMuY29sb3IgfSlcbiAgICAgIC50cmFuc2xhdGUoMTUwLCAxNTApO1xuICB9O1xuXG4gIEdsdW9uLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oc2hhcGUpIHtcblxuICAgIHZhciBnbHVvbiA9IHtcbiAgICAgIHdpZHRoICA6IDE1LCAgIC8vIHRoZSBjb2lsIHdpZHRoIG9mIGdsdW9uIHByb3BhZ2F0b3JzXG4gICAgICBoZWlnaHQgOiAxNSwgICAvLyB0aGUgY29pbCBoZWlnaHQgb2YgZ2x1b24gcHJvcGFnYXRvcnNcbiAgICAgIGZhY3RvciA6IDAuNzUsIC8vIHRoZSBmYWN0b3IgcGFyYW1ldGVyIGZvciBnbHVvbiBwcm9wYWdhdG9yc1xuICAgICAgcGVyY2VudDogMC42LCAgLy8gdGhlIHBlcmNlbnQgcGFyYW1ldGVyIGZvciBnbHVvbiBwcm9wYWdhdG9yc1xuICAgICAgc2NhbGUgIDogMS4xNSAgLy8gdGhlIHNjYWxlIHBhcmFtZXRlciBmb3IgZ2x1b24gYXJjcyBhbmQgbG9vcHNcbiAgICB9O1xuXG4gICAgdmFyIGthcHBhID0gMC41NTE5MTUwMjtcbiAgICAvLyBhIGFuZCBiIGFyZSBvbmUtaGFsZiBvZiB0aGUgZWxsaXBzZSdzIG1ham9yIGFuZCBtaW5vciBheGVzXG4gICAgdmFyIGEgICAgID0gZ2x1b24uaGVpZ2h0ICogZ2x1b24uZmFjdG9yO1xuICAgIHZhciBiICAgICA9IGdsdW9uLndpZHRoICAqIGdsdW9uLnBlcmNlbnQ7XG4gICAgLy8gYyBhbmQgZCBhcmUgb25lLWhhbGYgb2YgbWFqb3IgYW5kIG1pbm9yIGF4ZXMgb2YgdGhlIG90aGVyIGVsbGlwc2VcbiAgICB2YXIgYyAgICAgPSBnbHVvbi5oZWlnaHQgKiAoZ2x1b24uZmFjdG9yIC0gMC41KTtcbiAgICB2YXIgZCAgICAgPSBnbHVvbi53aWR0aCAgKiAoMSAtIGdsdW9uLnBlcmNlbnQpO1xuXG4gICAgdmFyIGRpciAgID0gZmFsc2U7XG4gICAgdmFyIHB0cyAgID0gKGRpclxuICAgICAgPyBbWzAsIDBdLCAnQSAnICsgYSArICcgJyArIGIsIDAsIDAsIDEsIFthLCBiXSxcbiAgICAgICAgICAgICAgICAgJ0EgJyArIGMgKyAnICcgKyBkLCAwLCAxLCAxLCBbYSAtIDIgKiBjLCBiXSxcbiAgICAgICAgICAgICAgICAgJ0EgJyArIGEgKyAnICcgKyBiLCAwLCAwLCAxXVxuICAgICAgOiBbWzAsIDBdLCAnQSAnICsgYSArICcgJyArIGIsIDAsIDAsIDAsIFthLCAtYl0sXG4gICAgICAgICAgICAgICAgICdBICcgKyBjICsgJyAnICsgZCwgMCwgMSwgMCwgW2EgLSAyICogYywgLWJdLFxuICAgICAgICAgICAgICAgICAnQSAnICsgYSArICcgJyArIGIsIDAsIDAsIDBdXG4gICAgKTtcblxuICAgIGEgPSAoZGlyID8gYSA6IGdsdW9uLnNjYWxlICogYSk7XG4gICAgdmFyIGxpZnQgPSBhIC8gTWF0aC5wb3codGhpcy5sZW5ndGgsIDAuNik7XG5cbiAgICB2YXIgdGlsZSA9IChkaXJcbiAgICAgID8gWydDJywgW2thcHBhICogYSwgbGlmdF0sIFthLCBiIC0ga2FwcGEgKiBiXSwgW2EsIGJdLFxuICAgICAgICAgJ0MnLCBbYSwgYiArIGthcHBhICogZF0sIFthIC0gYyArIGthcHBhICogYywgYiArIGRdLCBbYSAtIGMsIGIgKyBkXSxcbiAgICAgICAgICdTJywgW2EgLSAyICogYywgYiArIGthcHBhICogZF0sIFthIC0gMiAqIGMsIGJdLFxuICAgICAgICAgJ0MnLCBbYSAtIDIgKiBjLCBiIC0ga2FwcGEgKiBiXSwgWzIgKiAoYSAtIGMpIC0ga2FwcGEgKiBhLCAwXSwgWzIgKiAoYSAtIGMpLCAtbGlmdF1dXG4gICAgICA6IFsnQycsIFtrYXBwYSAqIGEsIGxpZnRdLCBbYSwgLWIgKyBrYXBwYSAqIGJdLCBbYSwgLWJdLFxuICAgICAgICAgJ0MnLCBbYSwgLWIgLSBrYXBwYSAqIGRdLCBbYSAtIGMgKyBrYXBwYSAqIGMsIC1iIC0gZF0sIFthIC0gYywgLWIgLSBkXSxcbiAgICAgICAgICdTJywgW2EgLSAyICogYywgLWIgLSBrYXBwYSAqIGRdLCBbYSAtIDIgKiBjLCAtYl0sXG4gICAgICAgICAnQycsIFthIC0gMiAqIGMsIC1iICsga2FwcGEgKiBiXSwgWzIgKiAoYSAtIGMpIC0ga2FwcGEgKiBhLCAwXSwgWzIgKiAoYSAtIGMpLCAtbGlmdF1dXG4gICAgKTtcblxuICAgIHN3aXRjaChzaGFwZSkge1xuICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZShwdHMsIGdsdW9uLmhlaWdodCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnYXJjJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5hcmMoJ2dsdW9uJywgdGlsZSwgYSAtIGMsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGNhc2UgJ2xvb3AnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxvb3AoJ2dsdW9uJywgdGlsZSwgYSAtIGMsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZShwdHMsIGdsdW9uLmhlaWdodCwgdGhpcy5sZW5ndGgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gR2x1b247XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xudmFyIEJlemllciAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvQmV6aWVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhQaG90b24sIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gUGhvdG9uKGlkLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBQaG90b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgdW5kZWZpbmVkLCBjb2xvciB8fCAnIzAwNjZGRicsIGxlbmd0aCB8fCAxMDldKTtcbiAgfVxuXG4gIFBob3Rvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdmFyIHBhdGggPSB0aGlzLmdldFBhdGgoJ2xpbmUnKTtcbiAgICBjYW52YXMucGF0aChwYXRoLCB0cnVlKVxuICAgICAgICAgIC5maWxsKCdub25lJylcbiAgICAgICAgICAuc3Ryb2tlKHsgd2lkdGg6IDEsIGNvbG9yOiB0aGlzLmNvbG9yIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHByb3hpbWF0aW9uIG9mIHRoZSBmaXJzdCBxdWFydGVyIG9mIG9uZSBwZXJpb2Qgb2YgYSBzaW5lIGN1cnZlXG4gICAqIGlzIGEgY3ViaWMgQmV6aWVyIGN1cnZlIHdpdGggdGhlIGZvbGxvd2luZyBjb250cm9sIHBvaW50czpcbiAgICpcbiAgICogKDAsIDApIChsYW1iZGEgKiBwIC8gUEksIGxhbWJkYSAqIGEgLyAyKSAoMiAqIHAgLyBQSSwgYSkgKHAsIGEpXG4gICAqXG4gICAqIFJlZmVyZW5jZXM6XG4gICAqXG4gICAqIFsxXSBodHRwOi8vbWF0aGIuaW4vMTQ0N1xuICAgKiBbMl0gaHR0cHM6Ly9naXRodWIuY29tL3Bob3Rpbm8vanF1ZXJ5LWZleW4vYmxvYi9tYXN0ZXIvanMvanF1ZXJ5LmZleW4tMS4wLjEuanNcbiAgICpcbiAgICogQHBhcmFtIHNoYXBlXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgUGhvdG9uLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oc2hhcGUpIHtcblxuICAgIHZhciBQSSAgICAgPSBNYXRoLlBJO1xuICAgIHZhciBsYW1iZGEgPSAwLjUxMTI4NzMzO1xuICAgIHZhciBhICAgICAgPSA1O1xuICAgIHZhciBiICAgICAgPSAwLjUgKiBsYW1iZGEgKiBhO1xuICAgIHZhciBwICAgICAgPSA1O1xuICAgIHZhciBxICAgICAgPSAyICogcCAvIFBJO1xuICAgIHZhciB0ICAgICAgPSBsYW1iZGEgKiBwIC8gUEk7XG4gICAgdmFyIGRpciAgICA9IGZhbHNlO1xuXG4gICAgdmFyIHB0cyA9IChkaXJcbiAgICAgID8gW1swLCAwXSwgJ0MnLCBbdCwgLWJdLCBbcSwgLWFdLCBbcCwgLWFdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwLCAwXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbMiAqIHAgKyBxLCBhXSwgWzMgKiBwLCBhXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbNCAqIHAgLSB0LCBiXV1cbiAgICAgIDogW1swLCAwXSwgJ0MnLCBbdCwgYl0sIFtxLCBhXSwgW3AsIGFdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCAtIHQsIGJdLCBbMiAqIHAsIDBdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCArIHEsIC1hXSwgWzMgKiBwLCAtYV0sXG4gICAgICAgICAgICAgICAgICdTJywgWzQgKiBwIC0gdCwgLWJdXVxuICAgICk7XG5cbiAgICB2YXIgdGlsZSA9IChkaXJcbiAgICAgID8gW1snQycsIFt0LCAtYl0sIFtxLCAtYV0sIFtwLCAtYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCAtYl0sIFsyICogcCArIDAuNSwgMF1dLFxuICAgICAgICAgWydDJywgW3QsIGJdLCBbcSwgYV0sIFtwLCBhXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwIC0gMC41LCAwXV1dXG4gICAgICA6IFtbJ0MnLCBbdCwgYl0sIFtxLCBhXSwgW3AsIGFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgYl0sIFsyICogcCAtIDAuNSwgMF1dLFxuICAgICAgICAgWydDJywgW3QsIC1iXSwgW3EsIC1hXSwgW3AsIC1hXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwICsgMC41LCAwXV1dXG4gICAgKTtcblxuICAgIHN3aXRjaChzaGFwZSkge1xuICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZShwdHMsIDQgKiBwLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdhcmMnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmFyYygncGhvdG9uJywgdGlsZSwgcCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnbG9vcCc6XG4gICAgICAgIHJldHVybiBCZXppZXIubG9vcCgncGhvdG9uJywgdGlsZSwgcCwgdGhpcy5sZW5ndGgpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgNCAqIHAsIHRoaXMubGVuZ3RoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFBob3RvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhRdWFyaywgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBRdWFyayhpZCwgYW50aSwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgUXVhcmsuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgYW50aSB8fCBmYWxzZSwgY29sb3IsIGxlbmd0aF0pO1xuICB9XG5cbiAgUXVhcmsucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICB9O1xuXG4gIFF1YXJrLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cbiAgcmV0dXJuIFF1YXJrO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiXX0=
(7)
});
;