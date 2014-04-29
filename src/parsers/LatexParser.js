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

    var isMultilevel = _isMultilevel(args[1]);

    while(args[1][i + 1]) {

      var fromId = args[1][i];
      var toId   = args[1][i + 1];
      var from   = _processPropagatorStartEnd(fromId, isMultilevel);
      var to     = _processPropagatorStartEnd(toId, isMultilevel);

      if(!from || !to) {
        throw new Error('Invalid Vertex or Control Point');
      }

      var id   = 'p' + stage.propagators.length + 1;
      var p    = _getParticle(args[0][0], id, args[0][1]);

      p.from   = from;
      p.to     = to;

      stage.propagators.push(p);
      i++;
    }

    if(isMultilevel === 'opposite') {
      stage.levels += 1;
    }
  };

  var _processControlPoint = function(pos, args) {

    args[0].forEach(function(cId) {

      if(stage.getControlPointById(cId)) {
        return;
      }

      var cp = new ControlPoint(cId, pos);
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

    args[0].forEach(function(vertexId) {

      var v = stage.getVertexById(vertexId);
      v.visible = true;
    });
  };

  var _processPenSize = function(args) {

    if(args[0][0] === 'thick' || args[0][0] === 'thin') {
      stage.penSize = args[0][0];
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

  var _getParticle = function(type, id, style) {

    var particle;

    switch(type) {

      case 'electron':
        particle = ParticleGenerator.getParticle({ id: id, type: 'e-', style: style });
        break;
      case 'pozitron':
        particle = ParticleGenerator.getParticle({ id: id, type: 'e+', style: style });
        break;
      case 'quark':
        particle = ParticleGenerator.getParticle({ id: id, type: 'q', style: style });
        break;
      case 'photon':
        particle = ParticleGenerator.getParticle({ id: id, type: 'ph', style: style });
        break;
      case 'gluon':
        particle = ParticleGenerator.getParticle({ id: id, type: 'g', style: style });
        break;
      case 'antifermion':
        particle = ParticleGenerator.getParticle({ id: id, type: 'e+', style: style });
        break;
      // fermion
      default:
        particle = ParticleGenerator.getParticle({ id: id, type: 'e-', style: style });
        break;
    }

    return particle;
  };

  var _isVertex = function(point) {

    return point[0] === 'v';
  };

  var _isMultilevel = function(fermionPath) {

    var sp = stage.getControlPointById(fermionPath[0]);
    var ep = stage.getControlPointById(fermionPath[fermionPath.length - 1]);

    if((sp && ep) && (sp.pos !== ep.pos)) {
      return 'opposite';
    }
    if((sp && ep) && (sp.pos === ep.pos)) {
      return 'same';
    }
    return false;
  };

  var _processPropagatorStartEnd = function(id, isMultilevel) {

    var p;

    if(_isVertex(id)) {

      p = stage.getVertexById(id) ? stage.getVertexById(id) : new Vertex(id);

      if(isMultilevel) {
        p.level = stage.levels;
      }

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
    // 'fmfrightn' : _processNRight,
    'fmfleft'   : _processLeft,
    // 'fmfleftn'  : _processNLeft,
    'fmftop'    : _processTop,
    'fmfbottom' : _processBottom,
    'fmfdot'    : _processDot,
    'fmfpen'    : _processPenSize
  };

  return LatexParser;
})();