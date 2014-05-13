(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Electron = require('./particles/Electron');

module.exports = (function () {
  
  function Stage(canvasId, canvas, stageData) {

    if(typeof canvas === 'undefined') {
      throw new Error('Missing canvas argument.');
    }

    if(typeof stageData === 'undefined') {
      throw new Error('Missing data argument.');
    }

    this.canvasId    = canvasId;
    this.canvas      = canvas;
    this.data        = stageData;

    _calculateControlPointLocations.bind(this)();
    _calculateVertexLocations.bind(this)();

    return this;
  }

  Stage.prototype.draw = function() {

    _drawCanvas.bind(this)();
    // _drawTitle.bind(this)();
    _drawPropagators.bind(this)();
    _drawVertices.bind(this)();
  };

  Stage.prototype.getVertexById = function(id) {

    var result;

    this.data.vertices.forEach(function(v) {

      if(v.id === id) {
        result = v;
      }
    });

    return result;
  };

  Stage.prototype.getVerticesByDistance = function (dist) {
    
    var results = [];

    this.data.vertices.forEach(function(v) {

      if(v.distance === dist) {
        results.push(v);
      }
    });

    return results;
  };

  Stage.prototype.getNumberOfLevels = function () {
    
    var levels = 0;

    while(this.getVerticesByDistance(levels + 1).length > 0) {
      levels++;
    }

    return levels;
  };

  Stage.prototype.getControlPointById = function(id) {

    var result;

    for(var key in this.data.cPoints) {

      if(this.data.cPoints.hasOwnProperty(key)) {

        this.data.cPoints[key].forEach(function(cPoint) {

          if(cPoint.id === id) {
            result = cPoint;
          }
        });
      }
    }

    return result;
  };

  Stage.prototype.getParticlesStartingFromPoint = function(sP) {

    return _getParticleFromOrToPoint.bind(this)('from', sP);
  };

  Stage.prototype.getParticlesEndingInPoint = function(eP) {

    return _getParticleFromOrToPoint.bind(this)('to', eP);
  };

  var _getParticleFromOrToPoint = function(dir, point) {

    var results = [];

    this.data.particles.forEach(function(p) {

      if(p[dir] === point) {
        results.push(p);
      }
    });

    return results;
  };

  var _drawCanvas = function() {

    this.canvas.size(this.data.width, this.data.height);
  };

  var _drawTitle = function() {

    var ui = this.canvas.group();
    ui.text(this.data.title).font({
      family : 'Georgia',
      size   :  14,
      style  : 'italic',
      anchor : 'left'
    }).translate(10, 10);
  };

  var _drawVertices = function() {

    var ui = this.canvas.group();

    this.data.vertices.forEach(function(v) {
      ui.circle(6).fill('#000').translate(v.x - 3 , v.y - 3);
    });
  };

  var _drawPropagators = function() {

    var ui = this.canvas.group();

    this.data.particles.forEach(function(p) {

      p.from = this.getVertexById(p.from) ? this.getVertexById(p.from) : this.getControlPointById(p.from);
      p.to   = this.getVertexById(p.to) ? this.getVertexById(p.to) : this.getControlPointById(p.to);
      Electron.draw(this.canvas, p);
    }, this);
  };

  var _calculateControlPointLocations = function() {

    for(var key in this.data.cPoints) {

      if(this.data.cPoints.hasOwnProperty(key)) {

        // Set up variables depending on current side
        var sideA    = key === 'left'  || key === 'right'  ? this.data.height : this.data.width;
        var sideB    = key === 'left'  || key === 'right'  ? this.data.width  : this.data.height;
        var coordA   = key === 'left'  || key === 'right'  ? 'x' : 'y';
        var coordB   = key === 'left'  || key === 'right'  ? 'y' : 'x';
        var coeff    = key === 'right' || key === 'bottom' ? -1 : 1;
        // Number of parts we need to split a side into
        var segments = this.data.cPoints[key].length === 1 ? 3 : this.data.cPoints[key].length;
        // Padding on perpendicular side
        var paddingA = (sideA * 0.4) / 2;
        // Padding on parallel side
        var paddingB = (sideB * 0.1) / 2;
        // Size of a segment
        var s        = (sideA * 0.6) / (segments - 1);

        var i = this.data.cPoints[key].length === 1 ? 1 : 0;
        this.data.cPoints[key].forEach(function(cp) {
          cp[coordA] = coeff === -1 ? sideB - paddingA : paddingA;
          cp[coordB] = i * s + paddingA;
          i++;
        });
      }
    }
  };

  var _calculateVertexLocations = function() {

    _setVertexDistances.bind(this)();

    var sideA    = this.data.cPoints.left.length > 0 ? this.data.width : this.data.height;
    var sideB    = this.data.cPoints.left.length > 0 ? this.data.height : this.data.width;
    var coordA   = this.data.cPoints.left.length > 0 ? 'x' : 'y';
    var coordB   = this.data.cPoints.left.length > 0 ? 'y' : 'x';
    var paddingA = (sideA * 0.25);
    var paddingB = (sideB * 0.25);
    var stageA   = (sideA * 0.5);
    var stageB   = (sideB * 0.5);

    var level = 1;

    while(this.getVerticesByDistance(level).length > 0) {

      var vertices  = this.getVerticesByDistance(level);
      var segmentsA = this.getNumberOfLevels() === 1 ? 2 : this.getNumberOfLevels() - 1;
      var segmentsB = vertices.length === 1 ? 2 : vertices.length - 1;
      var sA        = stageA / segmentsA;
      var sB        = stageB / segmentsB;

      var counter = vertices.length === 1 ? 1 : 0;

      vertices.forEach(function(v) {

        v[coordA] = sA * (level - 1) + paddingA;
        v[coordB] = sB * counter + paddingB;
        counter++;
      });
      level++;
    }
  };

  var _setVertexDistances = function() {

    var AM    = {}; // Adjacency matrix
    var that  = this;

    var walk = function(node, distance, prev) {

      var vertex = that.getVertexById(node);

      if(vertex) {
        vertex.distance = vertex.distance ? Math.min(vertex.distance, distance) : distance;
        var adj = AM[node].filter(function(n) { return n !== prev; });
        adj.forEach(function(n) {
          walk(n, distance + 1, node);
        });
      }
    };

    this.data.particles.forEach(function(p) {

      AM[p.to]   = [];
      AM[p.from] = [];
    });

    this.data.particles.forEach(function(p) {

      AM[p.to].push(p.from);
      AM[p.from].push(p.to);
    });

    var dir = this.data.cPoints.left.length > 0 ? 'left' : 'top';

    this.data.cPoints[dir].forEach(function(cp) {

      AM[cp.id].forEach(function(v) {
        walk(v, 1);
      });
    });
  };

  return Stage;
})();
},{"./particles/Electron":10}],2:[function(require,module,exports){
var Klass = require('./helpers/Klass');

module.exports = {

  getStructure: function() {

    return Klass.__clone({
      title     : '',
      width     : 200,
      height    : 150,
      thickness : 'thick', // or 'thin'
      particles : [
        // {
          // id            : 'p1',
          // type          : 'photon',
          // from          : 'i1',
          // to            : 'v1',
          // label         : '$\tau$',
          // right         : true
          // left          : true,
          // tension       : '1/3',
          // tag           : 'tag1',
          // color         : '#F00',
          // bgColor       : '#0F0',
          // penWidth      : 5,
          // labelSide     : 'right',
          // labelDistance : 10
        // }
      ],
      vertices  : [
        // {
        //   id: 'v1',
        //   visible: true
        // }
      ],
      cPoints   : {

        left   : [
          // {
          //   id: 'i1',
          //   side: 'left'
          // }
        ],
        right  : [
          // {
          //   id: 'i1'
          // }
        ],
        top    : [
          // {
          //   id: 'i1'
          // }
        ],
        bottom : [
          // {
          //   id: 'i1'
          // }
        ]
      }
    });
  }
};
},{"./helpers/Klass":5}],3:[function(require,module,exports){
module.exports = {

  /*
  * Recursively merge properties of two objects 
  */
  merge: function (obj1, obj2) {

    for(var p in obj2) {

      if(obj2.hasOwnProperty(p)) {

        try {
          // Property in destination object set; update its value.
          if ( obj2[p].constructor === Object ) {
            obj1[p] = this.merge(obj1[p], obj2[p]);

          } else {
            obj1[p] = obj2[p] && obj1[p] ? obj2[p] : obj1[p];

          }

        } catch(e) {
          // Property in destination object not set; create it and set its value.
          obj1[p] = obj2[p];

        }
      }
    }

    return obj1;
  }
};
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var __hasProp = {}.hasOwnProperty;

module.exports = {
  __extends: function(child, parent) {

    for (var key in parent) {
      if (__hasProp.call(parent, key)) {
        child[key] = parent[key];
      }
    }

    function ctor() {
      this.constructor = child;
    }

    ctor.prototype  = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;

    return child;
  },

  __clone: function (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
};
},{}],6:[function(require,module,exports){
module.exports = {

  getAngle: function(A, B, inRadian) {

    var r = inRadian ? 1 : (180 / Math.PI);

    var diffX   = B.x - A.x;
    var diffY   = B.y - A.y;
    return Math.atan2(diffY, diffX) * r;
  },

  getDistance: function(A, B) {

    var diffX   = B.x - A.x;
    var diffY   = B.y - A.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  },

  getPositionValues: function(pA, pB) {

    var angle  = this.getAngle(pA, pB);
    var length = this.getDistance(pA, pB);

    return { x: pA.x, y: pA.y, r: angle, l: length };
  }
};
},{}],7:[function(require,module,exports){
var ParserFactory = require('./parsers/ParserFactory');
var Stage         = require('./Stage');

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
    var parser     = ParserFactory.getParser(data);
    var stageData  = parser.parse();
    var stage      = new Stage(canvas, svgCanvas, stageData);

    stage.draw();

    return this;
  };

  window.Feynman = Feynman;

  return Feynman;
})();
},{"./Stage":1,"./parsers/ParserFactory":9}],8:[function(require,module,exports){
var StageStructure = require('./../StageStructure');
var Klass = require('./../helpers/Klass');

module.exports = (function() {

  var data;

  function LatexParser(raw) {

    if(typeof raw === 'undefined') {
      throw new Error('No data given.');
    }

    this.raw = raw;

    data = StageStructure.getStructure();

    return this;
  }

  LatexParser.prototype.parse = function() {

    if(this.raw.title) {
      data.title = this.raw.title;
    }
    if(this.raw.width) {
      data.width = this.raw.width;
    }
    if(this.raw.height) {
      data.height = this.raw.height;
    }
    if(this.raw.diagram) {
      this.raw.diagram.forEach(function(command) {
        _processCommand(command);
      });
    }
    return data;
  };

  var _processCommand = function(command) {

    // Match first "word"
    var keyword   = command.match(/\w+/g)[0];
    // Match anything between curly braces { ... }
    // Example: http://www.regexr.com/38q9i
    var rawArgs   = command.match(/(\{\w+([^\}\{]|\d?)+?\})/g);
    // Get rid of curly braces and convert comma separated args into an Array
    var args      = _explodeArgs(_stripCurlies(rawArgs));

    if(keyword !== undefined && _keywordFunctionMap[keyword] !== undefined) {

      _keywordFunctionMap[keyword](args);
    }
  };

  var _processFermion = function(args) {

    var i = 0;

    while(args[1][i + 1]) {

      var fromId = args[1][i];
      var toId   = args[1][i + 1];
      var id     = 'p' + (data.particles.length + 1);

      _processEndPoint(fromId);
      _processEndPoint(toId);

      var options = _processPropagatorOptions(args[0].slice(1));
      var p = {
        id            : id,
        from          : fromId,
        to            : toId,
        type          : args[0][0],
        label         : options.label,
        labelSide     : options.side,
        labelDistance : options.dist,
        tension       : options.tension,
        right         : options.right,
        tag           : options.tag,
        color         : options.foreground,
        bgColor       : options.background,
        penWidth      : options.width
      };

      data.particles.push(p);
      i++;
    }
  };

  var _processControlPoint = function(pos, args) {

    args[0].forEach(function(pId) {

      if(_getControlPointById(pId)) {
        return;
      }

      data.cPoints[pos].push({ id: pId, x: 0, y: 0, side: pos });
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

  var _processNPos = function(pos, args) {

    var n        = parseInt(args[0], 10);
    var points   = [];
    var i        = 1;
    var idLetter = pos === 'left' || pos === 'top' ? 'i' : 'o';

    while(i <= n) {
      points.push(idLetter + i);
      i++;
    }

    _processControlPoint(pos, [points]);
  };

  var _processNRight = function(args) {

    _processNPos('right', args);
  };

  var _processNLeft = function(args) {

    _processNPos('left', args);
  };

  var _processNTop = function(args) {

    _processNPos('top', args);
  };

  var _processNBottom = function(args) {

    _processNPos('bottom', args);
  };

  var _processDot = function(args) {

    args[0].forEach(function(vId) {
      var v = _getVertexById(vId);
      if(v) {
        v.visible = true;
      }
    });
  };

  var _processPenSize = function(args) {

    if(args[0][0] === 'thick' || args[0][0] === 'thin') {
      data.thickness = args[0][0];
    }
  };

  var _isVertex = function(point) {

    return point[0] === 'v';
  };

  var _processEndPoint = function(id) {

    if(_isVertex(id) && !_getVertexById(id)) {
      data.vertices.push({ id: id });
    }
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

      e = _processArgumentOptions(e);
      explodedArgs.push(e);
    });

    return explodedArgs;
  };

  var _processArgumentOptions = function(args) {

    var processed = [];

    args.forEach(function(arg) {
      
      var pa      = arg;
      var pattern = /(\w+)\=(\S+)/g;
      var matches = pattern.exec(pa);

      if(matches && matches.length > 2) {
        var key   = matches[1];
        var value = matches[2];
        pa = {};
        pa[key] = value;
      }

      processed.push(pa);
    });

    return processed;
  };

  var _processPropagatorOptions = function(options) {

    var processed = {};

    if(options && options.length === 0) {
      return processed;
    }

    options.forEach(function(o) {
      if(typeof o === 'string') {
        processed[o] = true;
      }
      if(typeof o === 'object') {
        var key = Object.keys(o)[0];
        processed[key] = typeof o[key] === 'undefined' ? true : o[key];
      }
    });

    return processed;
  };

  var _getVertexById = function(id) {

    var result;

    data.vertices.forEach(function(v) {

      if(v.id === id) {
        result = v;
      }
    });

    return result;
  };

  var _getControlPointById = function(id) {

    var result;

    for(var key in data.cPoints) {

      if(data.cPoints.hasOwnProperty(key)) {

        data.cPoints[key].forEach(function(cPoint) {

          if(cPoint.id === id) {
            result = cPoint;
          }
        });
      }
    }

    return result;
  };

  var _keywordFunctionMap = {
    'fmf'       : _processFermion,
    'fmfbottom' : _processBottom,
    'fmfbottomn': _processNBottom,
    'fmfdot'    : _processDot,
    'fmfleft'   : _processLeft,
    'fmfleftn'  : _processNLeft,
    'fmfpen'    : _processPenSize,
    'fmfright'  : _processRight,
    'fmfrightn' : _processNRight,
    'fmftop'    : _processTop,
    'fmftopn'   : _processNTop
  };

  return LatexParser;
})();
},{"./../StageStructure":2,"./../helpers/Klass":5}],9:[function(require,module,exports){
var LatexParser = require('./LatexParser');

module.exports = {

  getParser: function(data) {

    switch(data.lang) {
      default:
        return new LatexParser(data);
    }
  }
};
},{"./LatexParser":8}],10:[function(require,module,exports){
var PointHelper = require('./../helpers/Point');
var ArrayHelper = require('./../helpers/Array');
var Bezier      = require('./../helpers/Bezier');

module.exports = {

  _defaults: {
    type          : 'electron',
    from          : { x: 0, y: 0 },
    to            : { x: 0, y: 0 },
    label         : '',
    right         : false,
    left          : false,
    tension       : 1,
    tag           : '',
    color         : '#000',
    bgColor       : null,
    penWidth      : 2,
    labelSide     : 'right',
    labelDistance : 10
  },

  draw: function(canvas, options) {

    if(!canvas) {
      return;
    }

    var ui = canvas.group();

    var position = PointHelper.getPositionValues(options.from, options.to);

    this._drawArrow(ui, position.l, options.color ? options.color : this._defaults.color, false);

    ui
      .path(this.getPath('line', options))
      .fill('none')
      .stroke({ width: options.penWidth ? options.penWidth : this._defaults.penWidth, color: options.color ? options.color : this._defaults.color });
    ui
      .transform({
        cx       : position.x,
        cy       : position.y,
        rotation : position.r,
        x        : position.x,
        y        : position.y
      });

    return ui;
  },

  getPath: function(shape, options) {

    var position = PointHelper.getPositionValues(options.from, options.to);
    var length   = position.l;
    var tile     = [ [1, 1], [2, 1] ];
    var l        = 1;

    switch(shape) {
      case 'line':
        return Bezier.line(tile, 1, length);
      case 'arc':
        return Bezier.arc('electron', tile, 1, length);
      case 'loop':
        return Bezier.loop('electron', tile, 1, length);
      default:
        return Bezier.line(tile, 1, length);
    }
  },

  _drawArrow: function(ui, length, color, anti) {

    var coeff = anti ? -1 : 1;

    //On-the-line
    var x1 = length / 2 + coeff * 7;
    var y1 = 0;
    //Below-the-line
    var x2 = length / 2 - coeff * 9;
    var y2 = 4;
    //Above-the-line
    var x3 = length / 2 - coeff * 9;
    var y3 = -4;
    //'x1,y1 x2,y2, x3,y3'
    var polygonString = '' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3;
    ui
      .polygon(polygonString)
      .fill(color);
  }
};
},{"./../helpers/Array":3,"./../helpers/Bezier":4,"./../helpers/Point":6}]},{},[7])