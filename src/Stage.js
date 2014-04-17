module.exports = (function() {

  var Stage = function() {

    // Generic Attributes (optional)
    this.title       = 'Feynman';
    this.layout      = 'time-space';
    this.width       = 100;
    this.height      = 100;
    this.showAxes    = true;
    this.propagators = [];
    this.vertices    = [];
    this.cPoints     = {
      left   : [],
      right  : [],
      top    : [],
      bottom : []
    };

    return this;
  };

  Stage.prototype.getVertexById = function(id) {

    var result = undefined;

    this.vertices.forEach(function(v) {
      if(v.id === id) {
        result = v;
      }
    });

    return result;
  };

  Stage.prototype.getControlPointById = function(id) {

    var result = undefined;

    for(var key in this.cPoints) {
      if(this.cPoints.hasOwnProperty(key)) {
        this.cPoints[key].forEach(function(cPoint) {
          if(cPoint.id === id) {
            result = cPoint;
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

    ctx.vertices.forEach(function(vertex) {
      vertex.draw(ctx);
    });
  };

  var _drawPropagators = function(ctx) {

    ctx.propagators.forEach(function(particle) {

      var startEnd = _getVerticesForPropagator(particle, ctx);

      particle.draw(ctx.canvas, startEnd.end, startEnd.start);
    });
  };

  var _getVerticesForPropagator = function(propagator, ctx) {

    var vertexA = propagator.from;
    var vertexB = propagator.to;

//    ctx.vertices.forEach(function(v) {
//      if(v.inbound.indexOf(propagator.id) > -1) {
//        vertexB = v;
//      }
//      if(v.outbound.indexOf(propagator.id) > -1) {
//        vertexA = v;
//      }
//    });

    return { start: vertexA, end: vertexB };
  };

  return Stage;
})();