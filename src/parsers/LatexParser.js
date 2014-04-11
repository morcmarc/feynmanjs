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