module.exports = (function() {

  var Stage = function() {

    // Generic Attributes (optional)
    this.title       = 'Feynman';
    this.layout      = 'time-space';
    this.width       = 100;
    this.height      = 100;
    this.showAxes    = true;
    this.propagators = [];
    this.exchanges   = [];
    this.vertices    = {
      left   : [],
      right  : [],
      top    : [],
      bottom : []
    };

    return this;
  };

  Stage.prototype.getVertexById = function(id) {

    var result = undefined;

    for(var key in this.vertices) {
      if(this.vertices.hasOwnProperty(key)) {
        this.vertices[key].forEach(function(vertex) {
          if(vertex.id === id) {
            result = vertex;
          }
        });
      }
    }

    return result;
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

    for(var key in ctx.vertices) {
      if(ctx.vertices.hasOwnProperty(key)) {
        ctx.vertices[key].forEach(function(vertex) {
          vertex.draw(ctx);
        });
      }
    }
  };

  var _drawPropagators = function(ctx) {

    ctx.propagators.forEach(function(particle) {

      var startEnd = _getVerticesForPropagator(particle, ctx);

      particle.draw(ctx.canvas, startEnd.end, startEnd.start);
    });
  };

  var _getVerticesForPropagator = function(propagator, ctx) {

    var vertexA = null;
    var vertexB = null;

    for(var key in ctx.vertices) {

      if(ctx.vertices.hasOwnProperty(key)) {

        ctx.vertices[key].forEach(function(v) {
          if(v.inbound.indexOf(propagator.id) > -1) {
            vertexB = v;
          }
          if(v.outbound.indexOf(propagator.id) > -1) {
            vertexA = v;
          }
        });
      }
    }

    return { start: vertexA, end: vertexB };
  };

  return Stage;
})();