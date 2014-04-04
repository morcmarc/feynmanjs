module.exports = (function() {

  var _color  = '#000';
  var _length = 100;

  var Electron = function(id, anti, color, length) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    this.anti   = anti   || false;
    this.color  = color  || _color;
    this.length = length || _length;

    return this;
  };

  Electron.prototype.draw = function(canvas) {

  };

  return Electron;
})();