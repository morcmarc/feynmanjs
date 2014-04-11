module.exports = (function() {

  var Vertex = function(id, position, inbound, outbound) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    if(position === undefined) {
      throw new Error('Missing position argument!');
    }

    if(inbound === undefined && outbound === undefined) {
      throw new Error('Vertices must have either an inbound or outbound attribute!');
    }

    if(inbound !== undefined && inbound.length === 0 && outbound !== undefined && outbound.length === 0) {
      throw new Error('Vertices must have either an inbound or outbound attribute!');
    }

    this.id       = id;
    this.position = position;
    this.inbound  = inbound  || [];
    this.outbound = outbound || [];
    this.x        = 0;
    this.y        = 0;
    this.visible  = false;

    return this;
  };

  Vertex.prototype.move = function(stage) {

    var coords    = _getVertexCoordinates(this, stage);
    this.x        = coords[0];
    this.y        = coords[1];
  };

  Vertex.prototype.draw = function(stage) {

    if(!this.visible) {
      return;
    }

    this.move(stage);

    stage.canvas.circle(3)
          .fill({ color: '#000' })
          .translate(this.x, this.y);
  };

  var _getVertexCoordinates = function(vertex, stage) {

    var wUnit = Math.floor(stage.width  / 4);
    var hUnit = Math.floor(stage.height / 4);

    var x = 0;
    var y = 0;

    switch(vertex.position[0]) {
      case 'left':
        x = wUnit;
        break;
      case 'right':
        x = wUnit * 3;
        break;
    }

    y = vertex.position[1] * hUnit;

    return [x, y];
  };

  return Vertex;
})();