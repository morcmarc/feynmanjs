module.exports = (function() {

  var Vertex = function(id) {

    this.id      = id;
    this.visible = false;
    this.level   = 1;
    this.x       = 0;
    this.y       = 0;

    return this;
  };

  Vertex.prototype.draw = function(stage) {

    if(!this.visible) {
      return;
    }

    var uiGroup = stage.canvas.group();
    var penSize = stage.canvas.penSize === 'thick' ? 2 : 1;

    uiGroup
      .circle(penSize * 4)
      .fill({ color: '#000' })
      .translate( this.x - (penSize * 2), this.y - (penSize * 2) );
  };

  return Vertex;
})();