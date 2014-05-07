(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function () {
  
  function Stage(canvas, stageData) {

    if(typeof canvas === 'undefined') {
      throw new Error('Missing canvas argument.');
    }

    if(typeof stageData === 'undefined') {
      throw new Error('Missing data argument.');
    }

    this.canvas = canvas;
    this.data   = stageData;

    return this;
  }

  Stage.prototype.draw = function() {

    _drawCanvas.bind(this)();
    _drawTitle.bind(this)();
    _drawPropagators.bind(this)();
    _drawVertices.bind(this)();
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

  var _drawVertices = function(ctx) {

    var ui = this.canvas.group();

    this.data.vertices.forEach(function(v) {
      
    });
  };

  var _drawPropagators = function(ctx) {

  };

  var _calculateControlPointLocations = function(ctx) {

  };

  var _calculateVertexLocations = function(ctx) {

  };

  return Stage;
})();
},{}],2:[function(require,module,exports){
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
        //   id   : 'p1',
        //   type : 'photon',
        //   from : 'i1',
        //   to   : 'v1'
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
          //   id: 'i1'
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
},{"./helpers/Klass":3}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
    var stage      = new Stage(svgCanvas, stageData);

    stage.draw();

    return this;
  };

  window.Feynman = Feynman;

  return Feynman;
})();
},{"./Stage":1,"./parsers/ParserFactory":6}],5:[function(require,module,exports){
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

      data.particles.push({ id: id, from: fromId, to: toId, type: args[0][0] });
      i++;
    }
  };

  var _processControlPoint = function(pos, args) {

    args[0].forEach(function(pId) {

      if(_getControlPointById(pId)) {
        return;
      }

      data.cPoints[pos].push({ id: pId });
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
      explodedArgs.push(e);
    });

    return explodedArgs;
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
},{"./../StageStructure":2,"./../helpers/Klass":3}],6:[function(require,module,exports){
var LatexParser = require('./LatexParser');

module.exports = {

  getParser: function(data) {

    switch(data.lang) {
      default:
        return new LatexParser(data);
    }
  }
};
},{"./LatexParser":5}]},{},[4])