var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');

module.exports = (function(_super) {

  Klass.__extends(Gluon, _super);

  function Gluon(id, color, length) {

    Gluon.__super__.constructor.apply(this, [id, undefined, color || '#009933', length || 96]);
  }

  Gluon.prototype.draw = function(canvas) {

    var loopLength = 12;
    var loops      = Math.floor(this.length / loopLength);
    var pathString = '';

    for(var i = 0; i < loops; i++) {

      if(i === 0) {
        pathString += 'M';
      }

      pathString += (i * 12) + ',1 Q' + (i * 12 + 3) + ',1 ' + (i * 12 + 6) + ',2 Q' + (i * 12 + 9) + ',4 ' + (i * 12 + 10) + ',9 Q' + (i * 12 + 12) + ',15 ' + (i * 12 + 6) + ',15 Q' + (i * 12) + ',15 ' + (i * 12 + 2) + ',9 Q' + (i * 12 + 3) + ',4 ' + (i * 12 + 6) + ',2 Q' + (i * 12 + 9) + ',1 '

      if(i + 1 === loops) {
        pathString += (i * 12 + 12) + ',0'
      }
    }

    if(canvas) {

      canvas.path(pathString, true).fill('none').stroke({ width: 1, color: this.color });
      return this;
    }

    return pathString;
  };

  Gluon.prototype.getPath = function() {

    return '';
  };

  return Gluon;

})(AbstractParticle);