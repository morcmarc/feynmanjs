var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Electron, _super);

  function Electron(id, anti, color, length) {

    Electron.__super__.constructor.apply(this, [id, anti || false, color, length]);
  }

  Electron.prototype.draw = function(canvas) {

    canvas.line(0, 0, this.length, 0).fill(this.color).stroke({
      width: 1,
      color: this.color
    });

    var polygonString, x1, x2, x3, y1, y2, y3;
    x1 = this.length / 2 + 5;
    y1 = 0;
    x2 = this.length / 2 - 5;
    y2 = 3;
    x3 = this.length / 2 - 5;
    y3 = -3;
    polygonString = '' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3;

    canvas.polygon(polygonString).fill(this.color);
  };

  Electron.prototype.getPath = function() {

    return '';
  };

  return Electron;

})(AbstractParticle);