module.exports = (function() {

  var Vertex = function(id) {

    this.id = id;
    this.visible = false;
    this.x = 0;
    this.y = 0;

    return this;
  };

  Vertex.prototype.draw = function(stage) {

    if(!this.visible) {
      return;
    }

    stage.canvas
         .circle(4)
         .fill({ color: '#000' })
         .translate( this.x - 2, this.y - 2 );
  };

  return Vertex;
})();