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