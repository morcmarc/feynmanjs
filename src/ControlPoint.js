module.exports = (function() {

  var ControlPoint = function(id, pos) {

    this.id       = id;
    this.pos      = pos;
    this.x        = 0;
    this.y        = 0;
  };

  ControlPoint.prototype.draw = function() {
    
  };

  return ControlPoint;
})();