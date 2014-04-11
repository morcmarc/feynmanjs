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

    stage = new Stage();

    data.diagram.forEach(function(command) {
      _processCommand(command);
    }, this);

    return stage;
  };

  var _processCommand = function(command) {

    var keyword   = command.match(/\w+/g)[0];
    var args      = _explodeArgs(_stripCurlies(command.match(/\{((\w+?,\w+)+)\}/g)));

    if(keyword !== undefined && _keywordFunctionMap[keyword] !== undefined) {

      _keywordFunctionMap[keyword](args);
    }
  };

  var _processFermion = function(args) {
    
  };

  var _processRight = function(args) {

    var id  = stage.vertices.length + 1;
    var vId = 'v' + id;
    var v   = new Vertex(id, ['r', id], args[0][0], args[0][1]);

    stage.vertices.push(v);
  };

  var _processLeft = function(args) {

    var id  = stage.vertices.length + 1;
    var vId = 'v' + id;
    var v   = new Vertex(id, ['l', id], args[0][0], args[0][1]);

    stage.vertices.push(v);
  };

  var _processTop = function(args) {

  };

  var _processBottom = function(args) {

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