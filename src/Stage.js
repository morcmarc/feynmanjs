module.exports = (function() {

  var Stage = function() {

    // Generic Attributes (optional)
    this.title    = 'Feynman';
    this.layout   = 'time-space';
    this.width    = 100;
    this.height   = 100;
    this.showAxes = true;

    // Main properties (required)
    this.propagators = [];
    this.vertices    = {
      left   : [],
      right  : [],
      top    : [],
      bottom : []
    };

    // Main properties (optional)
    this.exchanges   = [];

    return this;
  };

  Stage.prototype.setCanvas = function(canvas) {

    this.canvas = canvas;
    this.canvas.size(this.width, this.height);

    return this;
  };

  Stage.prototype.draw = function() {

    _drawTitle(this);
    _drawVertices(this);
    _drawPropagators(this);
    _drawExchanges(this);
    return this;
  };

  var _drawTitle = function(ctx) {

    ctx.canvas.text(ctx.title).font({
      family : 'Georgia',
      size   :  14,
      style  : 'italic',
      anchor : 'left'
    });
  };

  var _drawVertices = function(ctx) {

    // ctx.vertices.forEach(function(vertex) {
    //   vertex.draw(ctx.canvas);
    // });
  };

  var _drawPropagators = function(ctx) {

    ctx.propagators.forEach(function(particle) {
      particle.draw(ctx.canvas);
    });
  };

  var _drawExchanges = function(ctx) {

    ctx.exchanges.forEach(function(exchange) {
      exchange.draw(ctx.canvas);
    });
  };

  var _getVertexCoordinates = function(vertex, ctx) {

    var wUnit = Math.floor(ctx.width  / 4);
    var hUnit = Math.floor(ctx.height / 4);

    var x = 0;
    var y = 0;

    switch(vertex.position[0]) {
      case 'l':
        x = wUnit;
        break;
      case 'c':
        x = wUnit * 2;
        break;
      case 'r':
        x = wUnit * 3;
        break;
    }

    y = vertex.position[1] * hUnit;

    return [x, y];
  };

  return Stage;
})();