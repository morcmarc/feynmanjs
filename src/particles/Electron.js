var PointHelper = require('./../helpers/Point');
var ArrayHelper = require('./../helpers/Array');
var Bezier      = require('./../helpers/Bezier');
var Label       = require('./../helpers/Label');

var _defaults = {
  type          : 'electron',
  from          : { x: 0, y: 0 },
  to            : { x: 0, y: 0 },
  label         : '',
  right         : false,
  left          : false,
  tension       : 1,
  tag           : '',
  color         : '#000',
  bgColor       : null,
  penWidth      : 2,
  labelSide     : 'right',
  labelDistance : 10
};

module.exports = {

  draw: function(canvas, options) {

    if(!canvas) {
      return;
    }

    var opts = {};
    ArrayHelper.merge(opts, _defaults);
    ArrayHelper.merge(opts, options);

    var ui       = canvas.group();
    var position = PointHelper.getPositionValues(options.from, options.to);
    var angleRad = PointHelper.getAngle(opts.from, opts.to, true);
    var shape    = 'line';
    var arcDir   = true;
    var tension  = 2;

    if(options.left || options.right) {
      shape   = 'arc';
      arcDir  = options.right !== 0 ? -1 : 1;
      tension = options.right !== 0 ? options.right : options.left;
    }

    if(options.type !== 'plain') {
      this._drawArrow(ui, position.l, options.color ? options.color : _defaults.color, options.type === 'antifermion');
    }

    if(opts.label) {
      var label = new Label(canvas, opts, angleRad);
    }

    ui
      .path(this.getPath(shape, options, tension))
      .fill('none')
      .stroke({ width: options.penWidth ? options.penWidth : _defaults.penWidth, color: options.color ? options.color : _defaults.color })
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

  getPath: function(shape, options, tension) {

    var position = PointHelper.getPositionValues(options.from, options.to);
    var length   = position.l;
    var tile     = [ [1, 1], [2, 1] ];
    var l        = 1;

    switch(shape) {
      case 'line':
        return Bezier.line(tile, 1, length);
      case 'arc':
        return Bezier.arc('electron', tile, 1, length, tension);
      case 'loop':
        return Bezier.loop('electron', tile, 1, length);
      default:
        return Bezier.line(tile, 1, length);
    }
  },

  _drawArrow: function(ui, length, color, anti) {

    var coeff = anti ? -1 : 1;

    //On-the-line
    var x1 = length / 2 + coeff * 7;
    var y1 = 0;
    //Below-the-line
    var x2 = length / 2 - coeff * 7;
    var y2 = 3.5;
    //Above-the-line
    var x3 = length / 2 - coeff * 7;
    var y3 = -3.5;
    //'x1,y1 x2,y2, x3,y3'
    var polygonString = '' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3;
    ui
      .polygon(polygonString)
      .fill(color);
  }
};