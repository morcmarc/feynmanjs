var Coordinates      = require('./../helpers/Coordinates');

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