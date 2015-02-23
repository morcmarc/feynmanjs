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
    // Example: http://www.regexr.com/38rpl
    var rawArgs   = command.match(/\{([^{}]+)\}|\{(\$[\S]+\$)\}|\{\S+(\$[\S]+\$)\}/g);
    // Get rid of curly braces and convert comma separated args into an Array
    var args      = _explodeArgs(_stripCurlies(rawArgs,keyword));

    if(keyword !== undefined && _keywordFunctionMap[keyword] !== undefined) {
      _keywordFunctionMap[keyword](args);
    }
  };

  var _processParticle = function(args) {

    var i = 0;

    while(args[1][i + 1]) {

      var fromId = args[1][i];
      var toId   = args[1][i + 1];
      var id     = 'p' + (data.particles.length + 1);

      _processEndPoint(fromId);
      _processEndPoint(toId);

      var options = _processPropagatorOptions(args[0].slice(1));

      var rightValue = 0;
      var leftValue  = 0;

      if(options.right) {
        rightValue = typeof options.right === 'string' ? parseFloat(options.right) : 1;
      }

      if(options.left) {
        leftValue = typeof options.left === 'string' ? parseFloat(options.left) : 1;
      }

      var p = {
        id            : id,
        from          : fromId,
        to            : toId,
        type          : args[0][0],
        label         : options.label,
        labelSide     : options.side,
        labelDistance : options.dist,
        labelX        : options.labelx,
        labelY        : options.labely,
        tension       : parseFloat(options.tension),
        right         : rightValue,
        left          : leftValue,
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

  var _processLabel = function(args) {

    var obj = _getVertexById(args[0][0]);

    if(!obj) {
      obj = _getControlPointById(args[0][0]);
    }

    if(!obj) {
      return;
    }

    obj.label = args[1][0];
  };

  var _isVertex = function(point) {

    return point[0] === 'v';
  };

  var _isSubVertex = function(point) {

    return (/\*/).test(point);
  };

  var _processEndPoint = function(id) {

    if(_isVertex(id) && !_getVertexById(id)) {
      var v = { id: id };
      if(_isSubVertex(id)) {
        v.sub = true;
      }
      data.vertices.push(v);
    }
  };

  var _stripCurlies = function(args) {

    var pattern = /^\{|\}$/gm;

    return args.map(function(arg) {
      return arg.replace(pattern, '');
    });
  };

  var _explodeArgs = function(args, keyword) {

    var explodedArgs = [];

    args.forEach(function(arg) {

      // See http://www.regexr.com/38rqd
      var pattern   = new RegExp(/([\w.]+|\$[\S,]?\S+\$)=?(\$\S+,?\S+\$|[\w.*]+|#\w+)?/g);
      var matches   = pattern.exec(arg);
      var processed = [];

      while(matches !== null) {
        processed.push(matches[0]);
        matches = pattern.exec(arg);
      }

      explodedArgs.push(_processArgumentOptions(processed));
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
    'fmf'       : _processParticle,
    'fmfbottom' : _processBottom,
    'fmfbottomn': _processNBottom,
    'fmfdot'    : _processDot,
    'fmflabel'  : _processLabel,
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