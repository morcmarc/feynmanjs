var PointHelper = require('./../helpers/Point');
var ArrayHelper = require('./../helpers/Array');
var Bezier      = require('./../helpers/Bezier');

module.exports = {

  _defaults: {
    type          : 'gluon',
    from          : { x: 0, y: 0 },
    to            : { x: 0, y: 0 },
    label         : '',
    right         : false,
    left          : false,
    tension       : 1,
    tag           : '',
    color         : '#009933',
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
    var position = PointHelper.getPositionValues(options.from, options.to);
    var shape    = 'line';
    var arcDir   = true;

    if(options.left || options.right) {
      shape  = typeof options.left === 'number' || typeof options.right === 'number' || options.left === true || options.right === true ? 'arc' : 'line';
      arcDir = options.right !== undefined ? 1 : -1;
    }

    ui
      .path(this.getPath(shape, options))
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
  getPath: function(shape, options) {

    var position = PointHelper.getPositionValues(options.from, options.to);
    var length   = position.l;

    var gluon = {
      width  : 13,   // the coil width of gluon propagators
      height : 13,   // the coil height of gluon propagators
      factor : 0.75, // the factor parameter for gluon propagators
      percent: 0.6,  // the percent parameter for gluon propagators
      scale  : 1.15  // the scale parameter for gluon arcs and loops
    };

    var kappa = 0.55191502;
    // a and b are one-half of the ellipse's major and minor axes
    var a     = gluon.height * gluon.factor;
    var b     = gluon.width  * gluon.percent;
    // c and d are one-half of major and minor axes of the other ellipse
    var c     = gluon.height * (gluon.factor - 0.5);
    var d     = gluon.width  * (1 - gluon.percent);

    var dir   = true;
    var pts   = (dir
      ? [[0, 0], 'A ' + a + ' ' + b, 0, 0, 1, [a, b],
                 'A ' + c + ' ' + d, 0, 1, 1, [a - 2 * c, b],
                 'A ' + a + ' ' + b, 0, 0, 1]
      : [[0, 0], 'A ' + a + ' ' + b, 0, 0, 0, [a, -b],
                 'A ' + c + ' ' + d, 0, 1, 0, [a - 2 * c, -b],
                 'A ' + a + ' ' + b, 0, 0, 0]
    );

    a = (dir ? a : gluon.scale * a);
    var lift = a / Math.pow(this.length, 0.6);

    var tile = (dir
      ? ['C', [kappa * a, lift], [a, b - kappa * b], [a, b],
         'C', [a, b + kappa * d], [a - c + kappa * c, b + d], [a - c, b + d],
         'S', [a - 2 * c, b + kappa * d], [a - 2 * c, b],
         'C', [a - 2 * c, b - kappa * b], [2 * (a - c) - kappa * a, 0], [2 * (a - c), -lift]]
      : ['C', [kappa * a, lift], [a, -b + kappa * b], [a, -b],
         'C', [a, -b - kappa * d], [a - c + kappa * c, -b - d], [a - c, -b - d],
         'S', [a - 2 * c, -b - kappa * d], [a - 2 * c, -b],
         'C', [a - 2 * c, -b + kappa * b], [2 * (a - c) - kappa * a, 0], [2 * (a - c), -lift]]
    );

    switch(shape) {
      case 'line':
        return Bezier.line(pts, gluon.height, length);
      case 'arc':
        return Bezier.arc('gluon', tile, a - c, length);
      case 'loop':
        return Bezier.loop('gluon', tile, a - c, length);
      default:
        return Bezier.line(pts, gluon.height, length);
    }
  }
};