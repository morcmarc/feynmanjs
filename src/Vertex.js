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

    stage.canvas
         .circle(4)
         .fill({ color: '#000' })
         .translate( this.x - 2, this.y - 2 );
  };

  /**
   *
   * Get pixel coordinates depending on position and canvas size
   *
   * Example:
   *
   * (l1 / t1)    (t2)    (r1 / t3)
   *
   *   (l2)                  (r2)
   *
   * (l3 / b1)    (b2)    (r3 / b3)
   *
   * @param vertex
   * @param stage
   * @returns {*[]}
   * @private
   */
  var _getVertexCoordinates = function(vertex, stage) {

    var numberOfVerticesOnEdge = stage.vertices[vertex.position[0]].length;

    var wUnit = Math.floor(stage.width  / (numberOfVerticesOnEdge + 2));
    var hUnit = Math.floor(stage.height / (numberOfVerticesOnEdge + 1));

    var x = 0;
    var y = 0;

    switch(vertex.position[0]) {
      case 'left':
        x = wUnit;
        y = vertex.position[1] * hUnit;
        break;
      case 'right':
        x = (numberOfVerticesOnEdge + 1) * wUnit;
        y = vertex.position[1] * hUnit;
        break;
      case 'top':
        x = vertex.position[1] * wUnit;
        y = hUnit;
        break;
      case 'bottom':
        x = vertex.position[1] * wUnit;
        y = 3 * hUnit;
        break;
    }

    return [x, y];
  };

  return Vertex;
})();