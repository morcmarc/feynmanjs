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
      if(v && v.id === id) {
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

    _calculateControlPointLocations(this);
    _calculateVertexLocations(this);

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

    console.log(vertexA);
    console.log(vertexB);

    return { start: vertexA, end: vertexB };
  };

  var _calculateControlPointLocations = function(ctx) {

    var segments = ctx.cPoints.left.length + 1;
    var sH = ctx.height / segments;

    var i = 1;
    ctx.cPoints.left.forEach(function(cp) {
      cp.y = i * sH;
      i++;
    });

    segments = ctx.cPoints.right.length + 1;
    sH = ctx.height / segments;

    i = 1;
    ctx.cPoints.right.forEach(function(cp) {
      cp.x = ctx.width;
      cp.y = i * sH;
      i++;
    });
  };

  var _calculateVertexLocations = function(ctx) {

    // var hMin = ctx.height * 0.3;
    // var hMax = ctx.height * 0.7;
    // var wMin = ctx.width  * 0.3;
    // var wMax = ctx.width  * 0.7;

    var segments = ctx.vertices.length + 1;
    var sW = ctx.width / segments;
    var sH = ctx.height / 2;

    var i = 1;
    ctx.vertices.forEach(function(v) {
      v.x = i * sW;
      v.y = sH;
      i++;
    });
  };

  return Stage;
})();