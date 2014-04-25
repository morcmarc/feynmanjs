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

    uiGroup
      .circle(8)
      .fill({ color: '#000' })
      .translate( this.x - 4, this.y - 4 );
  };

  return Vertex;
})();