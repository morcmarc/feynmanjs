var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');
var Bezier           = require('./../helpers/Bezier');
var Coordinates      = require('./../helpers/Coordinates');

module.exports = (function(_super) {

  Klass.__extends(Quark, _super);

  function Quark(id, color, length) {

    Quark.__super__.constructor.apply(this, [id, color, length]);
  }

  Quark.prototype.draw = function(canvas, vertexB, vertexA) {

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

  Quark.prototype.getPath = function(shape) {

    var tile = [ [1, 1], [2, 1] ];
    var l    = 1;

    switch(shape) {
      case 'line':
        return Bezier.line(tile, l, this.length);
      case 'arc':
        return Bezier.arc('quark', tile, l, this.length);
      case 'loop':
        return Bezier.loop('quark', tile, l, this.length);
      default:
        return Bezier.line(tile, l, this.length);
    }
  };

  return Quark;

})(AbstractParticle);