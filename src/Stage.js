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
    this.levels      = 1;

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

  Stage.prototype.getVerticesByLevel = function(level) {

    var results = [];

    this.vertices.forEach(function(v) {
      if(v && v.level === level) {
        results.push(v);
      }
    });

    return results;
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

    _calculateControlPointLocations(this);
    _calculateVertexLocations(this);

    return this;
  };

  Stage.prototype.draw = function() {

    console.log(this.vertices);

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

    return { start: vertexA, end: vertexB };
  };

  var _calculateControlPointLocations = function(ctx) {

    var segments = ctx.cPoints.left.length === 1 ? 3 : ctx.cPoints.left.length;
    var padding  = (ctx.height * 0.4) / 2;
    var paddingW = (ctx.width  * 0.1) / 2
    var sH       = (ctx.height * 0.6) / (segments - 1);

    var i = ctx.cPoints.left.length === 1 ? 1 : 0;
    ctx.cPoints.left.forEach(function(cp) {
      cp.x = paddingW;
      cp.y = i * sH + padding;
      i++;
    });

    segments = ctx.cPoints.right.length === 1 ? 3 : ctx.cPoints.right.length;
    padding  = (ctx.height * 0.4) / 2;
    sH       = (ctx.height * 0.6) / (segments - 1);

    i = ctx.cPoints.right.length === 1 ? 1 : 0;
    ctx.cPoints.right.forEach(function(cp) {
      cp.x = ctx.width - paddingW;
      cp.y = i * sH + padding;
      i++;
    });
  };

  var _calculateVertexLocations = function(ctx) {

    var padding     = (ctx.height * 0.3) / 2;
    var levels      = ctx.levels === 1 ? 2 : ctx.levels;
    var levelHeight = (ctx.height * 0.7) / levels;

    for(var l = 1; l <= ctx.levels; l++) {

      console.log(l);

      var vertices = ctx.getVerticesByLevel(l);
      var sW       = ctx.width / (vertices.length + 1);
      var i        = 1;

      vertices.forEach(function(v) {
        v.x = i * sW;
        v.y = levelHeight * v.level + padding;
        i++;
      });
    }
  };

  return Stage;
})();