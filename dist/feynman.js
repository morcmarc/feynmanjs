!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Feynman=e():"undefined"!=typeof global?global.Feynman=e():"undefined"!=typeof self&&(self.Feynman=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function() {

  var ControlPoint = function(id) {

    this.id       = id;
    this.x        = 0;
    this.y        = 0;
  };

  return ControlPoint;
})();
},{}],2:[function(require,module,exports){
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
    this.title       = 'Feynman';
    this.layout      = 'time-space';
    this.width       = 100;
    this.height      = 100;
    this.showAxes    = true;
    this.propagators = [];
    this.vertices    = [];
    this.cPoints     = {
      left   : [],
      right  : [],
      top    : [],
      bottom : []
    };

    return this;
  };

  Stage.prototype.getVertexById = function(id) {

    var result = undefined;

    this.vertices.forEach(function(v) {
      if(v.id === id) {
        result = v;
      }
    });

    return result;
  };

  Stage.prototype.getControlPointById = function(id) {

    var result = undefined;

    for(var key in this.cPoints) {
      if(this.cPoints.hasOwnProperty(key)) {
        this.cPoints[key].forEach(function(cPoint) {
          if(cPoint.id === id) {
            result = cPoint;
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
      vertex.draw(ctx);
    });
  };

  var _drawPropagators = function(ctx) {

    ctx.propagators.forEach(function(particle) {

      var startEnd = _getVerticesForPropagator(particle, ctx);

      particle.draw(ctx.canvas, startEnd.end, startEnd.start);
    });
  };

  var _getVerticesForPropagator = function(propagator, ctx) {

    var vertexA = propagator.from;
    var vertexB = propagator.to;

//    ctx.vertices.forEach(function(v) {
//      if(v.inbound.indexOf(propagator.id) > -1) {
//        vertexB = v;
//      }
//      if(v.outbound.indexOf(propagator.id) > -1) {
//        vertexA = v;
//      }
//    });

    return { start: vertexA, end: vertexB };
  };

  return Stage;
})();
},{}],4:[function(require,module,exports){
module.exports = (function() {

  var Vertex = function(id) {

    this.id = id;
    this.visible = false;
    this.x = 0;
    this.y = 0;

    return this;
  };

  Vertex.prototype.draw = function(stage) {

    if(!this.visible) {
      return;
    }

    this.move(stage);

    stage.canvas
         .circle(4)
         .fill({ color: '#000' })
         .translate( this.x - 2, this.y - 2 );
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
module.exports = {

  getAngle: function(A, B) {

    var diffX   = B.x - A.x;
    var diffY   = B.y - A.y;
    return Math.atan2(diffY, diffX) * (180.0 / Math.PI);
  },

  getDistance: function(A, B) {

    var diffX   = B.x - A.x;
    var diffY   = B.y - A.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  }
};
},{}],7:[function(require,module,exports){
var __hasProp = {}.hasOwnProperty;

module.exports = {
  __extends: function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
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

  window.Feynman = Feynman;

  return Feynman;
})();
},{"./parsers/ParserFactory":10}],9:[function(require,module,exports){
var Stage             = require('./../Stage');
var ParticleGenerator = require('./../ParticleGenerator');
var ControlPoint      = require('./../ControlPoint');
var Vertex            = require('./../Vertex');

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

    var i = 0;

    while(args[1][i + 1]) {

      var fromId = args[1][i];
      var toId   = args[1][i + 1];
      var from   = _processPropagatorStartEnd(fromId);
      var to     = _processPropagatorStartEnd(toId);

      if(!from || !to) {
        throw new Error('Invalid Vertex or Control Point');
      }

      var id   = 'p' + stage.propagators.length + 1;
      var p    = _getParticle(args[0][0], id);

      p.from   = from;
      p.to     = to;

      stage.propagators.push(p);
      i++;
    }
  };

  var _processControlPoint = function(pos, args) {

    args[0].forEach(function(cId) {

      if(stage.getControlPointById(cId)) {
        return;
      }

      var cp = new ControlPoint(cId);
      stage.cPoints[pos].push(cp);
    });
  };

  var _processRight = function(args) {

    _processControlPoint('right', args);
  };

  var _processLeft = function(args) {

    _processControlPoint('left', args);
  };

  var _processTop = function(args) {

    _processControlPoint('top', args);
  };

  var _processBottom = function(args) {

    _processControlPoint('bottom', args);
  };

  var _processDot = function(args) {

  };

  var _stripCurlies = function(args) {

    var pattern = /\{|\}/g;
    return args.map(function(arg) {
      return arg.replace(pattern, '');
    });
  };

  var _explodeArgs = function(args) {

    var explodedArgs = [];

    args.forEach(function(arg) {
      var e = arg.split(',');
      explodedArgs.push(e);
    });

    return explodedArgs;
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

  var _isVertex = function(point) {

    return point[0] === 'v';
  };

  var _processPropagatorStartEnd = function(id) {

    var p;

    if(_isVertex(id)) {

      p = stage.getVertexById(id) ? stage.getVertexById(id) : new Vertex(id);

      if(!stage.getVertexById(id)) {
        stage.vertices.push(p);
      }
    } else {

      p = stage.getControlPointById(id);
    }

    return p;
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
},{"./../ControlPoint":1,"./../ParticleGenerator":2,"./../Stage":3,"./../Vertex":4}],10:[function(require,module,exports){
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

  return StandardParser;
})();
},{"./../ParticleGenerator":2,"./../Stage":3}],12:[function(require,module,exports){
var Coordinates      = require('./../helpers/Coordinates');

module.exports = (function() {

  var _color  = '#000';
  var _length = 109;

  var AbstractParticle = function(id, color, length) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    this.id     = id;
    this.color  = color  || _color;
    this.length = length || _length;
    this.from   = null;
    this.to     = null;
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

  AbstractParticle.prototype.getPosition = function(vertexB, vertexA) {

    var start    = vertexA ? vertexA : this;
    var end      = vertexB ? vertexB : this;
    var angleDir = vertexB ? -1 : 1;

    var angle   = angleDir * Coordinates.getAngle(start, end);
    var length  = Coordinates.getDistance(start, end) < 100 ? Coordinates.getDistance(start, end) : 100;

    return { x: vertexA ? start.x : vertexB.x, y: vertexA ? start.y : vertexB.y, r: angle, l: length };
  };

  return AbstractParticle;

})();
},{"./../helpers/Coordinates":6}],13:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');
var Bezier           = require('./../helpers/Bezier');
var Coordinates      = require('./../helpers/Coordinates');


module.exports = (function(_super) {

  Klass.__extends(Electron, _super);

  function Electron(id, anti, color, length) {

    Electron.__super__.constructor.apply(this, [id, anti || false, color, length]);
  }

  Electron.prototype.draw = function(canvas, vertexB, vertexA) {

    var position = this.getPosition(vertexB, vertexA);

    this.length = position.l;

    canvas.path(this.getPath('line'))
          .transform({
            cx: position.x,
            cy: position.y,
            rotation: position.r,
            x: position.x,
            y: position.y
          })
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
},{"./../helpers/Bezier":5,"./../helpers/Coordinates":6,"./../helpers/Klass":7,"./AbstractParticle":12}],14:[function(require,module,exports){
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
},{"./../helpers/Bezier":5,"./../helpers/Klass":7,"./AbstractParticle":12}],15:[function(require,module,exports){
var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');
var Bezier           = require('./../helpers/Bezier');

module.exports = (function(_super) {

  Klass.__extends(Photon, _super);

  function Photon(id, color, length) {

    Photon.__super__.constructor.apply(this, [id, undefined, color || '#0066FF', length || 109]);
  }

  Photon.prototype.draw = function(canvas, vertexB, vertexA) {

    var position = this.getPosition(vertexB, vertexA);

    this.length = position.l;

    var path = this.getPath('line');
    canvas.path(path, true)
          .transform({
            cx: position.x,
            cy: position.y,
            rotation: position.r,
            x: position.x,
            y: position.y
          })
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
},{"./../helpers/Bezier":5,"./../helpers/Klass":7,"./AbstractParticle":12}],16:[function(require,module,exports){
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
},{"./../helpers/Klass":7,"./AbstractParticle":12}]},{},[8])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9Db250cm9sUG9pbnQuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9QYXJ0aWNsZUdlbmVyYXRvci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL1N0YWdlLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvVmVydGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvaGVscGVycy9CZXppZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9oZWxwZXJzL0Nvb3JkaW5hdGVzLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvaGVscGVycy9LbGFzcy5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL2luZGV4LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcGFyc2Vycy9MYXRleFBhcnNlci5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvUGFyc2VyRmFjdG9yeS5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvU3RhbmRhcmRQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9BYnN0cmFjdFBhcnRpY2xlLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvcHJvcGFnYXRvcnMvRWxlY3Ryb24uanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wcm9wYWdhdG9ycy9HbHVvbi5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL1Bob3Rvbi5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3Byb3BhZ2F0b3JzL1F1YXJrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgQ29udHJvbFBvaW50ID0gZnVuY3Rpb24oaWQpIHtcblxuICAgIHRoaXMuaWQgICAgICAgPSBpZDtcbiAgICB0aGlzLnggICAgICAgID0gMDtcbiAgICB0aGlzLnkgICAgICAgID0gMDtcbiAgfTtcblxuICByZXR1cm4gQ29udHJvbFBvaW50O1xufSkoKTsiLCJ2YXIgRWxlY3Ryb24gPSByZXF1aXJlKCcuL3Byb3BhZ2F0b3JzL0VsZWN0cm9uJyk7XG52YXIgUXVhcmsgICAgPSByZXF1aXJlKCcuL3Byb3BhZ2F0b3JzL1F1YXJrJyk7XG52YXIgR2x1b24gICAgPSByZXF1aXJlKCcuL3Byb3BhZ2F0b3JzL0dsdW9uJyk7XG52YXIgUGhvdG9uICAgPSByZXF1aXJlKCcuL3Byb3BhZ2F0b3JzL1Bob3RvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXRQYXJ0aWNsZTogZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdlLScpIHtcbiAgICAgIHJldHVybiBuZXcgRWxlY3Ryb24oZGF0YS5pZCwgZmFsc2UsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdlKycpIHtcbiAgICAgIHJldHVybiBuZXcgRWxlY3Ryb24oZGF0YS5pZCwgdHJ1ZSwgZGF0YS5jb2xvciwgZGF0YS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGlmKGRhdGEudHlwZSA9PT0gJ3EnKSB7XG4gICAgICByZXR1cm4gbmV3IFF1YXJrKGRhdGEuaWQsIGZhbHNlLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAnYXEnKSB7XG4gICAgICByZXR1cm4gbmV3IFF1YXJrKGRhdGEuaWQsIHRydWUsIGRhdGEuY29sb3IsIGRhdGEubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZihkYXRhLnR5cGUgPT09ICdnJykge1xuICAgICAgcmV0dXJuIG5ldyBHbHVvbihkYXRhLmlkLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYoZGF0YS50eXBlID09PSAncGgnKSB7XG4gICAgICByZXR1cm4gbmV3IFBob3RvbihkYXRhLmlkLCBkYXRhLmNvbG9yLCBkYXRhLmxlbmd0aCk7XG4gICAgfVxuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBTdGFnZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgLy8gR2VuZXJpYyBBdHRyaWJ1dGVzIChvcHRpb25hbClcbiAgICB0aGlzLnRpdGxlICAgICAgID0gJ0ZleW5tYW4nO1xuICAgIHRoaXMubGF5b3V0ICAgICAgPSAndGltZS1zcGFjZSc7XG4gICAgdGhpcy53aWR0aCAgICAgICA9IDEwMDtcbiAgICB0aGlzLmhlaWdodCAgICAgID0gMTAwO1xuICAgIHRoaXMuc2hvd0F4ZXMgICAgPSB0cnVlO1xuICAgIHRoaXMucHJvcGFnYXRvcnMgPSBbXTtcbiAgICB0aGlzLnZlcnRpY2VzICAgID0gW107XG4gICAgdGhpcy5jUG9pbnRzICAgICA9IHtcbiAgICAgIGxlZnQgICA6IFtdLFxuICAgICAgcmlnaHQgIDogW10sXG4gICAgICB0b3AgICAgOiBbXSxcbiAgICAgIGJvdHRvbSA6IFtdXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5nZXRWZXJ0ZXhCeUlkID0gZnVuY3Rpb24oaWQpIHtcblxuICAgIHZhciByZXN1bHQgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLnZlcnRpY2VzLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgaWYodi5pZCA9PT0gaWQpIHtcbiAgICAgICAgcmVzdWx0ID0gdjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgU3RhZ2UucHJvdG90eXBlLmdldENvbnRyb2xQb2ludEJ5SWQgPSBmdW5jdGlvbihpZCkge1xuXG4gICAgdmFyIHJlc3VsdCA9IHVuZGVmaW5lZDtcblxuICAgIGZvcih2YXIga2V5IGluIHRoaXMuY1BvaW50cykge1xuICAgICAgaWYodGhpcy5jUG9pbnRzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgdGhpcy5jUG9pbnRzW2tleV0uZm9yRWFjaChmdW5jdGlvbihjUG9pbnQpIHtcbiAgICAgICAgICBpZihjUG9pbnQuaWQgPT09IGlkKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBjUG9pbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIFN0YWdlLnByb3RvdHlwZS5zZXRDYW52YXMgPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIHRoaXMuY2FudmFzLnNpemUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhZ2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcblxuICAgIF9kcmF3VGl0bGUodGhpcyk7XG4gICAgX2RyYXdWZXJ0aWNlcyh0aGlzKTtcbiAgICBfZHJhd1Byb3BhZ2F0b3JzKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBfZHJhd1RpdGxlID0gZnVuY3Rpb24oY3R4KSB7XG5cbiAgICBjdHguY2FudmFzLnRleHQoY3R4LnRpdGxlKS5mb250KHtcbiAgICAgIGZhbWlseSA6ICdHZW9yZ2lhJyxcbiAgICAgIHNpemUgICA6ICAxNCxcbiAgICAgIHN0eWxlICA6ICdpdGFsaWMnLFxuICAgICAgYW5jaG9yIDogJ2xlZnQnXG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIF9kcmF3VmVydGljZXMgPSBmdW5jdGlvbihjdHgpIHtcblxuICAgIGN0eC52ZXJ0aWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHZlcnRleCkge1xuICAgICAgdmVydGV4LmRyYXcoY3R4KTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX2RyYXdQcm9wYWdhdG9ycyA9IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgY3R4LnByb3BhZ2F0b3JzLmZvckVhY2goZnVuY3Rpb24ocGFydGljbGUpIHtcblxuICAgICAgdmFyIHN0YXJ0RW5kID0gX2dldFZlcnRpY2VzRm9yUHJvcGFnYXRvcihwYXJ0aWNsZSwgY3R4KTtcblxuICAgICAgcGFydGljbGUuZHJhdyhjdHguY2FudmFzLCBzdGFydEVuZC5lbmQsIHN0YXJ0RW5kLnN0YXJ0KTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgX2dldFZlcnRpY2VzRm9yUHJvcGFnYXRvciA9IGZ1bmN0aW9uKHByb3BhZ2F0b3IsIGN0eCkge1xuXG4gICAgdmFyIHZlcnRleEEgPSBwcm9wYWdhdG9yLmZyb207XG4gICAgdmFyIHZlcnRleEIgPSBwcm9wYWdhdG9yLnRvO1xuXG4vLyAgICBjdHgudmVydGljZXMuZm9yRWFjaChmdW5jdGlvbih2KSB7XG4vLyAgICAgIGlmKHYuaW5ib3VuZC5pbmRleE9mKHByb3BhZ2F0b3IuaWQpID4gLTEpIHtcbi8vICAgICAgICB2ZXJ0ZXhCID0gdjtcbi8vICAgICAgfVxuLy8gICAgICBpZih2Lm91dGJvdW5kLmluZGV4T2YocHJvcGFnYXRvci5pZCkgPiAtMSkge1xuLy8gICAgICAgIHZlcnRleEEgPSB2O1xuLy8gICAgICB9XG4vLyAgICB9KTtcblxuICAgIHJldHVybiB7IHN0YXJ0OiB2ZXJ0ZXhBLCBlbmQ6IHZlcnRleEIgfTtcbiAgfTtcblxuICByZXR1cm4gU3RhZ2U7XG59KSgpOyIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBWZXJ0ZXggPSBmdW5jdGlvbihpZCkge1xuXG4gICAgdGhpcy5pZCA9IGlkO1xuICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFZlcnRleC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHN0YWdlKSB7XG5cbiAgICBpZighdGhpcy52aXNpYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb3ZlKHN0YWdlKTtcblxuICAgIHN0YWdlLmNhbnZhc1xuICAgICAgICAgLmNpcmNsZSg0KVxuICAgICAgICAgLmZpbGwoeyBjb2xvcjogJyMwMDAnIH0pXG4gICAgICAgICAudHJhbnNsYXRlKCB0aGlzLnggLSAyLCB0aGlzLnkgLSAyICk7XG4gIH07XG5cbiAgcmV0dXJuIFZlcnRleDtcbn0pKCk7IiwidmFyIFBJICAgICAgPSBNYXRoLlBJO1xudmFyIGlzQXJyYXkgPSBmdW5jdGlvbihhKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBub3JtYWxpemVQYXRoU3RyaW5nOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzdHIgPSAnJztcblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIGl0ZW0gPSBhcmd1bWVudHNbaV07XG4gICAgICBzdHIgKz0gJyAnICsgKHR5cGVvZiBpdGVtICE9PSAnbnVtYmVyJyA/XG4gICAgICAgIGl0ZW0gOlxuICAgICAgICBpdGVtLnRvRml4ZWQoMykucmVwbGFjZSgvKC5cXGQqPykwKyQvLCAnJDEnKS5yZXBsYWNlKC9cXC4kLywgJycpXG4gICAgICApO1xuICAgIH1cbiAgICB2YXIgdHJpbW1lZCA9IHN0ci50cmltKCk7XG5cbiAgICByZXR1cm4gdHJpbW1lZC5yZXBsYWNlKC8gPywgPy9nLCAnLCcpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgY29vcmRpbmF0ZXMgb2YgYSBnaXZlbiBwb2ludCBpbiByZWZlcmVuY2UgdG8gYSBnaXZlbiBCZXppZXIgY3VydmUgc2VnbWVudFxuICAgKlxuICAgKiBAcGFyYW0gc3ggU3RhcnQgb2Ygc2VnbWVudCBYXG4gICAqIEBwYXJhbSBzeSBTdGFydCBvZiBzZWdtZW50IFlcbiAgICogQHBhcmFtIGV4IEVuZCBvZiBzZWdtZW50IFhcbiAgICogQHBhcmFtIGV5IEVuZCBvZiBzZWdtZW50IFlcbiAgICogQHBhcmFtIHggIFBvaW50IHRvIGZpdCBYXG4gICAqIEBwYXJhbSB5ICBQb2ludCB0byBmaXQgWVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIGdldENvb3JkaW5hdGVzSW5CZXppZXI6IGZ1bmN0aW9uKHN4LCBzeSwgZXgsIGV5LCB4LCB5KSB7XG5cbiAgICB2YXIgYW5nID0gTWF0aC5hdGFuMihleSAtIHN5LCBleCAtIHN4KTtcblxuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZVBhdGhTdHJpbmcoeCAqIE1hdGguY29zKGFuZykgLSB5ICogTWF0aC5zaW4oYW5nKSArIHN4LCAnLCcsIHggKiBNYXRoLnNpbihhbmcpICsgeSAqIE1hdGguY29zKGFuZykgKyBzeSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIDEvNCBwZXJpb2QgbG9uZyBCZXppZXIgc3BsaW5lIChDKSBvbnRvIGFuIChMbCkgbG9uZyBzdHJhaWdodCBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgIEN1cnZlIHNlZ21lbnRcbiAgICogQHBhcmFtIHBlcmlvZCAgICAgKExwKSBMZW5ndGggb2YgYSBxdWFydGVyIHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTGwpIExlbmd0aCBvZiBwcm9wYWdhdG9yXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBsaW5lOiBmdW5jdGlvbih0aWxlLCBwZXJpb2QsIGxlbmd0aCkge1xuXG4gICAgdmFyIGJlemllciA9IFsnTSddO1xuICAgIHZhciBudW0gICAgPSBNYXRoLmZsb29yKGxlbmd0aCAvIHBlcmlvZCk7XG4gICAgdmFyIGV4dHJhICA9IGxlbmd0aCAtIHBlcmlvZCAqIG51bSArIDAuMTtcblxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gbnVtOyBuKyspIHtcblxuICAgICAgZm9yKHZhciBpID0gMCwgbCA9IHRpbGUubGVuZ3RoLCBpdGVtOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgICAgaXRlbSA9IHRpbGVbaV07XG5cbiAgICAgICAgaWYoaXNBcnJheShpdGVtKSkge1xuXG4gICAgICAgICAgaWYobiA8IG51bSB8fCBpdGVtWzBdIDwgZXh0cmEpIHtcbiAgICAgICAgICAgIGJlemllci5wdXNoKHRoaXMubm9ybWFsaXplUGF0aFN0cmluZyhpdGVtWzBdICsgcGVyaW9kICogbiwgJywnLCBpdGVtWzFdKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZXppZXIucHVzaChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXppZXIuam9pbignICcpLnJlcGxhY2UoL1xcc1tBLVpdW15BLVpdKiQvLCAnJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIHF1YXJ0ZXIgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGxvbmcgYXJjLlxuICAgKlxuICAgKiBAcGFyYW0gcGFydGljbGUgICBUeXBlIG9mIHBhcnRpY2xlLCBlLmcuOiBcInBob3RvblwiXG4gICAqIEBwYXJhbSB0aWxlICAgICAgIChDKSAgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTHApIExlbmd0aCBvZiBhIDEvNCBwZXJpb2RcbiAgICogQHBhcmFtIGxlbmd0aCAgICAgKExsKSBMZW5ndGhcbiAgICogQHJldHVybnMge3N0cmluZ30gU1ZHIHBhdGhcbiAgICovXG4gIGFyYzogZnVuY3Rpb24ocGFydGljbGUsIHRpbGUsIHBlcmlvZCwgbGVuZ3RoKSB7XG5cbiAgICB2YXIgdGVuc2lvbiA9IDI7XG4gICAgdmFyIHQgICAgICAgPSAwLjI1ICogTWF0aC5tYXgodGVuc2lvbiwgMik7XG4gICAgdmFyIHBoaSAgICAgPSBNYXRoLmFjb3MoLTAuNSAvIHQpO1xuICAgIHZhciB0aGV0YSAgID0gLTIgKiBNYXRoLmFzaW4ocGVyaW9kIC8gKHQgKiBsZW5ndGgpKTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBiZXppZXIgID0gWydNJywgJzAsMCddO1xuXG4gICAgLy8gZ2V0IGNvb3JkaW5hdGUgcGFpcnMgZm9yIHRoZSBlbmRwb2ludCBvZiBzZWdtZW50XG4gICAgZm9yKHZhciBuID0gMDsgbiA8PSAoUEkgLSAyICogcGhpKSAvIHRoZXRhOyBuKyspIHtcbiAgICAgIHNlZ21lbnQucHVzaChbbGVuZ3RoICogKHQgKiBNYXRoLmNvcyh0aGV0YSAqIG4gKyBwaGkpICsgMC41KSwgbGVuZ3RoICogKHQgKiBNYXRoLnNpbih0aGV0YSAqIG4gKyBwaGkpIC0gTWF0aC5zcXJ0KHQgKiB0IC0gMC4yNSkpXSk7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMCwgbCA9IHNlZ21lbnQubGVuZ3RoIC0gMSwgbW9kZWw7IGkgPCBsOyBpKyspIHtcblxuICAgICAgbW9kZWwgPSAocGFydGljbGUgPT09ICdwaG90b24nID8gdGlsZVtpICUgMl0gOiB0aWxlKTtcblxuICAgICAgZm9yKHZhciBqID0gMCwgbSA9IG1vZGVsLmxlbmd0aCwgaXRlbTsgaiA8IG07IGorKykge1xuICAgICAgICBpdGVtID0gbW9kZWxbal07XG4gICAgICAgIGJlemllci5wdXNoKGlzQXJyYXkoaXRlbSlcbiAgICAgICAgICA/IHRoaXMuZ2V0Q29vcmRpbmF0ZXNJbkJlemllcihzZWdtZW50W2ldWzBdLCBzZWdtZW50W2ldWzFdLCBzZWdtZW50W2krMV1bMF0sIHNlZ21lbnRbaSsxXVsxXSwgaXRlbVswXSwgaXRlbVsxXSlcbiAgICAgICAgICA6IGl0ZW1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmV6aWVyLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHNbQS1aXSQvLCAnJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByb2plY3QgYSBnaXZlbiAoTHApIHF1YXJ0ZXIgcGVyaW9kIGxvbmcgQmV6aWVyIHNwbGluZSAoQykgb250byBhbiAoTGwpIGRpYW1ldGVyIGNpcmNsZS5cbiAgICpcbiAgICogQHBhcmFtIHBhcnRpY2xlICAgVHlwZSBvZiBwYXJ0aWNsZSwgZS5nLjogXCJwaG90b25cIlxuICAgKiBAcGFyYW0gdGlsZSAgICAgICAoQykgQ3VydmUgc2VnbWVudFxuICAgKiBAcGFyYW0gcGVyaW9kICAgICAoTikgTGVuZ3RoIG9mIGEgMS80IHBlcmlvZFxuICAgKiBAcGFyYW0gbGVuZ3RoICAgICAoTCkgTGVuZ3RoXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFNWRyBwYXRoXG4gICAqL1xuICBsb29wOiBmdW5jdGlvbihwYXJ0aWNsZSwgdGlsZSwgcGVyaW9kLCBsZW5ndGgpIHtcblxuICAgIHZhciBjdyAgICAgID0gdHJ1ZTtcbiAgICB2YXIgdGhldGEgICA9IDIgKiBNYXRoLmFzaW4oMiAqIHBlcmlvZCAvIGxlbmd0aCk7XG4gICAgdmFyIG51bSAgICAgPSAyICogUEkgLyB0aGV0YTtcbiAgICB2YXIgc2VnbWVudCA9IFtdO1xuICAgIHZhciBsaWZ0ICAgID0gKGN3ID8gLTAuNSA6IDAuNSk7XG4gICAgdmFyIGJlemllciAgPSBbJ00nLCAocGFydGljbGUgPT09ICdnbHVvbicgPyBsaWZ0ICsgJywwJyA6ICcwLCcgKyBsaWZ0KV07XG5cbiAgICAvLyBmaW5kIHRoZSBtb2RpZmllZCBkaXN0YW5jZSBzdWNoIHRoYXQgdGhlIG51bWJlciBvZiB0aWxlcyBpcyBhbiBpbnRlZ2VyXG4gICAgZm9yKHZhciB4ID0gLTAuMSwgZGlzID0gbGVuZ3RoOyBNYXRoLmZsb29yKG51bSkgJSA0IHx8IG51bSAtIE1hdGguZmxvb3IobnVtKSA+IDAuMTsgeCArPSAwLjAwMSkge1xuXG4gICAgICBsZW5ndGggPSAoMSArIHgpICogZGlzO1xuICAgICAgdGhldGEgID0gMiAqIE1hdGguYXNpbigyICogcGVyaW9kIC8gbGVuZ3RoKTtcbiAgICAgIG51bSAgICA9IDIgKiBQSSAvIHRoZXRhO1xuICAgIH1cblxuICAgIC8vIGdldCBjb29yZGluYXRlIHBhaXJzIGZvciB0aGUgZW5kcG9pbnQgb2Ygc2VnbWVudFxuICAgIGZvcih2YXIgbiA9IDA7IG4gPD0gbnVtOyBuKyspIHtcblxuICAgICAgdmFyIHN4ID0gMC41ICogbGVuZ3RoICogKDEgLSBNYXRoLmNvcyh0aGV0YSAqIG4pKTtcbiAgICAgIHZhciBzeSA9IDAuNSAqIGxlbmd0aCAqIE1hdGguc2luKHRoZXRhICogbik7XG4gICAgICBzZWdtZW50LnB1c2goW3N4LCBzeV0pO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDAsIGwgPSBzZWdtZW50Lmxlbmd0aCAtIDEsIG1vZGVsOyBpIDwgbDsgaSsrKSB7XG5cbiAgICAgIC8vIHR3byBwaG90b24gdGlsZXMgZm9ybSBhIHBlcmlvZCB3aGVyZWFzIG9uZSBnbHVvbiB0aWxlIGlzIGEgcGVyaW9kXG4gICAgICBtb2RlbCA9IChwYXJ0aWNsZSA9PT0gJ3Bob3RvbicgPyB0aWxlW2kgJSAyXSA6IHRpbGUpO1xuXG4gICAgICAvLyBnZXQgYmV6aWVyIHBhdGggZm9yIHBob3RvbiBhbmQgZ2x1b24gYXJjXG4gICAgICBmb3IodmFyIGogPSAwLCBtID0gbW9kZWwubGVuZ3RoLCBpdGVtOyBqIDwgbTsgaisrKSB7XG5cbiAgICAgICAgaXRlbSA9IG1vZGVsW2pdO1xuICAgICAgICBiZXppZXIucHVzaChpc0FycmF5KGl0ZW0pXG4gICAgICAgICAgPyB0aGlzLmdldENvb3JkaW5hdGVzSW5CZXppZXIoc2VnbWVudFtpXVswXSwgc2VnbWVudFtpXVsxXSwgc2VnbWVudFtpKzFdWzBdLCBzZWdtZW50W2krMV1bMV0sIGl0ZW1bMF0sIGl0ZW1bMV0pXG4gICAgICAgICAgOiBpdGVtXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlemllci5qb2luKCcgJykucmVwbGFjZSgvXFxzW0EtWl0kLywgJycpICsgJyBaJztcbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBnZXRBbmdsZTogZnVuY3Rpb24oQSwgQikge1xuXG4gICAgdmFyIGRpZmZYICAgPSBCLnggLSBBLng7XG4gICAgdmFyIGRpZmZZICAgPSBCLnkgLSBBLnk7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIoZGlmZlksIGRpZmZYKSAqICgxODAuMCAvIE1hdGguUEkpO1xuICB9LFxuXG4gIGdldERpc3RhbmNlOiBmdW5jdGlvbihBLCBCKSB7XG5cbiAgICB2YXIgZGlmZlggICA9IEIueCAtIEEueDtcbiAgICB2YXIgZGlmZlkgICA9IEIueSAtIEEueTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KGRpZmZYICogZGlmZlggKyBkaWZmWSAqIGRpZmZZKTtcbiAgfVxufTsiLCJ2YXIgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBfX2V4dGVuZHM6IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9XG59OyIsInZhciBQYXJzZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9wYXJzZXJzL1BhcnNlckZhY3RvcnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEZleW5tYW4gPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEcmF3IGRpYWdyYW0gb250byBjYW52YXMuXG4gICAqIEBwYXJhbSBjYW52YXMgSWQgb2YgY2FudmFzIGVsZW1lbnRcbiAgICogQHBhcmFtIGRhdGEgICBEaWFncmFtIHByb3BlcnRpZXNcbiAgICovXG4gIEZleW5tYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMsIGRhdGEpIHtcblxuICAgIGlmICh0eXBlb2YgY2FudmFzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNhbnZhcyNpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3ZnQ2FudmFzICA9IG5ldyBTVkcoY2FudmFzKTtcbiAgICB2YXIgcGFyc2VyICAgICA9IFBhcnNlckZhY3RvcnkuZ2V0UGFyc2VyKGRhdGEubGFuZyk7XG4gICAgdmFyIHN0YWdlICAgICAgPSBwYXJzZXIucGFyc2UoZGF0YSk7XG5cbiAgICBzdGFnZS5zZXRDYW52YXMoc3ZnQ2FudmFzKS5kcmF3KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB3aW5kb3cuRmV5bm1hbiA9IEZleW5tYW47XG5cbiAgcmV0dXJuIEZleW5tYW47XG59KSgpOyIsInZhciBTdGFnZSAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vU3RhZ2UnKTtcbnZhciBQYXJ0aWNsZUdlbmVyYXRvciA9IHJlcXVpcmUoJy4vLi4vUGFydGljbGVHZW5lcmF0b3InKTtcbnZhciBDb250cm9sUG9pbnQgICAgICA9IHJlcXVpcmUoJy4vLi4vQ29udHJvbFBvaW50Jyk7XG52YXIgVmVydGV4ICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL1ZlcnRleCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcblxuICB2YXIgTGF0ZXhQYXJzZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIExhdGV4UGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmKGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJyk7XG4gICAgfVxuXG4gICAgc3RhZ2UgICAgICAgID0gbmV3IFN0YWdlKCk7XG4gICAgc3RhZ2UudGl0bGUgID0gZGF0YS50aXRsZTtcbiAgICBzdGFnZS53aWR0aCAgPSBkYXRhLndpZHRoO1xuICAgIHN0YWdlLmhlaWdodCA9IGRhdGEuaGVpZ2h0O1xuXG4gICAgZGF0YS5kaWFncmFtLmZvckVhY2goZnVuY3Rpb24oY29tbWFuZCkge1xuICAgICAgX3Byb2Nlc3NDb21tYW5kKGNvbW1hbmQpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgcmV0dXJuIHN0YWdlO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc0NvbW1hbmQgPSBmdW5jdGlvbihjb21tYW5kKSB7XG5cbiAgICB2YXIga2V5d29yZCAgID0gY29tbWFuZC5tYXRjaCgvXFx3Ky9nKVswXTtcbiAgICB2YXIgYXJncyAgICAgID0gX2V4cGxvZGVBcmdzKF9zdHJpcEN1cmxpZXMoY29tbWFuZC5tYXRjaCgvKFxceyhcXHcrLD8pK1xcfSkvZykpKTtcblxuICAgIGlmKGtleXdvcmQgIT09IHVuZGVmaW5lZCAmJiBfa2V5d29yZEZ1bmN0aW9uTWFwW2tleXdvcmRdICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgX2tleXdvcmRGdW5jdGlvbk1hcFtrZXl3b3JkXShhcmdzKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzRmVybWlvbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIHZhciBpID0gMDtcblxuICAgIHdoaWxlKGFyZ3NbMV1baSArIDFdKSB7XG5cbiAgICAgIHZhciBmcm9tSWQgPSBhcmdzWzFdW2ldO1xuICAgICAgdmFyIHRvSWQgICA9IGFyZ3NbMV1baSArIDFdO1xuICAgICAgdmFyIGZyb20gICA9IF9wcm9jZXNzUHJvcGFnYXRvclN0YXJ0RW5kKGZyb21JZCk7XG4gICAgICB2YXIgdG8gICAgID0gX3Byb2Nlc3NQcm9wYWdhdG9yU3RhcnRFbmQodG9JZCk7XG5cbiAgICAgIGlmKCFmcm9tIHx8ICF0bykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgVmVydGV4IG9yIENvbnRyb2wgUG9pbnQnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGlkICAgPSAncCcgKyBzdGFnZS5wcm9wYWdhdG9ycy5sZW5ndGggKyAxO1xuICAgICAgdmFyIHAgICAgPSBfZ2V0UGFydGljbGUoYXJnc1swXVswXSwgaWQpO1xuXG4gICAgICBwLmZyb20gICA9IGZyb207XG4gICAgICBwLnRvICAgICA9IHRvO1xuXG4gICAgICBzdGFnZS5wcm9wYWdhdG9ycy5wdXNoKHApO1xuICAgICAgaSsrO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3Byb2Nlc3NDb250cm9sUG9pbnQgPSBmdW5jdGlvbihwb3MsIGFyZ3MpIHtcblxuICAgIGFyZ3NbMF0uZm9yRWFjaChmdW5jdGlvbihjSWQpIHtcblxuICAgICAgaWYoc3RhZ2UuZ2V0Q29udHJvbFBvaW50QnlJZChjSWQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNwID0gbmV3IENvbnRyb2xQb2ludChjSWQpO1xuICAgICAgc3RhZ2UuY1BvaW50c1twb3NdLnB1c2goY3ApO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc1JpZ2h0ID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgX3Byb2Nlc3NDb250cm9sUG9pbnQoJ3JpZ2h0JywgYXJncyk7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzTGVmdCA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIF9wcm9jZXNzQ29udHJvbFBvaW50KCdsZWZ0JywgYXJncyk7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzVG9wID0gZnVuY3Rpb24oYXJncykge1xuXG4gICAgX3Byb2Nlc3NDb250cm9sUG9pbnQoJ3RvcCcsIGFyZ3MpO1xuICB9O1xuXG4gIHZhciBfcHJvY2Vzc0JvdHRvbSA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIF9wcm9jZXNzQ29udHJvbFBvaW50KCdib3R0b20nLCBhcmdzKTtcbiAgfTtcblxuICB2YXIgX3Byb2Nlc3NEb3QgPSBmdW5jdGlvbihhcmdzKSB7XG5cbiAgfTtcblxuICB2YXIgX3N0cmlwQ3VybGllcyA9IGZ1bmN0aW9uKGFyZ3MpIHtcblxuICAgIHZhciBwYXR0ZXJuID0gL1xce3xcXH0vZztcbiAgICByZXR1cm4gYXJncy5tYXAoZnVuY3Rpb24oYXJnKSB7XG4gICAgICByZXR1cm4gYXJnLnJlcGxhY2UocGF0dGVybiwgJycpO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBfZXhwbG9kZUFyZ3MgPSBmdW5jdGlvbihhcmdzKSB7XG5cbiAgICB2YXIgZXhwbG9kZWRBcmdzID0gW107XG5cbiAgICBhcmdzLmZvckVhY2goZnVuY3Rpb24oYXJnKSB7XG4gICAgICB2YXIgZSA9IGFyZy5zcGxpdCgnLCcpO1xuICAgICAgZXhwbG9kZWRBcmdzLnB1c2goZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZXhwbG9kZWRBcmdzO1xuICB9O1xuXG4gIHZhciBfZ2V0UGFydGljbGUgPSBmdW5jdGlvbih0eXBlLCBpZCkge1xuXG4gICAgdmFyIHBhcnRpY2xlO1xuXG4gICAgc3dpdGNoKHR5cGUpIHtcblxuICAgICAgY2FzZSAnZWxlY3Ryb24nOlxuICAgICAgICBwYXJ0aWNsZSA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHsgaWQ6IGlkLCB0eXBlOiAnZS0nIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3F1YXJrJzpcbiAgICAgICAgcGFydGljbGUgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZSh7IGlkOiBpZCwgdHlwZTogJ3EnIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Bob3Rvbic6XG4gICAgICAgIHBhcnRpY2xlID0gUGFydGljbGVHZW5lcmF0b3IuZ2V0UGFydGljbGUoeyBpZDogaWQsIHR5cGU6ICdwaCcgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ2x1b24nOlxuICAgICAgICBwYXJ0aWNsZSA9IFBhcnRpY2xlR2VuZXJhdG9yLmdldFBhcnRpY2xlKHsgaWQ6IGlkLCB0eXBlOiAnZycgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcGFydGljbGUgPSBQYXJ0aWNsZUdlbmVyYXRvci5nZXRQYXJ0aWNsZSh7IGlkOiBpZCwgdHlwZTogJ2UtJyB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnRpY2xlO1xuICB9O1xuXG4gIHZhciBfaXNWZXJ0ZXggPSBmdW5jdGlvbihwb2ludCkge1xuXG4gICAgcmV0dXJuIHBvaW50WzBdID09PSAndic7XG4gIH07XG5cbiAgdmFyIF9wcm9jZXNzUHJvcGFnYXRvclN0YXJ0RW5kID0gZnVuY3Rpb24oaWQpIHtcblxuICAgIHZhciBwO1xuXG4gICAgaWYoX2lzVmVydGV4KGlkKSkge1xuXG4gICAgICBwID0gc3RhZ2UuZ2V0VmVydGV4QnlJZChpZCkgPyBzdGFnZS5nZXRWZXJ0ZXhCeUlkKGlkKSA6IG5ldyBWZXJ0ZXgoaWQpO1xuXG4gICAgICBpZighc3RhZ2UuZ2V0VmVydGV4QnlJZChpZCkpIHtcbiAgICAgICAgc3RhZ2UudmVydGljZXMucHVzaChwKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuXG4gICAgICBwID0gc3RhZ2UuZ2V0Q29udHJvbFBvaW50QnlJZChpZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHA7XG4gIH07XG5cbiAgdmFyIF9rZXl3b3JkRnVuY3Rpb25NYXAgPSB7XG4gICAgJ2ZtZicgICAgICAgOiBfcHJvY2Vzc0Zlcm1pb24sXG4gICAgJ2ZtZnJpZ2h0JyAgOiBfcHJvY2Vzc1JpZ2h0LFxuICAgICdmbWZsZWZ0JyAgIDogX3Byb2Nlc3NMZWZ0LFxuICAgICdmbWZ0b3AnICAgIDogX3Byb2Nlc3NUb3AsXG4gICAgJ2ZtZmJvdHRvbScgOiBfcHJvY2Vzc0JvdHRvbSxcbiAgICAnZm1mZG90JyAgICA6IF9wcm9jZXNzRG90XG4gIH07XG5cbiAgcmV0dXJuIExhdGV4UGFyc2VyO1xufSkoKTsiLCJ2YXIgU3RhbmRhcmRQYXJzZXIgPSByZXF1aXJlKCcuL1N0YW5kYXJkUGFyc2VyJyk7XG52YXIgTGF0ZXhQYXJzZXIgICAgPSByZXF1aXJlKCcuL0xhdGV4UGFyc2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldFBhcnNlcjogZnVuY3Rpb24obGFuZykge1xuXG4gICAgaWYobGFuZyA9PT0gJ2xhdGV4Jykge1xuICAgICAgcmV0dXJuIG5ldyBMYXRleFBhcnNlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN0YW5kYXJkUGFyc2VyKCk7XG4gIH1cbn07IiwidmFyIFN0YWdlICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9TdGFnZScpO1xudmFyIFBhcnRpY2xlR2VuZXJhdG9yID0gcmVxdWlyZSgnLi8uLi9QYXJ0aWNsZUdlbmVyYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBTdGFuZGFyZFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhbmRhcmRQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcblxuICAgIF9zZXRUaXRsZShzdGFnZSwgZGF0YS50aXRsZSk7XG4gICAgX3NldExheW91dChzdGFnZSwgZGF0YS5sYXlvdXQpO1xuICAgIF9zZXREaW1lbnNpb24oc3RhZ2UsIGRhdGEud2lkdGgsIGRhdGEuaGVpZ2h0KTtcbiAgICBfc2V0U2hvd0F4ZXMoc3RhZ2UsIGRhdGEuc2hvd0F4ZXMpO1xuXG4gICAgcmV0dXJuIHN0YWdlO1xuICB9O1xuXG4gIHZhciBfc2V0VGl0bGUgPSBmdW5jdGlvbihzdGFnZSwgdGl0bGUpIHtcblxuICAgIGlmKHRpdGxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLnRpdGxlID0gdGl0bGU7XG4gICAgfVxuICB9O1xuXG4gIHZhciBfc2V0TGF5b3V0ID0gZnVuY3Rpb24oc3RhZ2UsIGxheW91dCkge1xuXG4gICAgaWYobGF5b3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmxheW91dCA9IGxheW91dDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXREaW1lbnNpb24gPSBmdW5jdGlvbihzdGFnZSwgd2lkdGgsIGhlaWdodCkge1xuXG4gICAgaWYod2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2Uud2lkdGggPSB3aWR0aDtcbiAgICB9XG4gICAgaWYoaGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmhlaWdodCA9IGhlaWdodDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRTaG93QXhlcyA9IGZ1bmN0aW9uKHN0YWdlLCBzaG93QXhlcykge1xuXG4gICAgaWYoc2hvd0F4ZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2Uuc2hvd0F4ZXMgPSBzaG93QXhlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFN0YW5kYXJkUGFyc2VyO1xufSkoKTsiLCJ2YXIgQ29vcmRpbmF0ZXMgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9Db29yZGluYXRlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgX2NvbG9yICA9ICcjMDAwJztcbiAgdmFyIF9sZW5ndGggPSAxMDk7XG5cbiAgdmFyIEFic3RyYWN0UGFydGljbGUgPSBmdW5jdGlvbihpZCwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgaWYoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGlkIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHRoaXMuaWQgICAgID0gaWQ7XG4gICAgdGhpcy5jb2xvciAgPSBjb2xvciAgfHwgX2NvbG9yO1xuICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoIHx8IF9sZW5ndGg7XG4gICAgdGhpcy5mcm9tICAgPSBudWxsO1xuICAgIHRoaXMudG8gICAgID0gbnVsbDtcbiAgICB0aGlzLnggICAgICA9IDA7XG4gICAgdGhpcy55ICAgICAgPSAwO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgQWJzdHJhY3RQYXJ0aWNsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBhYnN0cmFjdCBtZXRob2QhJyk7XG4gIH07XG5cbiAgQWJzdHJhY3RQYXJ0aWNsZS5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2FsbCBhYnN0cmFjdCBtZXRob2QhJyk7XG4gIH07XG5cbiAgQWJzdHJhY3RQYXJ0aWNsZS5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbih2ZXJ0ZXhCLCB2ZXJ0ZXhBKSB7XG5cbiAgICB2YXIgc3RhcnQgICAgPSB2ZXJ0ZXhBID8gdmVydGV4QSA6IHRoaXM7XG4gICAgdmFyIGVuZCAgICAgID0gdmVydGV4QiA/IHZlcnRleEIgOiB0aGlzO1xuICAgIHZhciBhbmdsZURpciA9IHZlcnRleEIgPyAtMSA6IDE7XG5cbiAgICB2YXIgYW5nbGUgICA9IGFuZ2xlRGlyICogQ29vcmRpbmF0ZXMuZ2V0QW5nbGUoc3RhcnQsIGVuZCk7XG4gICAgdmFyIGxlbmd0aCAgPSBDb29yZGluYXRlcy5nZXREaXN0YW5jZShzdGFydCwgZW5kKSA8IDEwMCA/IENvb3JkaW5hdGVzLmdldERpc3RhbmNlKHN0YXJ0LCBlbmQpIDogMTAwO1xuXG4gICAgcmV0dXJuIHsgeDogdmVydGV4QSA/IHN0YXJ0LnggOiB2ZXJ0ZXhCLngsIHk6IHZlcnRleEEgPyBzdGFydC55IDogdmVydGV4Qi55LCByOiBhbmdsZSwgbDogbGVuZ3RoIH07XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0UGFydGljbGU7XG5cbn0pKCk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcbnZhciBDb29yZGluYXRlcyAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0Nvb3JkaW5hdGVzJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKEVsZWN0cm9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIEVsZWN0cm9uKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBFbGVjdHJvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCBhbnRpIHx8IGZhbHNlLCBjb2xvciwgbGVuZ3RoXSk7XG4gIH1cblxuICBFbGVjdHJvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcywgdmVydGV4QiwgdmVydGV4QSkge1xuXG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbih2ZXJ0ZXhCLCB2ZXJ0ZXhBKTtcblxuICAgIHRoaXMubGVuZ3RoID0gcG9zaXRpb24ubDtcblxuICAgIGNhbnZhcy5wYXRoKHRoaXMuZ2V0UGF0aCgnbGluZScpKVxuICAgICAgICAgIC50cmFuc2Zvcm0oe1xuICAgICAgICAgICAgY3g6IHBvc2l0aW9uLngsXG4gICAgICAgICAgICBjeTogcG9zaXRpb24ueSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiBwb3NpdGlvbi5yLFxuICAgICAgICAgICAgeDogcG9zaXRpb24ueCxcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uLnlcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWxsKCdub25lJylcbiAgICAgICAgICAuc3Ryb2tlKHsgd2lkdGg6IDEsIGNvbG9yOiB0aGlzLmNvbG9yIH0pO1xuICB9O1xuXG4gIEVsZWN0cm9uLnByb3RvdHlwZS5nZXRQYXRoID0gZnVuY3Rpb24oc2hhcGUpIHtcblxuICAgIHZhciB0aWxlID0gWyBbMSwgMV0sIFsyLCAxXSBdO1xuICAgIHZhciBsICAgID0gMTtcblxuICAgIHN3aXRjaChzaGFwZSkge1xuICAgICAgY2FzZSAnbGluZSc6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZSh0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdhcmMnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmFyYygnZWxlY3Ryb24nLCB0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdsb29wJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5sb29wKCdlbGVjdHJvbicsIHRpbGUsIGwsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBCZXppZXIubGluZSh0aWxlLCBsLCB0aGlzLmxlbmd0aCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBFbGVjdHJvbjtcblxufSkoQWJzdHJhY3RQYXJ0aWNsZSk7IiwidmFyIEtsYXNzICAgICAgICAgICAgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvS2xhc3MnKTtcbnZhciBBYnN0cmFjdFBhcnRpY2xlID0gcmVxdWlyZSgnLi9BYnN0cmFjdFBhcnRpY2xlJyk7XG52YXIgQmV6aWVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9CZXppZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKEdsdW9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIEdsdW9uKGlkLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBHbHVvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCB1bmRlZmluZWQsIGNvbG9yIHx8ICcjMDA5OTMzJywgbGVuZ3RoIHx8IDk2XSk7XG4gIH1cblxuICBHbHVvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gICAgdmFyIHBhdGggPSB0aGlzLmdldFBhdGgoJ2FyYycpO1xuICAgIGNhbnZhcy5wYXRoKHBhdGgsIHRydWUpXG4gICAgICAuZmlsbCgnbm9uZScpXG4gICAgICAuc3Ryb2tlKHsgd2lkdGg6IDEsIGNvbG9yOiB0aGlzLmNvbG9yIH0pXG4gICAgICAudHJhbnNsYXRlKDE1MCwgMTUwKTtcbiAgfTtcblxuICBHbHVvbi5wcm90b3R5cGUuZ2V0UGF0aCA9IGZ1bmN0aW9uKHNoYXBlKSB7XG5cbiAgICB2YXIgZ2x1b24gPSB7XG4gICAgICB3aWR0aCAgOiAxNSwgICAvLyB0aGUgY29pbCB3aWR0aCBvZiBnbHVvbiBwcm9wYWdhdG9yc1xuICAgICAgaGVpZ2h0IDogMTUsICAgLy8gdGhlIGNvaWwgaGVpZ2h0IG9mIGdsdW9uIHByb3BhZ2F0b3JzXG4gICAgICBmYWN0b3IgOiAwLjc1LCAvLyB0aGUgZmFjdG9yIHBhcmFtZXRlciBmb3IgZ2x1b24gcHJvcGFnYXRvcnNcbiAgICAgIHBlcmNlbnQ6IDAuNiwgIC8vIHRoZSBwZXJjZW50IHBhcmFtZXRlciBmb3IgZ2x1b24gcHJvcGFnYXRvcnNcbiAgICAgIHNjYWxlICA6IDEuMTUgIC8vIHRoZSBzY2FsZSBwYXJhbWV0ZXIgZm9yIGdsdW9uIGFyY3MgYW5kIGxvb3BzXG4gICAgfTtcblxuICAgIHZhciBrYXBwYSA9IDAuNTUxOTE1MDI7XG4gICAgLy8gYSBhbmQgYiBhcmUgb25lLWhhbGYgb2YgdGhlIGVsbGlwc2UncyBtYWpvciBhbmQgbWlub3IgYXhlc1xuICAgIHZhciBhICAgICA9IGdsdW9uLmhlaWdodCAqIGdsdW9uLmZhY3RvcjtcbiAgICB2YXIgYiAgICAgPSBnbHVvbi53aWR0aCAgKiBnbHVvbi5wZXJjZW50O1xuICAgIC8vIGMgYW5kIGQgYXJlIG9uZS1oYWxmIG9mIG1ham9yIGFuZCBtaW5vciBheGVzIG9mIHRoZSBvdGhlciBlbGxpcHNlXG4gICAgdmFyIGMgICAgID0gZ2x1b24uaGVpZ2h0ICogKGdsdW9uLmZhY3RvciAtIDAuNSk7XG4gICAgdmFyIGQgICAgID0gZ2x1b24ud2lkdGggICogKDEgLSBnbHVvbi5wZXJjZW50KTtcblxuICAgIHZhciBkaXIgICA9IGZhbHNlO1xuICAgIHZhciBwdHMgICA9IChkaXJcbiAgICAgID8gW1swLCAwXSwgJ0EgJyArIGEgKyAnICcgKyBiLCAwLCAwLCAxLCBbYSwgYl0sXG4gICAgICAgICAgICAgICAgICdBICcgKyBjICsgJyAnICsgZCwgMCwgMSwgMSwgW2EgLSAyICogYywgYl0sXG4gICAgICAgICAgICAgICAgICdBICcgKyBhICsgJyAnICsgYiwgMCwgMCwgMV1cbiAgICAgIDogW1swLCAwXSwgJ0EgJyArIGEgKyAnICcgKyBiLCAwLCAwLCAwLCBbYSwgLWJdLFxuICAgICAgICAgICAgICAgICAnQSAnICsgYyArICcgJyArIGQsIDAsIDEsIDAsIFthIC0gMiAqIGMsIC1iXSxcbiAgICAgICAgICAgICAgICAgJ0EgJyArIGEgKyAnICcgKyBiLCAwLCAwLCAwXVxuICAgICk7XG5cbiAgICBhID0gKGRpciA/IGEgOiBnbHVvbi5zY2FsZSAqIGEpO1xuICAgIHZhciBsaWZ0ID0gYSAvIE1hdGgucG93KHRoaXMubGVuZ3RoLCAwLjYpO1xuXG4gICAgdmFyIHRpbGUgPSAoZGlyXG4gICAgICA/IFsnQycsIFtrYXBwYSAqIGEsIGxpZnRdLCBbYSwgYiAtIGthcHBhICogYl0sIFthLCBiXSxcbiAgICAgICAgICdDJywgW2EsIGIgKyBrYXBwYSAqIGRdLCBbYSAtIGMgKyBrYXBwYSAqIGMsIGIgKyBkXSwgW2EgLSBjLCBiICsgZF0sXG4gICAgICAgICAnUycsIFthIC0gMiAqIGMsIGIgKyBrYXBwYSAqIGRdLCBbYSAtIDIgKiBjLCBiXSxcbiAgICAgICAgICdDJywgW2EgLSAyICogYywgYiAtIGthcHBhICogYl0sIFsyICogKGEgLSBjKSAtIGthcHBhICogYSwgMF0sIFsyICogKGEgLSBjKSwgLWxpZnRdXVxuICAgICAgOiBbJ0MnLCBba2FwcGEgKiBhLCBsaWZ0XSwgW2EsIC1iICsga2FwcGEgKiBiXSwgW2EsIC1iXSxcbiAgICAgICAgICdDJywgW2EsIC1iIC0ga2FwcGEgKiBkXSwgW2EgLSBjICsga2FwcGEgKiBjLCAtYiAtIGRdLCBbYSAtIGMsIC1iIC0gZF0sXG4gICAgICAgICAnUycsIFthIC0gMiAqIGMsIC1iIC0ga2FwcGEgKiBkXSwgW2EgLSAyICogYywgLWJdLFxuICAgICAgICAgJ0MnLCBbYSAtIDIgKiBjLCAtYiArIGthcHBhICogYl0sIFsyICogKGEgLSBjKSAtIGthcHBhICogYSwgMF0sIFsyICogKGEgLSBjKSwgLWxpZnRdXVxuICAgICk7XG5cbiAgICBzd2l0Y2goc2hhcGUpIHtcbiAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUocHRzLCBnbHVvbi5oZWlnaHQsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGNhc2UgJ2FyYyc6XG4gICAgICAgIHJldHVybiBCZXppZXIuYXJjKCdnbHVvbicsIHRpbGUsIGEgLSBjLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdsb29wJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5sb29wKCdnbHVvbicsIHRpbGUsIGEgLSBjLCB0aGlzLmxlbmd0aCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUocHRzLCBnbHVvbi5oZWlnaHQsIHRoaXMubGVuZ3RoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIEdsdW9uO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcbnZhciBCZXppZXIgICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL0JlemllcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbihfc3VwZXIpIHtcblxuICBLbGFzcy5fX2V4dGVuZHMoUGhvdG9uLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIFBob3RvbihpZCwgY29sb3IsIGxlbmd0aCkge1xuXG4gICAgUGhvdG9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBbaWQsIHVuZGVmaW5lZCwgY29sb3IgfHwgJyMwMDY2RkYnLCBsZW5ndGggfHwgMTA5XSk7XG4gIH1cblxuICBQaG90b24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjYW52YXMsIHZlcnRleEIsIHZlcnRleEEpIHtcblxuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb24odmVydGV4QiwgdmVydGV4QSk7XG5cbiAgICB0aGlzLmxlbmd0aCA9IHBvc2l0aW9uLmw7XG5cbiAgICB2YXIgcGF0aCA9IHRoaXMuZ2V0UGF0aCgnbGluZScpO1xuICAgIGNhbnZhcy5wYXRoKHBhdGgsIHRydWUpXG4gICAgICAgICAgLnRyYW5zZm9ybSh7XG4gICAgICAgICAgICBjeDogcG9zaXRpb24ueCxcbiAgICAgICAgICAgIGN5OiBwb3NpdGlvbi55LFxuICAgICAgICAgICAgcm90YXRpb246IHBvc2l0aW9uLnIsXG4gICAgICAgICAgICB4OiBwb3NpdGlvbi54LFxuICAgICAgICAgICAgeTogcG9zaXRpb24ueVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbGwoJ25vbmUnKVxuICAgICAgICAgIC5zdHJva2UoeyB3aWR0aDogMSwgY29sb3I6IHRoaXMuY29sb3IgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcHJveGltYXRpb24gb2YgdGhlIGZpcnN0IHF1YXJ0ZXIgb2Ygb25lIHBlcmlvZCBvZiBhIHNpbmUgY3VydmVcbiAgICogaXMgYSBjdWJpYyBCZXppZXIgY3VydmUgd2l0aCB0aGUgZm9sbG93aW5nIGNvbnRyb2wgcG9pbnRzOlxuICAgKlxuICAgKiAoMCwgMCkgKGxhbWJkYSAqIHAgLyBQSSwgbGFtYmRhICogYSAvIDIpICgyICogcCAvIFBJLCBhKSAocCwgYSlcbiAgICpcbiAgICogUmVmZXJlbmNlczpcbiAgICpcbiAgICogWzFdIGh0dHA6Ly9tYXRoYi5pbi8xNDQ3XG4gICAqIFsyXSBodHRwczovL2dpdGh1Yi5jb20vcGhvdGluby9qcXVlcnktZmV5bi9ibG9iL21hc3Rlci9qcy9qcXVlcnkuZmV5bi0xLjAuMS5qc1xuICAgKlxuICAgKiBAcGFyYW0gc2hhcGVcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuICBQaG90b24ucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbihzaGFwZSkge1xuXG4gICAgdmFyIFBJICAgICA9IE1hdGguUEk7XG4gICAgdmFyIGxhbWJkYSA9IDAuNTExMjg3MzM7XG4gICAgdmFyIGEgICAgICA9IDU7XG4gICAgdmFyIGIgICAgICA9IDAuNSAqIGxhbWJkYSAqIGE7XG4gICAgdmFyIHAgICAgICA9IDU7XG4gICAgdmFyIHEgICAgICA9IDIgKiBwIC8gUEk7XG4gICAgdmFyIHQgICAgICA9IGxhbWJkYSAqIHAgLyBQSTtcbiAgICB2YXIgZGlyICAgID0gZmFsc2U7XG5cbiAgICB2YXIgcHRzID0gKGRpclxuICAgICAgPyBbWzAsIDBdLCAnQycsIFt0LCAtYl0sIFtxLCAtYV0sIFtwLCAtYV0sXG4gICAgICAgICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgLWJdLCBbMiAqIHAsIDBdLFxuICAgICAgICAgICAgICAgICAnUycsIFsyICogcCArIHEsIGFdLCBbMyAqIHAsIGFdLFxuICAgICAgICAgICAgICAgICAnUycsIFs0ICogcCAtIHQsIGJdXVxuICAgICAgOiBbWzAsIDBdLCAnQycsIFt0LCBiXSwgW3EsIGFdLCBbcCwgYV0sXG4gICAgICAgICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgYl0sIFsyICogcCwgMF0sXG4gICAgICAgICAgICAgICAgICdTJywgWzIgKiBwICsgcSwgLWFdLCBbMyAqIHAsIC1hXSxcbiAgICAgICAgICAgICAgICAgJ1MnLCBbNCAqIHAgLSB0LCAtYl1dXG4gICAgKTtcblxuICAgIHZhciB0aWxlID0gKGRpclxuICAgICAgPyBbWydDJywgW3QsIC1iXSwgW3EsIC1hXSwgW3AsIC1hXSxcbiAgICAgICAgICAnUycsIFsyICogcCAtIHQsIC1iXSwgWzIgKiBwICsgMC41LCAwXV0sXG4gICAgICAgICBbJ0MnLCBbdCwgYl0sIFtxLCBhXSwgW3AsIGFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgLWJdLCBbMiAqIHAgLSAwLjUsIDBdXV1cbiAgICAgIDogW1snQycsIFt0LCBiXSwgW3EsIGFdLCBbcCwgYV0sXG4gICAgICAgICAgJ1MnLCBbMiAqIHAgLSB0LCBiXSwgWzIgKiBwIC0gMC41LCAwXV0sXG4gICAgICAgICBbJ0MnLCBbdCwgLWJdLCBbcSwgLWFdLCBbcCwgLWFdLFxuICAgICAgICAgICdTJywgWzIgKiBwIC0gdCwgLWJdLCBbMiAqIHAgKyAwLjUsIDBdXV1cbiAgICApO1xuXG4gICAgc3dpdGNoKHNoYXBlKSB7XG4gICAgICBjYXNlICdsaW5lJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5saW5lKHB0cywgNCAqIHAsIHRoaXMubGVuZ3RoKTtcbiAgICAgIGNhc2UgJ2FyYyc6XG4gICAgICAgIHJldHVybiBCZXppZXIuYXJjKCdwaG90b24nLCB0aWxlLCBwLCB0aGlzLmxlbmd0aCk7XG4gICAgICBjYXNlICdsb29wJzpcbiAgICAgICAgcmV0dXJuIEJlemllci5sb29wKCdwaG90b24nLCB0aWxlLCBwLCB0aGlzLmxlbmd0aCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gQmV6aWVyLmxpbmUocHRzLCA0ICogcCwgdGhpcy5sZW5ndGgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gUGhvdG9uO1xuXG59KShBYnN0cmFjdFBhcnRpY2xlKTsiLCJ2YXIgS2xhc3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9LbGFzcycpO1xudmFyIEFic3RyYWN0UGFydGljbGUgPSByZXF1aXJlKCcuL0Fic3RyYWN0UGFydGljbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG5cbiAgS2xhc3MuX19leHRlbmRzKFF1YXJrLCBfc3VwZXIpO1xuXG4gIGZ1bmN0aW9uIFF1YXJrKGlkLCBhbnRpLCBjb2xvciwgbGVuZ3RoKSB7XG5cbiAgICBRdWFyay5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgW2lkLCBhbnRpIHx8IGZhbHNlLCBjb2xvciwgbGVuZ3RoXSk7XG4gIH1cblxuICBRdWFyay5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNhbnZhcykge1xuXG4gIH07XG5cbiAgUXVhcmsucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbigpIHtcblxuICAgIHJldHVybiAnJztcbiAgfTtcblxuICByZXR1cm4gUXVhcms7XG5cbn0pKEFic3RyYWN0UGFydGljbGUpOyJdfQ==
(8)
});
;