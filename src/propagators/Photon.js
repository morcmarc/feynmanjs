var Klass            = require('./../helpers/Klass');
var AbstractParticle = require('./AbstractParticle');
var Bezier           = require('./../helpers/Bezier');

module.exports = (function(_super) {

  Klass.__extends(Photon, _super);

  function Photon(id, color, length, anti, style) {

    Photon.__super__.constructor.apply(this, [id, color || '#0066FF', length || 109]);

    this.anti = anti;
    this.style = style || 'line';
  }

  Photon.prototype.draw = function(canvas, vertexB, vertexA) {

    var position = this.getPosition(vertexB, vertexA);

    this.length = position.l;

    var path = this.getPath(this.style);
    canvas.path(path, true)
          .transform({
            cx: position.x,
            cy: position.y,
            rotation: position.r,
            x: position.x,
            y: position.y
          })
          .fill('none')
          .stroke({ width: 2, color: this.color });
  };

  /**
   * Approximation of the first quarter of one period of a sine curve
   * is a cubic Bezier curve with the following control points:
   *
   * (0, 0) (lambda * p / PI, lambda * a / 2) (2 * p / PI, a) (p, a)
   *
   * References:
   *
   * [1] http://mathb.in/1447
   * [2] https://github.com/photino/jquery-feyn/blob/master/js/jquery.feyn-1.0.1.js
   *
   * @param shape
   * @returns {*}
   */
  Photon.prototype.getPath = function(shape) {

    var PI     = Math.PI;
    var lambda = 0.51128733;
    var a      = 5;
    var b      = 0.5 * lambda * a;
    var p      = 5;
    var q      = 2 * p / PI;
    var t      = lambda * p / PI;
    var dir    = false;

    var pts = (dir
      ? [[0, 0], 'C', [t, -b], [q, -a], [p, -a],
                 'S', [2 * p - t, -b], [2 * p, 0],
                 'S', [2 * p + q, a], [3 * p, a],
                 'S', [4 * p - t, b]]
      : [[0, 0], 'C', [t, b], [q, a], [p, a],
                 'S', [2 * p - t, b], [2 * p, 0],
                 'S', [2 * p + q, -a], [3 * p, -a],
                 'S', [4 * p - t, -b]]
    );

    var tile = (dir
      ? [['C', [t, -b], [q, -a], [p, -a],
          'S', [2 * p - t, -b], [2 * p + 0.5, 0]],
         ['C', [t, b], [q, a], [p, a],
          'S', [2 * p - t, -b], [2 * p - 0.5, 0]]]
      : [['C', [t, b], [q, a], [p, a],
          'S', [2 * p - t, b], [2 * p - 0.5, 0]],
         ['C', [t, -b], [q, -a], [p, -a],
          'S', [2 * p - t, -b], [2 * p + 0.5, 0]]]
    );

    switch(shape) {
      case 'line':
        return Bezier.line(pts, 4 * p, this.length);
      case 'arc':
        return Bezier.arc('photon', tile, p, this.length);
      case 'loop':
        return Bezier.loop('photon', tile, p, this.length);
      default:
        return Bezier.line(pts, 4 * p, this.length);
    }
  };

  return Photon;

})(AbstractParticle);