var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Photon, _super);

  function Photon(id, color, length) {

    Photon.__super__.constructor.apply(this, [id, undefined, color || '#0066FF', length || 120]);
  }

  Photon.prototype.draw = function(canvas) {

    var waveLength = 6;
    var waves      = Math.floor(this.length / waveLength);
    var pathString = 'M0,0';
    var up         = true;

    for(var i = 1; i < waves * 2; i++) {

      if(i % 2 === 0) {
        pathString += ' ' + (i * waveLength / 2) + ',0';
      }
      if(i % 2 === 1) {
        pathString += ' Q' + (i * waveLength / 2) + ',' + (up ? 8 : -8);
        up = !up;
      }
    }

    if(canvas) {
      canvas.path(pathString, true).fill('none').stroke({ width: 1, color: this.color });
      return this;
    }

    return pathString;
  };

  return Photon;

})(AbstractParticle);