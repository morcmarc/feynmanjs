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

    stage.canvas
         .circle(3)
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9FeGNoYW5nZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1BhcnRpY2xlR2VuZXJhdG9yLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvU3RhZ2UuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9WZXJ0ZXguanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9oZWxwZXJzL0Jlemllci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2hlbHBlcnMvS2xhc3MuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvTGF0ZXhQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1BhcnNlckZhY3RvcnkuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvQWJzdHJhY3RQYXJ0aWNsZS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL0VsZWN0cm9uLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvR2x1b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9QaG90b24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9RdWFyay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFBhcnRpY2xlR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9QYXJ0aWNsZUdlbmVyYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgRXhjaGFuZ2UgPSBmdW5jdGlvbihpZCwgaW5ib3VuZCwgb3V0Ym91bmQsIHBhcnRpY2xlcykge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgPT09IHVuZGVmaW5lZCB8fCBvdXRib3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4Y2hhbmdlIG11c3QgaGF2ZSBib3RoIGFuIGluYm91bmQgYW5kIG91dGJvdW5kIGF0dHJpYnV0ZSEnKTtcbiAgICB9XG5cbiAgICBpZihwYXJ0aWNsZXMgPT09IHVuZGVmaW5lZCB8fCBwYXJ0aWNsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHBhcnRpY2xlcyBnaXZlbiEnKTtcbiAgICB9XG5cbiAgICB0aGlzLmlkICAgICAgICA9IGlkO1xuICAgIHRoaXMuaW5ib3VuZCAgID0gaW5ib3VuZDtcbiAgICB0aGlzLm91dGJvdW5kICA9IG91dGJvdW5kO1xuICAgIHRoaXMucGFydGljbGVzID0gW107XG5cbiAgICBfY3JlYXRlRXhjaGFuZ2VQYXJ0aWNsZXModGhpcywgcGFydGljbGVzKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV4Y2hhbmdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB0aGlzLnBhcnRpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRpY2xlKSB7XG4gICAgICBwYXJ0aWNsZS5kcmF3KGNhbnZhcyk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9jcmVhdGVFeGNoYW5nZVBhcnRpY2xlcyA9IGZ1bmN0aW9uKGN0eCwgcGFydGljbGVzKSB7XG5cbiAgICBwYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZUF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIHAgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZShwYXJ0aWNsZUF0dHJpYnV0ZXMpO1xuXG4gICAgICBpZihwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY3R4LnBhcnRpY2xlcy5wdXNoKHApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBFeGNoYW5nZTtcbn0pKCk7IiwidmFyIEVsZWN0cm9uID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9FbGVjdHJvbicpO1xudmFyIFF1YXJrICAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9RdWFyaycpO1xudmFyIEdsdW9uICAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9HbHVvbicpO1xudmFyIFBob3RvbiAgID0gcmVxdWlyZSgnLi9wcm9wYWdhdG9ycy9QaG90b24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgZ2V0UGFydGljbGU6IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZS0nKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZWN0cm9uKGRhdGEuaWQsIGZhbHNlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZSsnKSB7XG4gICAgICByZXR1cm4gbmV3IEVsZWN0cm9uKGRhdGEuaWQsIHRydWUsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdxJykge1xuICAgICAgcmV0dXJuIG5ldyBRdWFyayhkYXRhLmlkLCBmYWxzZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ2FxJykge1xuICAgICAgcmV0dXJuIG5ldyBRdWFyayhkYXRhLmlkLCB0cnVlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnZycpIHtcbiAgICAgIHJldHVybiBuZXcgR2x1b24oZGF0YS5pZCwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ3BoJykge1xuICAgICAgcmV0dXJuIG5ldyBQaG90b24oZGF0YS5pZCwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgU3RhZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIEdlbmVyaWMgQXR0cmlidXRlcyAob3B0aW9uYWwpXG4gICAgdGhpcy50aXRsZSAgICA9ICdGZXlubWFuJztcbiAgICB0aGlzLmxheW91dCAgID0gJ3RpbWUtc3BhY2UnO1xuICAgIHRoaXMud2lkdGggICAgPSAxMDA7XG4gICAgdGhpcy5oZWlnaHQgICA9IDEwMDtcbiAgICB0aGlzLnNob3dBeGVzID0gdHJ1ZTtcblxuICAgIC8vIE1haW4gcHJvcGVydGllcyAocmVxdWlyZWQpXG4gICAgdGhpcy5wcm9wYWdhdG9ycyA9IFtdO1xuICAgIHRoaXMudmVydGljZXMgICAgPSB7XG4gICAgICBsZWZ0ICAgOiBbXSxcbiAgICAgIHJpZ2h0ICA6IFtdLFxuICAgICAgdG9wICAgIDogW10sXG4gICAgICBib3R0b20gOiBbXVxuICAgIH07XG5cbiAgICAvLyBNYWluIHByb3BlcnRpZXMgKG9wdGlvbmFsKVxuICAgIHRoaXMuZXhjaGFuZ2VzICAgPSBbXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5nZXRWZXJ0ZXhCeUlkID0gZnVuY3Rpb24oaWQpIHtcblxuICAgIHZhciByZXN1bHQgPSB1bmRlZmluZWQ7XG5cbiAgICBmb3IodmFyIGtleSBpbiB0aGlzLnZlcnRpY2VzKSB7XG4gICAgICBpZih0aGlzLnZlcnRpY2VzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgdGhpcy52ZXJ0aWNlc1trZXldLmZvckVhY2goZnVuY3Rpb24odmVydGV4KSB7XG4gICAgICAgICAgaWYodmVydGV4LmlkID09PSBpZCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdmVydGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBTdGFnZS5wcm90b3R5cGUuc2V0Q2FudmFzID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICB0aGlzLmNhbnZhcy5zaXplKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKSB7XG5cbiAgICBfZHJhd1RpdGxlKHRoaXMpO1xuICAgIF9kcmF3VmVydGljZXModGhpcyk7XG4gICAgX2RyYXdQcm9wYWdhdG9ycyh0aGlzKTtcbiAgICBfZHJhd0V4Y2hhbmdlcyh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgX2RyYXdUaXRsZSA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgY3R4LmNhbnZhcy50ZXh0KGN0eC50aXRsZSkuZm9udCh7XG4gICAgICBmYW1pbHkgOiAnR2VvcmdpYScsXG4gICAgICBzaXplICAgOiAgMTQsXG4gICAgICBzdHlsZSAgOiAnaXRhbGljJyxcbiAgICAgIGFuY2hvciA6ICdsZWZ0J1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZHJhd1ZlcnRpY2VzID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBmb3IodmFyIGtleSBpbiBjdHgudmVydGljZXMpIHtcbiAgICAgIGlmKGN0eC52ZXJ0aWNlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGN0eC52ZXJ0aWNlc1trZXldLmZvckVhY2goZnVuY3Rpb24odmVydGV4KSB7XG4gICAgICAgICAgdmVydGV4LmRyYXcoY3R4KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBfZHJhd1Byb3BhZ2F0b3JzID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHgucHJvcGFnYXRvcnMuZm9yRWFjaChmdW5jdGlvbihwYXJ0aWNsZSkge1xuICAgICAgcGFydGljbGUuZHJhdyhjdHguY2FudmFzKTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX2RyYXdFeGNoYW5nZXMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC5leGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbihleGNoYW5nZSkge1xuICAgICAgZXhjaGFuZ2UuZHJhdyhjdHguY2FudmFzKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gU3RhZ2U7XG59KSgpOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBWZXJ0ZXggPSBmdW5jdGlvbihpZCwgcG9zaXRpb24sIGluYm91bmQsIG91dGJvdW5kKSB7XG5cbiAgICBpZihpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgaWQgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgaWYocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHBvc2l0aW9uIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIGlmKGluYm91bmQgPT09IHVuZGVmaW5lZCAmJiBvdXRib3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgaWYoaW5ib3VuZCAhPT0gdW5kZWZpbmVkICYmIGluYm91bmQubGVuZ3RoID09PSAwICYmIG91dGJvdW5kICE9PSB1bmRlZmluZWQgJiYgb3V0Ym91bmQubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZlcnRpY2VzIG11c3QgaGF2ZSBlaXRoZXIgYW4gaW5ib3VuZCBvciBvdXRib3VuZCBhdHRyaWJ1dGUhJyk7XG4gICAgfVxuXG4gICAgdGhpcy5pZCAgICAgICA9IGlkO1xuICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLmluYm91bmQgID0gaW5ib3VuZCAgfHwgW107XG4gICAgdGhpcy5vdXRib3VuZCA9IG91dGJvdW5kIHx8IFtdO1xuICAgIHRoaXMueCAgICAgICAgPSAwO1xuICAgIHRoaXMueSAgICAgICAgPSAwO1xuICAgIHRoaXMudmlzaWJsZSAgPSBmYWxzZTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFZlcnRleC5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHN0YWdlKSB7XG5cbiAgICB2YXIgY29vcmRzICAgID0gX2dldFZlcnRleENvb3JkaW5hdGVzKHRoaXMsIHN0YWdlKTtcbiAgICB0aGlzLnggICAgICAgID0gY29vcmRzWzBdO1xuICAgIHRoaXMueSAgICAgICAgPSBjb29yZHNbMV07XG4gIH07XG5cbiAgVmVydGV4LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oc3RhZ2UpIHtcblxuICAgIGlmKCF0aGlzLnZpc2libGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm1vdmUoc3RhZ2UpO1xuXG4gICAgc3RhZ2UuY2FudmFzXG4gICAgICAgICAuY2lyY2xlKDMpXG4gICAgICAgICAuZmlsbCh7IGNvbG9yOiAnIzAwMCcgfSlcbiAgICAgICAgIC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpO1xuICB9O1xuXG4gIHZhciBfZ2V0VmVydGV4Q29vcmRpbmF0ZXMgPSBmdW5jdGlvbih2ZXJ0ZXgsIHN0YWdlKSB7XG5cbiAgICB2YXIgd1VuaXQgPSBNYXRoLmZsb29yKHN0YWdlLndpZHRoICAvIDQpO1xuICAgIHZhciBoVW5pdCA9IE1hdGguZmxvb3Ioc3RhZ2UuaGVpZ2h0IC8gNCk7XG5cbiAgICB2YXIgeCA9IDA7XG4gICAgdmFyIHkgPSAwO1xuXG4gICAgc3dpdGNoKHZlcnRleC5wb3NpdGlvblswXSkge1xuICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgIHggPSB3VW5pdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgIHggPSB3VW5pdCAqIDM7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHkgPSB2ZXJ0ZXgucG9zaXRpb25bMV0gKiBoVW5pdDtcblxuICAgIHJldHVybiBbeCwgeV07XG4gIH07XG5cbiAgcmV0dXJuIFZlcnRleDtcbn0pKCk7IiwidmFyIFBJICAgICAgPSBNYXRoLlBJO1xudmFyIGlzQXJyYXkgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBub3JtYWxpemVQYXRoU3RyaW5nOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzdHIgPSAnJztcblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIGl0ZW0gPSBhcmd1bWVudHNbaV07XG4gICAgICBzdHIgKz0gJyAnICsgKHR5cGVvZiBpdGVtICE9PSAnbnVtYmVyJyA/XG4gICAgICAgIGl0ZW0gOlxuICAgICAgICBpdGVtLnRvRml4ZWQoMykucmVwbGFjZSgvKC5cXGQqPykwKyQvLCAnJDEnKS5yZXBsYWNlKC9cXC4kLywgJycpXG4gICAgICApO1xuICAgIH1cbiAgICB2YXIgdHJpbW1lZCA9IHN0ci50cmltKCk7XG5cbiAgICByZXR1cm4gdHJpbW1lZC5yZXBsYWNlKC8gPywgPy9nLCAnLCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgY29vcmRpbmF0ZXMgb2YgYSBnaXZlbiBwb2ludCBpbiByZWZlcmVuY2UgdG8gYSBnaXZlbiBCZXppZXIgY3VydmUgc2VnbWVudFxuICAgKlxuICAgKiBAcGFyYW0gc3ggU3RhcnQgb2Ygc2VnbWVudCBYXG4gICAqIEBwYXJhbSBzeSBTdGFydCBvZiBzZWdtZW50IFlcbiAgICogQHBhcmFtIGV4IEVuZCBvZiBzZWdtZW50IFhcbiAgICogQHBhcmFtIGV5IEVuZCBvZiBzZWdtZW50IFlcbiAgICogQHBhcmFtIHggIFBvaW50IHRvIGZpdCBYXG4gICAqIEBwYXJhbSB5ICBQb2ludCB0byBmaXQgWVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldENvb3JkaW5hdGVzSW5CZXppZXI6IGZ1bmN0aW9uKHN4LCBzeSwgZXgsIGV5LCB4LCB5KSB7XG5cbiAgICB2YXIgYW5nID0gTWF0aC5hdGFuMihleSAtIHN5LCBleCAtIHN4KTtcblxuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVBhdGhTdHJpbmcoeCAqIE1hdGguY29zKGFuZykgLSB5ICogTWF0aC5zaW4oYW5nKSArIHN4LCAnLCcsIHggKiBNYXRoLnNpbihhbmcpICsgeSAqIE1hdGguY29zKGFuZykgKyBzeSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIDEvNCBwZXJpb2QgbG9uZyBCZXppZXIgc3BsaW5lIChDKSBvbnRvIGFuIChMbCkgbG9uZyBzdHJhaWdodCBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgIEN1cnZlIHNlZ21lbnRcbiAgICogQHBhcmFtIHBlcmlvZCAgICAgKExwKSBMZW5ndGggb2YgYSBxdWFydGVyIHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTGwpIExlbmd0aCBvZiBwcm9wYWdhdG9yXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBsaW5lOiBmdW5jdGlvbih0aWxlLCBwZXJpb2QsIGxlbmd0aCkge1xuXG4gICAgdmFyIGJlemllciA9IFsnTSddO1xuICAgIHZhciBudW0gICAgPSBNYXRoLmZsb29yKGxlbmd0aCAvIHBlcmlvZCk7XG4gICAgdmFyIGV4dHJhICA9IGxlbmd0aCAtIHBlcmlvZCAqIG51bSArIDAuMTtcblxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gbnVtOyBuKyspIHtcblxuICAgICAgZm9yKHZhciBpID0gMCwgbCA9IHRpbGUubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgICAgaXRlbSA9IHRpbGVbaV07XG5cbiAgICAgICAgaWYoaXNBcnJheShpdGVtKSkge1xuXG4gICAgICAgICAgaWYobiA8IG51bSB8fCBpdGVtWzBdIDwgZXh0cmEpIHtcbiAgICAgICAgICAgIGJlemllci5wdXNoKHRoaXMubm9ybWFsaXplUGF0aFN0cmluZyhpdGVtWzBdICsgcGVyaW9kICogbiwgJywnLCBpdGVtWzFdKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZXppZXIucHVzaChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXppZXIuam9pbignICcpLnJlcGxhY2UoL1xcc1tBLVpdW15BLVpdKiQvLCAnJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIHF1YXJ0ZXIgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGxvbmcgYXJjLlxuICAgKlxuICAgKiBAcGFyYW0gcGFydGljbGUgICBUeXBlIG9mIHBhcnRpY2xlLCBlLmcuOiBcInBob3RvblwiXG4gICAqIEBwYXJhbSB0aWxlICAgICAgIChDKSAgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTHApIExlbmd0aCBvZiBhIDEvNCBwZXJpb2RcbiAgICogQHBhcmFtIGxlbmd0aCAgICAgKExsKSBMZW5ndGhcbiAgICogQHJldHVybnMge3N0cmluZ30gU1ZHIHBhdGhcbiAgICovXG4gIGFyYzogZnVuY3Rpb24ocGFydGljbGUsIHRpbGUsIHBlcmlvZCwgbGVuZ3RoKSB7XG5cbiAgICB2YXIgdGVuc2lvbiA9IDI7XG4gICAgdmFyIHQgICAgICAgPSAwLjI1ICogTWF0aC5tYXgodGVuc2lvbiwgMik7XG4gICAgdmFyIHBoaSAgICAgPSBNYXRoLmFjb3MoLTAuNSAvIHQpO1xuICAgIHZhciB0aGV0YSAgID0gLTIgKiBNYXRoLmFzaW4ocGVyaW9kIC8gKHQgKiBsZW5ndGgpKTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBiZXppZXIgID0gWydNJywgJzAsMCddO1xuXG4gICAgLy8gZ2V0IGNvb3JkaW5hdGUgcGFpcnMgZm9yIHRoZSBlbmRwb2ludCBvZiBzZWdtZW50XG4gICAgZm9yKHZhciBuID0gMDsgbiA8PSAoUEkgLSAyICogcGhpKSAvIHRoZXRhOyBuKyspIHtcbiAgICAgIHNlZ21lbnQucHVzaChbbGVuZ3RoICogKHQgKiBNYXRoLmNvcyh0aGV0YSAqIG4gKyBwaGkpICsgMC41KSwgbGVuZ3RoICogKHQgKiBNYXRoLnNpbih0aGV0YSAqIG4gKyBwaGkpIC0gTWF0aC5zcXJ0KHQgKiB0IC0gMC4yNSkpXSk7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMCwgbCA9IHNlZ21lbnQubGVuZ3RoIC0gMSwgbW9kZWw7IGkgPCBsOyBpKyspIHtcblxuICAgICAgbW9kZWwgPSAocGFydGljbGUgPT09ICdwaG90b24nID8gdGlsZVtpICUgMl0gOiB0aWxlKTtcblxuICAgICAgZm9yKHZhciBqID0gMCwgbSA9IG1vZGVsLmxlbmd0aCwgaXRlbTsgaiA8IG07IGorKykge1xuICAgICAgICBpdGVtID0gbW9kZWxbal07XG4gICAgICAgIGJlemllci5wdXNoKGlzQXJyYXkoaXRlbSlcbiAgICAgICAgICA/IHRoaXMuZ2V0Q29vcmRpbmF0ZXNJbkJlemllcihzZWdtZW50W2ldWzBdLCBzZWdtZW50W2ldWzFdLCBzZWdtZW50W2krMV1bMF0sIHNlZ21lbnRbaSsxXVsxXSwgaXRlbVswXSwgaXRlbVsxXSlcbiAgICAgICAgICA6IGl0ZW1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmV6aWVyLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHNbQS1aXSQvLCAnJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIHF1YXJ0ZXIgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGRpYW1ldGVyIGNpcmNsZS5cbiAgICpcbiAgICogQHBhcmFtIHBhcnRpY2xlICAgVHlwZSBvZiBwYXJ0aWNsZSwgZS5nLjogXCJwaG90b25cIlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTikgTGVuZ3RoIG9mIGEgMS80IHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTCkgTGVuZ3RoXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBsb29wOiBmdW5jdGlvbihwYXJ0aWNsZSwgdGlsZSwgcGVyaW9kLCBsZW5ndGgpIHtcblxuICAgIHZhciBjdyAgICAgID0gdHJ1ZTtcbiAgICB2YXIgdGhldGEgICA9IDIgKiBNYXRoLmFzaW4oMiAqIHBlcmlvZCAvIGxlbmd0aCk7XG4gICAgdmFyIG51bSAgICAgPSAyICogUEkgLyB0aGV0YTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBsaWZ0ICAgID0gKGN3ID8gLTAuNSA6IDAuNSk7XG4gICAgdmFyIGJlemllciAgPSBbJ00nLCAocGFydGljbGUgPT09ICdnbHVvbicgPyBsaWZ0ICsgJywwJyA6ICcwLCcgKyBsaWZ0KV07XG5cbiAgICAvLyBmaW5kIHRoZSBtb2RpZmllZCBkaXN0YW5jZSBzdWNoIHRoYXQgdGhlIG51bWJlciBvZiB0aWxlcyBpcyBhbiBpbnRlZ2VyXG4gICAgZm9yKHZhciB4ID0gLTAuMSwgZGlzID0gbGVuZ3RoOyBNYXRoLmZsb29yKG51bSkgJSA0IHx8IG51bSAtIE1hdGguZmxvb3IobnVtKSA+IDAuMTsgeCArPSAwLjAwMSkge1xuXG4gICAgICBsZW5ndGggPSAoMSArIHgpICogZGlzO1xuICAgICAgdGhldGEgID0gMiAqIE1hdGguYXNpbigyICogcGVyaW9kIC8gbGVuZ3RoKTtcbiAgICAgIG51bSAgICA9IDIgKiBQSSAvIHRoZXRhO1xuICAgIH1cblxuICAgIC8vIGdldCBjb29yZGluYXRlIHBhaXJzIGZvciB0aGUgZW5kcG9pbnQgb2Ygc2VnbWVudFxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gbnVtOyBuKyspIHtcblxuICAgICAgdmFyIHN4ID0gMC41ICogbGVuZ3RoICogKDEgLSBNYXRoLmNvcyh0aGV0YSAqIG4pKTtcbiAgICAgIHZhciBzeSA9IDAuNSAqIGxlbmd0aCAqIE1hdGguc2luKHRoZXRhICogbik7XG4gICAgICBzZWdtZW50LnB1c2goW3N4LCBzeV0pO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBzZWdtZW50Lmxlbmd0aCAtIDEsIG1vZGVsOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIC8vIHR3byBwaG90b24gdGlsZXMgZm9ybSBhIHBlcmlvZCB3aGVyZWFzIG9uZSBnbHVvbiB0aWxlIGlzIGEgcGVyaW9kXG4gICAgICBtb2RlbCA9IChwYXJ0aWNsZSA9PT0gJ3Bob3RvbicgPyB0aWxlW2kgJSAyXSA6IHRpbGUpO1xuXG4gICAgICAvLyBnZXQgYmV6aWVyIHBhdGggZm9yIHBob3RvbiBhbmQgZ2x1b24gYXJjXG4gICAgICBmb3IodmFyIGogPSAwLCBtID0gbW9kZWwubGVuZ3RoLCBpdGVtOyBqIDwgbTsgaisrKSB7XG5cbiAgICAgICAgaXRlbSA9IG1vZGVsW2pdO1xuICAgICAgICBiZXppZXIucHVzaChpc0FycmF5KGl0ZW0pXG4gICAgICAgICAgPyB0aGlzLmdldENvb3JkaW5hdGVzSW5CZXppZXIoc2VnbWVudFtpXVswXSwgc2VnbWVudFtpXVsxXSwgc2VnbWVudFtpKzFdWzBdLCBzZWdtZW50W2krMV1bMV0sIGl0ZW1bMF0sIGl0ZW1bMV0pXG4gICAgICAgICAgOiBpdGVtXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlemllci5qb2luKCcgJykucmVwbGFjZSgvXFxzW0EtWl0kLywgJycpICsgJyBaJztcbiAgfVxufTsiLCJ2YXIgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBfX2V4dGVuZHM6IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9XG59OyIsInZhciBQYXJzZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9wYXJzZXJzL1BhcnNlckZhY3RvcnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEZleW5tYW4gPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEcmF3IGRpYWdyYW0gb250byBjYW52YXMuXG4gICAqIEBwYXJhbSBjYW52YXMgSWQgb2YgY2FudmFzIGVsZW1lbnRcbiAgICogQHBhcmFtIGRhdGEgICBEaWFncmFtIHByb3BlcnRpZXNcbiAgICovXG4gIEZleW5tYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMsIGRhdGEpIHtcblxuICAgIGlmICh0eXBlb2YgY2FudmFzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNhbnZhcyNpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3ZnQ2FudmFzICA9IG5ldyBTVkcoY2FudmFzKTtcbiAgICB2YXIgcGFyc2VyICAgICA9IFBhcnNlckZhY3RvcnkuZ2V0UGFyc2VyKGRhdGEubGFuZyk7XG4gICAgdmFyIHN0YWdlICAgICAgPSBwYXJzZXIucGFyc2UoZGF0YSk7XG5cbiAgICBzdGFnZS5zZXRDYW52YXMoc3ZnQ2FudmFzKS5kcmF3KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB3aW5kb3cuRmV5bm1hbiA9IEZleW5tYW47XG5cbiAgcmV0dXJuIEZleW5tYW47XG59KSgpOyIsInZhciBTdGFnZSAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vU3RhZ2UnKTtcbnZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vLi4vUGFydGljbGVHZW5lcmF0b3InKTtcbnZhciBWZXJ0ZXggICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vVmVydGV4Jyk7XG52YXIgRXhjaGFuZ2UgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL0V4Y2hhbmdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBzdGFnZSA9IG5ldyBTdGFnZSgpO1xuXG4gIHZhciBMYXRleFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTGF0ZXhQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBzdGFnZSAgICAgICAgPSBuZXcgU3RhZ2UoKTtcbiAgICBzdGFnZS50aXRsZSAgPSBkYXRhLnRpdGxlO1xuICAgIHN0YWdlLndpZHRoICA9IGRhdGEud2lkdGg7XG4gICAgc3RhZ2UuaGVpZ2h0ID0gZGF0YS5oZWlnaHQ7XG5cbiAgICBkYXRhLmRpYWdyYW0uZm9yRWFjaChmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICBfcHJvY2Vzc0NvbW1hbmQoY29tbWFuZCk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXR1cm4gc3RhZ2U7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzQ29tbWFuZCA9IGZ1bmN0aW9uKGNvbW1hbmQpIHtcblxuICAgIHZhciBrZXl3b3JkICAgPSBjb21tYW5kLm1hdGNoKC9cXHcrL2cpWzBdO1xuICAgIHZhciBhcmdzICAgICAgPSBfZXhwbG9kZUFyZ3MoX3N0cmlwQ3VybGllcyhjb21tYW5kLm1hdGNoKC8oXFx7KFxcdyssPykrXFx9KS9nKSkpO1xuXG4gICAgaWYoa2V5d29yZCAhPT0gdW5kZWZpbmVkICYmIF9rZXl3b3JkRnVuY3Rpb25NYXBba2V5d29yZF0gIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICBfa2V5d29yZEZ1bmN0aW9uTWFwW2tleXdvcmRdKGFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3Byb2Nlc3NGZXJtaW9uID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgLy8gXCJFeGNoYW5nZSBmZXJtaW9uXCIgOiBmbWZ7cGhvdG9ufXt2MSx2Mn1cbiAgICAvLyBpZihhcmdzWzFdWzBdWzBdID09PSAndicpIHtcbiAgICAgIFxuICAgIC8vIH1cblxuICAgIC8vIFwiSW4gZmVybWlvblwiIDogZm1me2VsZWN0cm9ufXsqaTEqLHYxLG8xfVxuICAgIHZhciBwYXJ0aWNsZSA9IF9nZXRQYXJ0aWNsZShhcmdzWzBdWzBdLCBhcmdzWzFdWzBdKTtcbiAgICBzdGFnZS5wcm9wYWdhdG9ycy5wdXNoKHBhcnRpY2xlKTtcblxuICAgIC8vIFwiT3V0IGZlcm1pb25cIiA6IGZtZntlbGVjdHJvbn17aTEsdjEsKm8xKn1cbiAgICBpZihhcmdzWzFdWzJdKSB7XG4gICAgICB2YXIgb3V0UGFydGljbGUgPSBfZ2V0UGFydGljbGUoYXJnc1swXVswXSwgYXJnc1sxXVsyXSk7XG4gICAgICBzdGFnZS5wcm9wYWdhdG9ycy5wdXNoKG91dFBhcnRpY2xlKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzVmVydGV4ID0gZnVuY3Rpb24ocG9zLCBhcmdzKSB7XG5cbiAgICB2YXIgbG9jYWxJZCAgPSBzdGFnZS52ZXJ0aWNlc1twb3NdLmxlbmd0aCArIDE7XG4gICAgdmFyIGdsb2JhbElkID0gX2dldE51bWJlck9mVmVydGljZXMoKSArIDE7XG4gICAgdmFyIHZlcnRleElkID0gJ3YnICsgZ2xvYmFsSWQ7XG4gICAgdmFyIHZlcnRleCAgID0gbmV3IFZlcnRleCh2ZXJ0ZXhJZCwgWyBwb3MsIGxvY2FsSWQgXSwgWyBhcmdzWzBdWzBdIF0sIFsgYXJnc1swXVsxXSBdKTtcblxuICAgIHZlcnRleC5tb3ZlKHN0YWdlKTtcblxuICAgIHN0YWdlLnZlcnRpY2VzW3Bvc10ucHVzaCh2ZXJ0ZXgpO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc1JpZ2h0ID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgX3Byb2Nlc3NWZXJ0ZXgoJ3JpZ2h0JywgYXJncyk7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzTGVmdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIF9wcm9jZXNzVmVydGV4KCdsZWZ0JywgYXJncyk7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzVG9wID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgX3Byb2Nlc3NWZXJ0ZXgoJ3RvcCcsIGFyZ3MpO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc0JvdHRvbSA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIF9wcm9jZXNzVmVydGV4KCdib3R0b20nLCBhcmdzKTtcbiAgfTtcblxuICB2YXIgX3Byb2Nlc3NEb3QgPSBmdW5jdGlvbihhcmdzKSB7XG5cbiAgICBhcmdzWzBdLmZvckVhY2goZnVuY3Rpb24odmVydGV4SWQpIHtcblxuICAgICAgdmFyIHZlcnRleCA9IHN0YWdlLmdldFZlcnRleEJ5SWQodmVydGV4SWQpO1xuXG4gICAgICBpZih2ZXJ0ZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2ZXJ0ZXgudmlzaWJsZSA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9zdHJpcEN1cmxpZXMgPSBmdW5jdGlvbihhcmdzKSB7XG5cbiAgICB2YXIgcGF0dGVybiA9IC9cXHt8XFx9L2c7XG4gICAgdmFyIGVzY2FwZWQgPSBbXTtcblxuICAgIGVzY2FwZWQgPSBhcmdzLm1hcChmdW5jdGlvbihhcmcpIHtcbiAgICAgIHJldHVybiBhcmcucmVwbGFjZShwYXR0ZXJuLCAnJyk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZXNjYXBlZDtcbiAgfTtcblxuICB2YXIgX2V4cGxvZGVBcmdzID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgdmFyIGV4cGxvZGVkQXJncyA9IFtdO1xuXG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uKGFyZykge1xuICAgICAgdmFyIGUgPSBhcmcuc3BsaXQoJywnKTtcbiAgICAgIGV4cGxvZGVkQXJncy5wdXNoKGUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGV4cGxvZGVkQXJncztcbiAgfTtcblxuICB2YXIgX2dldE51bWJlck9mVmVydGljZXMgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzdW0gPSAwO1xuXG4gICAgZm9yKHZhciBrZXkgaW4gc3RhZ2UudmVydGljZXMpIHtcbiAgICAgIGlmKHN0YWdlLnZlcnRpY2VzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgc3VtICs9IHN0YWdlLnZlcnRpY2VzW2tleV0ubGVuZ3RoO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdW07XG4gIH07XG5cbiAgdmFyIF9nZXRQYXJ0aWNsZSA9IGZ1bmN0aW9uKHR5cGUsIGlkKSB7XG5cbiAgICB2YXIgcGFydGljbGU7XG5cbiAgICBzd2l0Y2godHlwZSkge1xuXG4gICAgICBjYXNlICdlbGVjdHJvbic6XG4gICAgICAgIHBhcnRpY2xlID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUoeyBpZDogaWQsIHR5cGU6ICdlLScgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncXVhcmsnOlxuICAgICAgICBwYXJ0aWNsZSA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHsgaWQ6IGlkLCB0eXBlOiAncScgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGhvdG9uJzpcbiAgICAgICAgcGFydGljbGUgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZSh7IGlkOiBpZCwgdHlwZTogJ3BoJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdnbHVvbic6XG4gICAgICAgIHBhcnRpY2xlID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUoeyBpZDogaWQsIHR5cGU6ICdnJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBwYXJ0aWNsZSA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHsgaWQ6IGlkLCB0eXBlOiAnZS0nIH0pO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gcGFydGljbGU7XG4gIH07XG5cbiAgdmFyIF9rZXl3b3JkRnVuY3Rpb25NYXAgPSB7XG4gICAgJ2ZtZicgICAgICAgOiBfcHJvY2Vzc0Zlcm1pb24sXG4gICAgJ2ZtZnJpZ2h0JyAgOiBfcHJvY2Vzc1JpZ2h0LFxuICAgICdmbWZsZWZ0JyAgIDogX3Byb2Nlc3NMZWZ0LFxuICAgICdmbWZ0b3AnICAgIDogX3Byb2Nlc3NUb3AsXG4gICAgJ2ZtZmJvdHRvbScgOiBfcHJvY2Vzc0JvdHRvbSxcbiAgICAnZm1mZG90JyAgICA6IF9wcm9jZXNzRG90XG4gIH07XG5cbiAgcmV0dXJuIExhdGV4UGFyc2VyO1xufSkoKTsiLCJ2YXIgU3RhbmRhcmRQYXJzZXIgPSByZXF1aXJlKCcuL1N0YW5kYXJkUGFyc2VyJyk7XG52YXIgTGF0ZXhQYXJzZXIgICAgPSByZXF1aXJlKCcuL0xhdGV4UGFyc2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldFBhcnNlcjogZnVuY3Rpb24obGFuZykge1xuXG4gICAgaWYobGFuZyA9PT0gJ2xhdGV4Jykge1xuICAgICAgcmV0dXJuIG5ldyBMYXRleFBhcnNlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN0YW5kYXJkUGFyc2VyKCk7XG4gIH1cbn07IiwidmFyIFN0YWdlICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9TdGFnZScpO1xudmFyIFBhcnRpY2xlR2VuZXJhdG9yID0gcmVxdWlyZSgnLi8uLi9QYXJ0aWNsZUdlbmVyYXRvcicpO1xudmFyIFZlcnRleCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9WZXJ0ZXgnKTtcbnZhciBFeGNoYW5nZSAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vRXhjaGFuZ2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIFxuICB2YXIgU3RhbmRhcmRQYXJzZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YW5kYXJkUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgdmFyIHN0YWdlID0gbmV3IFN0YWdlKCk7XG5cbiAgICBfc2V0VGl0bGUoc3RhZ2UsIGRhdGEudGl0bGUpO1xuICAgIF9zZXRMYXlvdXQoc3RhZ2UsIGRhdGEubGF5b3V0KTtcbiAgICBfc2V0RGltZW5zaW9uKHN0YWdlLCBkYXRhLndpZHRoLCBkYXRhLmhlaWdodCk7XG4gICAgX3NldFNob3dBeGVzKHN0YWdlLCBkYXRhLnNob3dBeGVzKTtcbiAgICBfc2V0UHJvcGFnYXRvcnMoc3RhZ2UsIGRhdGEucHJvcGFnYXRvcnMpO1xuICAgIF9zZXRWZXJ0aWNlcyhzdGFnZSwgZGF0YS52ZXJ0aWNlcyk7XG4gICAgX3NldEV4Y2hhbmdlcyhzdGFnZSwgZGF0YS5leGNoYW5nZXMpO1xuXG4gICAgcmV0dXJuIHN0YWdlO1xuICB9O1xuXG4gIHZhciBfc2V0VGl0bGUgPSBmdW5jdGlvbihzdGFnZSwgdGl0bGUpIHtcblxuICAgIGlmKHRpdGxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnRpdGxlID0gdGl0bGU7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0TGF5b3V0ID0gZnVuY3Rpb24oc3RhZ2UsIGxheW91dCkge1xuXG4gICAgaWYobGF5b3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmxheW91dCA9IGxheW91dDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXREaW1lbnNpb24gPSBmdW5jdGlvbihzdGFnZSwgd2lkdGgsIGhlaWdodCkge1xuXG4gICAgaWYod2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2Uud2lkdGggPSB3aWR0aDtcbiAgICB9XG4gICAgaWYoaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmhlaWdodCA9IGhlaWdodDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRTaG93QXhlcyA9IGZ1bmN0aW9uKHN0YWdlLCBzaG93QXhlcykge1xuXG4gICAgaWYoc2hvd0F4ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2Uuc2hvd0F4ZXMgPSBzaG93QXhlcztcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRQcm9wYWdhdG9ycyA9IGZ1bmN0aW9uKHN0YWdlLCBwcm9wYWdhdG9ycykge1xuXG4gICAgaWYocHJvcGFnYXRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHByb3BhZ2F0b3JzIScpO1xuICAgIH1cblxuICAgIHByb3BhZ2F0b3JzLmZvckVhY2goZnVuY3Rpb24ocHJvcGFnYXRvckF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIHAgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZShwcm9wYWdhdG9yQXR0cmlidXRlcyk7XG5cbiAgICAgIGlmKHAgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdGFnZS5wcm9wYWdhdG9ycy5wdXNoKHApO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfc2V0VmVydGljZXMgPSBmdW5jdGlvbihzdGFnZSwgdmVydGljZXMpIHtcblxuICAgIGlmKHZlcnRpY2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyB2ZXJ0aWNlcyEnKTtcbiAgICB9XG5cbiAgICB2ZXJ0aWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleEF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIHYgPSBuZXcgVmVydGV4KHZlcnRleEF0dHJpYnV0ZXMuaWQsIHZlcnRleEF0dHJpYnV0ZXMucG9zaXRpb24sIHZlcnRleEF0dHJpYnV0ZXMuaW5ib3VuZCwgdmVydGV4QXR0cmlidXRlcy5vdXRib3VuZCk7XG5cbiAgICAgIGlmKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdGFnZS52ZXJ0aWNlc1t2ZXJ0ZXhBdHRyaWJ1dGVzLnBvc2l0aW9uWzBdXS5wdXNoKHYpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfc2V0RXhjaGFuZ2VzID0gZnVuY3Rpb24oc3RhZ2UsIGV4Y2hhbmdlcykge1xuXG4gICAgaWYoZXhjaGFuZ2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBleGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbihleGNoYW5nZUF0dHJpYnV0ZXMpIHtcblxuICAgICAgdmFyIGUgPSBuZXcgRXhjaGFuZ2UoZXhjaGFuZ2VBdHRyaWJ1dGVzLmlkLCBleGNoYW5nZUF0dHJpYnV0ZXMuaW5ib3VuZCwgZXhjaGFuZ2VBdHRyaWJ1dGVzLm91dGJvdW5kLCBleGNoYW5nZUF0dHJpYnV0ZXMucGFydGljbGVzKTtcblxuICAgICAgaWYoZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN0YWdlLmV4Y2hhbmdlcy5wdXNoKGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBTdGFuZGFyZFBhcnNlcjtcbn0pKCk7IiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIF9jb2xvciAgPSAnIzAwMCc7XG4gIHZhciBfbGVuZ3RoID0gMTA5O1xuXG4gIHZhciBBYnN0cmFjdFBhcnRpY2xlID0gZnVuY3Rpb24oaWQsIGFudGksIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIGlmKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB0aGlzLmlkICAgICA9IGlkO1xuICAgIHRoaXMuYW50aSAgID0gYW50aTtcbiAgICB0aGlzLmNvbG9yICA9IGNvbG9yICB8fCBfY29sb3I7XG4gICAgdGhpcy5sZW5ndGggPSBsZW5ndGggfHwgX2xlbmd0aDtcbiAgICB0aGlzLnggICAgICA9IDA7XG4gICAgdGhpcy55ICAgICAgPSAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgQWJzdHJhY3RQYXJ0aWNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBhYnN0cmFjdCBtZXRob2QhJyk7XG4gIH07XG5cbiAgQWJzdHJhY3RQYXJ0aWNsZS5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBhYnN0cmFjdCBtZXRob2QhJyk7XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0UGFydGljbGU7XG5cbn0pKCk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoRWxlY3Ryb24sIF9zdXBlcik7XG5cbiAgZnVuY3Rpb24gRWxlY3Ryb24oaWQsIGFudGksIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIEVsZWN0cm9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIGFudGkgfHwgZmFsc2UsIGNvbG9yLCBsZW5ndGhdKTtcbiAgfVxuXG4gIEVsZWN0cm9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICBjYW52YXMucGF0aCh0aGlzLmdldFBhdGgoJ2xpbmUnKSlcbiAgICAgICAgICAuZmlsbCgnbm9uZScpXG4gICAgICAgICAgLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KTtcbiAgfTtcblxuICBFbGVjdHJvbi5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKHNoYXBlKSB7XG5cbiAgICB2YXIgdGlsZSA9IFsgWzEsIDFdLCBbMiwgMV0gXTtcbiAgICB2YXIgbCAgICA9IDE7XG5cbiAgICBzd2l0Y2goc2hhcGUpIHtcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUodGlsZSwgbCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnYXJjJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5hcmMoJ2VsZWN0cm9uJywgdGlsZSwgbCwgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnbG9vcCc6XG4gICAgICAgIHJldHVybiBCZXppZXIubG9vcCgnZWxlY3Ryb24nLCB0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUodGlsZSwgbCwgdGhpcy5sZW5ndGgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gRWxlY3Ryb247XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyIsInZhciBLbGFzcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0tsYXNzJyk7XG52YXIgQWJzdHJhY3RQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vQWJzdHJhY3RQYXJ0aWNsZScpO1xudmFyIEJlemllciAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvQmV6aWVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuXG4gIEtsYXNzLl9fZXh0ZW5kcyhHbHVvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBHbHVvbihpZCwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgR2x1b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIFtpZCwgdW5kZWZpbmVkLCBjb2xvciB8fCAnIzAwOTkzMycsIGxlbmd0aCB8fCA5Nl0pO1xuICB9XG5cbiAgR2x1b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHZhciBwYXRoID0gdGhpcy5nZXRQYXRoKCdhcmMnKTtcbiAgICBjYW52YXMucGF0aChwYXRoLCB0cnVlKVxuICAgICAgLmZpbGwoJ25vbmUnKVxuICAgICAgLnN0cm9rZSh7IHdpZHRoOiAxLCBjb2xvcjogdGhpcy5jb2xvciB9KVxuICAgICAgLnRyYW5zbGF0ZSgxNTAsIDE1MCk7XG4gIH07XG5cbiAgR2x1b24ucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbihzaGFwZSkge1xuXG4gICAgdmFyIGdsdW9uID0ge1xuICAgICAgd2lkdGggIDogMTUsICAgLy8gdGhlIGNvaWwgd2lkdGggb2YgZ2x1b24gcHJvcGFnYXRvcnNcbiAgICAgIGhlaWdodCA6IDE1LCAgIC8vIHRoZSBjb2lsIGhlaWdodCBvZiBnbHVvbiBwcm9wYWdhdG9yc1xuICAgICAgZmFjdG9yIDogMC43NSwgLy8gdGhlIGZhY3RvciBwYXJhbWV0ZXIgZm9yIGdsdW9uIHByb3BhZ2F0b3JzXG4gICAgICBwZXJjZW50OiAwLjYsICAvLyB0aGUgcGVyY2VudCBwYXJhbWV0ZXIgZm9yIGdsdW9uIHByb3BhZ2F0b3JzXG4gICAgICBzY2FsZSAgOiAxLjE1ICAvLyB0aGUgc2NhbGUgcGFyYW1ldGVyIGZvciBnbHVvbiBhcmNzIGFuZCBsb29wc1xuICAgIH07XG5cbiAgICB2YXIga2FwcGEgPSAwLjU1MTkxNTAyO1xuICAgIC8vIGEgYW5kIGIgYXJlIG9uZS1oYWxmIG9mIHRoZSBlbGxpcHNlJ3MgbWFqb3IgYW5kIG1pbm9yIGF4ZXNcbiAgICB2YXIgYSAgICAgPSBnbHVvbi5oZWlnaHQgKiBnbHVvbi5mYWN0b3I7XG4gICAgdmFyIGIgICAgID0gZ2x1b24ud2lkdGggICogZ2x1b24ucGVyY2VudDtcbiAgICAvLyBjIGFuZCBkIGFyZSBvbmUtaGFsZiBvZiBtYWpvciBhbmQgbWlub3IgYXhlcyBvZiB0aGUgb3RoZXIgZWxsaXBzZVxuICAgIHZhciBjICAgICA9IGdsdW9uLmhlaWdodCAqIChnbHVvbi5mYWN0b3IgLSAwLjUpO1xuICAgIHZhciBkICAgICA9IGdsdW9uLndpZHRoICAqICgxIC0gZ2x1b24ucGVyY2VudCk7XG5cbiAgICB2YXIgZGlyICAgPSBmYWxzZTtcbiAgICB2YXIgcHRzICAgPSAoZGlyXG4gICAgICA/IFtbMCwgMF0sICdBICcgKyBhICsgJyAnICsgYiwgMCwgMCwgMSwgW2EsIGJdLFxuICAgICAgICAgICAgICAgICAnQSAnICsgYyArICcgJyArIGQsIDAsIDEsIDEsIFthIC0gMiAqIGMsIGJdLFxuICAgICAgICAgICAgICAgICAnQSAnICsgYSArICcgJyArIGIsIDAsIDAsIDFdXG4gICAgICA6IFtbMCwgMF0sICdBICcgKyBhICsgJyAnICsgYiwgMCwgMCwgMCwgW2EsIC1iXSxcbiAgICAgICAgICAgICAgICAgJ0EgJyArIGMgKyAnICcgKyBkLCAwLCAxLCAwLCBbYSAtIDIgKiBjLCAtYl0sXG4gICAgICAgICAgICAgICAgICdBICcgKyBhICsgJyAnICsgYiwgMCwgMCwgMF1cbiAgICApO1xuXG4gICAgYSA9IChkaXIgPyBhIDogZ2x1b24uc2NhbGUgKiBhKTtcbiAgICB2YXIgbGlmdCA9IGEgLyBNYXRoLnBvdyh0aGlzLmxlbmd0aCwgMC42KTtcblxuICAgIHZhciB0aWxlID0gKGRpclxuICAgICAgPyBbJ0MnLCBba2FwcGEgKiBhLCBsaWZ0XSwgW2EsIGIgLSBrYXBwYSAqIGJdLCBbYSwgYl0sXG4gICAgICAgICAnQycsIFthLCBiICsga2FwcGEgKiBkXSwgW2EgLSBjICsga2FwcGEgKiBjLCBiICsgZF0sIFthIC0gYywgYiArIGRdLFxuICAgICAgICAgJ1MnLCBbYSAtIDIgKiBjLCBiICsga2FwcGEgKiBkXSwgW2EgLSAyICogYywgYl0sXG4gICAgICAgICAnQycsIFthIC0gMiAqIGMsIGIgLSBrYXBwYSAqIGJdLCBbMiAqIChhIC0gYykgLSBrYXBwYSAqIGEsIDBdLCBbMiAqIChhIC0gYyksIC1saWZ0XV1cbiAgICAgIDogWydDJywgW2thcHBhICogYSwgbGlmdF0sIFthLCAtYiArIGthcHBhICogYl0sIFthLCAtYl0sXG4gICAgICAgICAnQycsIFthLCAtYiAtIGthcHBhICogZF0sIFthIC0gYyArIGthcHBhICogYywgLWIgLSBkXSwgW2EgLSBjLCAtYiAtIGRdLFxuICAgICAgICAgJ1MnLCBbYSAtIDIgKiBjLCAtYiAtIGthcHBhICogZF0sIFthIC0gMiAqIGMsIC1iXSxcbiAgICAgICAgICdDJywgW2EgLSAyICogYywgLWIgKyBrYXBwYSAqIGJdLCBbMiAqIChhIC0gYykgLSBrYXBwYSAqIGEsIDBdLCBbMiAqIChhIC0gYyksIC1saWZ0XV1cbiAgICApO1xuXG4gICAgc3dpdGNoKHNoYXBlKSB7XG4gICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgZ2x1b24uaGVpZ2h0LCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdhcmMnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmFyYygnZ2x1b24nLCB0aWxlLCBhIC0gYywgdGhpcy5sZW5ndGgpO1xuICAgICAgY2FzZSAnbG9vcCc6XG4gICAgICAgIHJldHVybiBCZXppZXIubG9vcCgnZ2x1b24nLCB0aWxlLCBhIC0gYywgdGhpcy5sZW5ndGgpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgZ2x1b24uaGVpZ2h0LCB0aGlzLmxlbmd0aCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBHbHVvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKFBob3RvbiwgX3N1cGVyKTtcblxuICBmdW5jdGlvbiBQaG90b24oaWQsIGNvbG9yLCBsZW5ndGgpIHtcblxuICAgIFBob3Rvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCB1bmRlZmluZWQsIGNvbG9yIHx8ICcjMDA2NkZGJywgbGVuZ3RoIHx8IDEwOV0pO1xuICB9XG5cbiAgUGhvdG9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY2FudmFzKSB7XG5cbiAgICB2YXIgcGF0aCA9IHRoaXMuZ2V0UGF0aCgnbGluZScpO1xuICAgIGNhbnZhcy5wYXRoKHBhdGgsIHRydWUpXG4gICAgICAgICAgLmZpbGwoJ25vbmUnKVxuICAgICAgICAgIC5zdHJva2UoeyB3aWR0aDogMSwgY29sb3I6IHRoaXMuY29sb3IgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcHJveGltYXRpb24gb2YgdGhlIGZpcnN0IHF1YXJ0ZXIgb2Ygb25lIHBlcmlvZCBvZiBhIHNpbmUgY3VydmVcbiAgICogaXMgYSBjdWJpYyBCZXppZXIgY3VydmUgd2l0aCB0aGUgZm9sbG93aW5nIGNvbnRyb2wgcG9pbnRzOlxuICAgKlxuICAgKiAoMCwgMCkgKGxhbWJkYSAqIHAgLyBQSSwgbGFtYmRhICogYSAvIDIpICgyICogcCAvIFBJLCBhKSAocCwgYSlcbiAgICpcbiAgICogUmVmZXJlbmNlczpcbiAgICpcbiAgICogWzFdIGh0dHA6Ly9tYXRoYi5pbi8xNDQ3XG4gICAqIFsyXSBodHRwczovL2dpdGh1Yi5jb20vcGhvdGluby9qcXVlcnktZmV5bi9ibG9iL21hc3Rlci9qcy9qcXVlcnkuZmV5bi0xLjAuMS5qc1xuICAgKlxuICAgKiBAcGFyYW0gc2hhcGVcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBQaG90b24ucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbihzaGFwZSkge1xuXG4gICAgdmFyIFBJICAgICA9IE1hdGguUEk7XG4gICAgdmFyIGxhbWJkYSA9IDAuNTExMjg3MzM7XG4gICAgdmFyIGEgICAgICA9IDU7XG4gICAgdmFyIGIgICAgICA9IDAuNSAqIGxhbWJkYSAqIGE7XG4gICAgdmFyIHAgICAgICA9IDU7XG4gICAgdmFyIHEgICAgICA9IDIgKiBwIC8gUEk7XG4gICAgdmFyIHQgICAgICA9IGxhbWJkYSAqIHAgLyBQSTtcbiAgICB2YXIgZGlyICAgID0gZmFsc2U7XG5cbiAgICB2YXIgcHRzID0gKGRpclxuICAgICAgPyBbWzAsIDBdLCAnQycsIFt0LCAtYl0sIFtxLCAtYV0sIFtwLCAtYV0sXG4gICAgICAgICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgLWJdLCBbMiAqIHAsIDBdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCArIHEsIGFdLCBbMyAqIHAsIGFdLFxuICAgICAgICAgICAgICAgICAnUycsIFs0ICogcCAtIHQsIGJdXVxuICAgICAgOiBbWzAsIDBdLCAnQycsIFt0LCBiXSwgW3EsIGFdLCBbcCwgYV0sXG4gICAgICAgICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgYl0sIFsyICogcCwgMF0sXG4gICAgICAgICAgICAgICAgICdTJywgWzIgKiBwICsgcSwgLWFdLCBbMyAqIHAsIC1hXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbNCAqIHAgLSB0LCAtYl1dXG4gICAgKTtcblxuICAgIHZhciB0aWxlID0gKGRpclxuICAgICAgPyBbWydDJywgW3QsIC1iXSwgW3EsIC1hXSwgW3AsIC1hXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwICsgMC41LCAwXV0sXG4gICAgICAgICBbJ0MnLCBbdCwgYl0sIFtxLCBhXSwgW3AsIGFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgLWJdLCBbMiAqIHAgLSAwLjUsIDBdXV1cbiAgICAgIDogW1snQycsIFt0LCBiXSwgW3EsIGFdLCBbcCwgYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCBiXSwgWzIgKiBwIC0gMC41LCAwXV0sXG4gICAgICAgICBbJ0MnLCBbdCwgLWJdLCBbcSwgLWFdLCBbcCwgLWFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgLWJdLCBbMiAqIHAgKyAwLjUsIDBdXV1cbiAgICApO1xuXG4gICAgc3dpdGNoKHNoYXBlKSB7XG4gICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgNCAqIHAsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGNhc2UgJ2FyYyc6XG4gICAgICAgIHJldHVybiBCZXppZXIuYXJjKCdwaG90b24nLCB0aWxlLCBwLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdsb29wJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5sb29wKCdwaG90b24nLCB0aWxlLCBwLCB0aGlzLmxlbmd0aCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUocHRzLCA0ICogcCwgdGhpcy5sZW5ndGgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gUGhvdG9uO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKFF1YXJrLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIFF1YXJrKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBRdWFyay5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCBhbnRpIHx8IGZhbHNlLCBjb2xvciwgbGVuZ3RoXSk7XG4gIH1cblxuICBRdWFyay5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gIH07XG5cbiAgUXVhcmsucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiAnJztcbiAgfTtcblxuICByZXR1cm4gUXVhcms7XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyJdfQ==
(7)
});
;