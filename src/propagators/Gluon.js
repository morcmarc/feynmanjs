module.exports = (function() {

  var _color  = '#009933';
  var _length = 100;

  var Gluon = function(id, color, length) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    this.color  = color  || _color;
    this.length = length || _length;

    return this;
  };

  Gluon.prototype.draw = function(canvas) {

  };

  return Gluon;
})();