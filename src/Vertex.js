module.exports = (function() {

  var Vertex = function(id, inbound, outbound) {

    if(id === undefined) {
      throw new Error('Missing id argument!');
    }

    if(inbound === undefined && outbound === undefined) {
      throw new Error('Vertices must have either an inbound or outbound attribute!');
    }

    if(inbound !== undefined && inbound.length === 0 && outbound !== undefined && outbound.length === 0) {
      throw new Error('Vertices must have either an inbound or outbound attribute!');
    }

    this.id       = id;
    this.inbound  = inbound  || [];
    this.outbound = outbound || [];
    this.x        = 0;
    this.y        = 0;

    return this;
  };

  Vertex.prototype.draw = function(canvas) {

    canvas.circle(3)
          .fill({ color: '#000' })
          .translate(this.x, this.y);
  };

  return Vertex;
})();