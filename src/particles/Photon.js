var PointHelper = require('./../helpers/Point');
var ArrayHelper = require('./../helpers/Array');
var Bezier      = require('./../helpers/Bezier');

module.exports = {

  _defaults: {
    type          : 'photon',
    from          : { x: 0, y: 0 },
    to            : { x: 0, y: 0 },
    label         : '',
    right         : false,
    left          : false,
    tension       : 1,
    tag           : '',
    color         : '#0066FF',
    bgColor       : null,
    penWidth      : 2,
    labelSide     : 'right',
    labelDistance : 10
  },

  draw: function(canvas, options) {

    if(!canvas) {
      return;
    }

    var ui       = canvas.group();
    var position = PointHelper.getPositionValues(options.to, options.from);
    var shape    = 'line';
    var arcDir   = 1;
    var tension  = 2;

    if(options.left || options.right) {
      shape   = 'arc';
      arcDir  = options.right !== 0 ? -1 : 1;
      tension = options.right !== 0 ? options.right : options.left;
    }

    ui
      .path(this.getPath(shape, options, tension))
      .fill('none')
      .stroke({ width: options.penWidth ? options.penWidth : this._defaults.penWidth, color: options.color ? options.color : this._defaults.color })
      .scale(1, arcDir);
    ui
      .transform({
        cx       : position.x,
        cy       : position.y,
        rotation : position.r,
        x        : position.x,
        y        : position.y
      });

    return ui;
  },

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
  getPath: function(shape, options, tension) {

    var position = PointHelper.getPositionValues(options.from, options.to);
    var length   = position.l;// + (5 - position.l % 5);

    var PI     = Math.PI;
    var lambda = 0.51128733;
    var a      = 2;
    var b      = 0.5 * lambda * a;
    var p      = 3;
    var q      = 2 * p / PI;
    var t      = lambda * p / PI;
    var dir    = true;

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
        return Bezier.line(pts, 4 * p, length);
      case 'arc':
        return Bezier.arc('photon', tile, p, length, tension);
      case 'loop':
        return Bezier.loop('photon', tile, p, length);
      default:
        return Bezier.line(pts, 4 * p, length);
    }
  }
};