var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');
var Bezier           = require('./../helpers/Bezier');
var Coordinates      = require('./../helpers/Coordinates');

module.exports = (function(_super) {

  Klass.__extends(Quark, _super);

  function Quark(id, color, length, anti) {

    Quark.__super__.constructor.apply(this, [id, color, length]);

    this.anti = anti || false;
  }

  Quark.prototype.draw = function(canvas, vertexB, vertexA) {

    var position = this.getPosition(vertexB, vertexA);

    this.length = position.l;

    var uiGroup = canvas.group();
    var penSize = canvas.penSize === 'thick' ? 2 : 1;

    _drawArrow(uiGroup, this.length, this.color, this.anti);
    uiGroup
      .path(this.getPath('line'))
      .fill('none')
      .stroke({ width: penSize, color: this.color });
    uiGroup
      .transform({
        cx: position.x,
        cy: position.y,
        rotation: position.r,
        x: position.x,
        y: position.y
      });
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

  var _drawArrow = function(uiGroup, length, color, anti) {

    var coeff = anti ? -1 : 1;

    //On-the-line
    var x1 = length / 2 + coeff * 7;
    var y1 = 0;
    //Below-the-line
    var x2 = length / 2 - coeff * 7;
    var y2 = 4;
    //Above-the-line
    var x3 = length / 2 - coeff * 7;
    var y3 = -4;
    //'x1,y1 x2,y2, x3,y3'
    var polygonString = '' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3
    uiGroup
      .polygon(polygonString)
      .fill(color);
  };

  return Quark;

})(AbstractParticle);