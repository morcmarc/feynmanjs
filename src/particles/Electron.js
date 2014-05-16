var PointHelper = require('./../helpers/Point');
var ArrayHelper = require('./../helpers/Array');
var Bezier      = require('./../helpers/Bezier');

module.exports = {

  _defaults: {
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

    if(options.type !== 'plain') {
      this._drawArrow(ui, position.l, options.color ? options.color : this._defaults.color, options.type === 'antifermion');
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

  getPath: function(shape, options) {

    var position = PointHelper.getPositionValues(options.from, options.to);
    var length   = position.l;
    var tile     = [ [1, 1], [2, 1] ];
    var l        = 1;

    switch(shape) {
      case 'line':
        return Bezier.line(tile, 1, length);
      case 'arc':
        return Bezier.arc('electron', tile, 1, length);
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
    var x2 = length / 2 - coeff * 9;
    var y2 = 3.5;
    //Above-the-line
    var x3 = length / 2 - coeff * 9;
    var y3 = -3.5;
    //'x1,y1 x2,y2, x3,y3'
    var polygonString = '' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3;
    ui
      .polygon(polygonString)
      .fill(color);
  }
};