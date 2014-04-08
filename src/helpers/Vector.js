module.exports = {

  normalize: function() {

    var str = '';

    for(var i = 0, l = arguments.length, item; i < l; i++) {

      item = arguments[i];
      str += ' ' + (typeof item !== 'number' ?
        item :
        item.toFixed(3).replace(/(.\d*?)0+$/, '$1').replace(/\.$/, '')
      );
    }
    var trimmed = str.trim();

    return trimmed.replace(/ ?, ?/g, ',');
  },

  /**
   *
   * @param sx
   * @param sy
   * @param ex
   * @param ey
   * @param x
   * @param y
   * @returns {*}
   */
  getPoint: function(sx, sy, ex, ey, x, y) {

    var ang = Math.atan2(ey - sy, ex - sx);

    return this.normalize(x * Math.cos(ang) - y * Math.sin(ang) + sx, ',', x * Math.sin(ang) + y * Math.cos(ang) + sy);
  }
};