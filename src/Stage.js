var ParticleGenerator = require('./ParticleGenerator');

module.exports = (function () {
  
  function Stage(canvasId, canvas, stageData) {

    if(typeof canvas === 'undefined') {
      throw new Error('Missing canvas argument.');
    }

    if(typeof stageData === 'undefined') {
      throw new Error('Missing data argument.');
    }

    this.canvasId    = canvasId;
    this.canvas      = canvas;
    this.data        = stageData;

    _calculateControlPointLocations.bind(this)();
    _calculateVertexLocations.bind(this)();

    return this;
  }

  Stage.prototype.draw = function() {

    _drawCanvas.bind(this)();
    // _drawTitle.bind(this)();
    _drawPropagators.bind(this)();
    _drawVertices.bind(this)();
  };

  Stage.prototype.getVertexById = function(id) {

    var result;

    this.data.vertices.forEach(function(v) {

      if(v.id === id) {
        result = v;
      }
    });

    return result;
  };

  Stage.prototype.getVerticesByDistance = function (dist) {
    
    var results = [];

    this.data.vertices.forEach(function(v) {

      if(v.distance === dist) {
        results.push(v);
      }
    });

    return results;
  };

  Stage.prototype.getNumberOfLevels = function () {
    
    var levels = 0;

    while(this.getVerticesByDistance(levels + 1).length > 0) {
      levels++;
    }

    return levels;
  };

  Stage.prototype.getControlPointById = function(id) {

    var result;

    for(var key in this.data.cPoints) {

      if(this.data.cPoints.hasOwnProperty(key)) {

        this.data.cPoints[key].forEach(function(cPoint) {

          if(cPoint.id === id) {
            result = cPoint;
          }
        });
      }
    }

    return result;
  };

  Stage.prototype.getParticlesStartingFromPoint = function(sP) {

    return _getParticleFromOrToPoint.bind(this)('from', sP);
  };

  Stage.prototype.getParticlesEndingInPoint = function(eP) {

    return _getParticleFromOrToPoint.bind(this)('to', eP);
  };

  var _getParticleFromOrToPoint = function(dir, point) {

    var results = [];

    this.data.particles.forEach(function(p) {

      if(p[dir] === point) {
        results.push(p);
      }
    });

    return results;
  };

  var _drawCanvas = function() {

    this.canvas.size(this.data.width, this.data.height);
  };

  var _drawTitle = function() {

    var ui = this.canvas.group();
    ui.text(this.data.title).font({
      family : 'Georgia',
      size   :  14,
      style  : 'italic',
      anchor : 'left'
    }).translate(10, 10);
  };

  var _drawVertices = function() {

    var ui = this.canvas.group();

    this.data.vertices.forEach(function(v) {
      ui.circle(6).fill('#000').translate(v.x - 3 , v.y - 3);
    });
  };

  var _drawPropagators = function() {

    var ui = this.canvas.group();

    this.data.particles.forEach(function(p) {

      p.from = this.getVertexById(p.from) ? this.getVertexById(p.from) : this.getControlPointById(p.from);
      p.to   = this.getVertexById(p.to)   ? this.getVertexById(p.to)   : this.getControlPointById(p.to);
      ParticleGenerator.getParticle(p.type).draw(this.canvas, p);
    }, this);
  };

  var _calculateControlPointLocations = function() {

    for(var key in this.data.cPoints) {

      if(this.data.cPoints.hasOwnProperty(key)) {

        // Set up variables depending on current side
        var sideA    = key === 'left'  || key === 'right'  ? this.data.height : this.data.width;
        var sideB    = key === 'left'  || key === 'right'  ? this.data.width  : this.data.height;
        var coordA   = key === 'left'  || key === 'right'  ? 'x' : 'y';
        var coordB   = key === 'left'  || key === 'right'  ? 'y' : 'x';
        var coeff    = key === 'right' || key === 'bottom' ? -1 : 1;
        // Number of parts we need to split a side into
        var segments = this.data.cPoints[key].length === 1 ? 3 : this.data.cPoints[key].length;
        // Padding on perpendicular side
        var paddingA = (sideA * 0.4) / 2;
        // Padding on parallel side
        var paddingB = (sideB * 0.1) / 2;
        // Size of a segment
        var s        = (sideA * 0.6) / (segments - 1);

        var i = this.data.cPoints[key].length === 1 ? 1 : 0;
        this.data.cPoints[key].forEach(function(cp) {
          cp[coordA] = coeff === -1 ? sideB - paddingA : paddingA;
          cp[coordB] = i * s + paddingA;
          i++;
        });
      }
    }
  };

  var _calculateVertexLocations = function() {

    _setVertexDistances.bind(this)();

    var sideA    = this.data.cPoints.left.length > 0 ? this.data.width : this.data.height;
    var sideB    = this.data.cPoints.left.length > 0 ? this.data.height : this.data.width;
    var coordA   = this.data.cPoints.left.length > 0 ? 'x' : 'y';
    var coordB   = this.data.cPoints.left.length > 0 ? 'y' : 'x';
    var paddingA = (sideA * 0.30);
    var paddingB = (sideB * 0.30);
    var stageA   = (sideA * 0.4);
    var stageB   = (sideB * 0.4);

    var level = 1;

    while(this.getVerticesByDistance(level).length > 0) {

      var vertices  = this.getVerticesByDistance(level);
      var segmentsA = this.getNumberOfLevels() === 1 ? 2 : this.getNumberOfLevels() - 1;
      var segmentsB = vertices.length === 1 ? 2 : vertices.length - 1;
      var sA        = stageA / segmentsA;
      var sB        = stageB / segmentsB;

      var counter = vertices.length === 1 ? 1 : 0;

      vertices.forEach(function(v) {

        v[coordA] = sA * (level - 1) + paddingA;
        v[coordB] = sB * counter + paddingB;
        counter++;
      });
      level++;
    }
  };

  var _setVertexDistances = function() {

    var AM    = {}; // Adjacency matrix
    var that  = this;

    var walk = function(node, distance, prev) {

      var vertex = that.getVertexById(node);

      if(vertex) {
        vertex.distance = vertex.distance ? Math.min(vertex.distance, distance) : distance;
        var adj = AM[node].filter(function(n) { return n !== prev; });
        adj.forEach(function(n) {
          walk(n, distance + 1, node);
        });
      }
    };

    this.data.particles.forEach(function(p) {

      AM[p.to]   = [];
      AM[p.from] = [];
    });

    this.data.particles.forEach(function(p) {

      AM[p.to].push(p.from);
      AM[p.from].push(p.to);
    });

    var dir = this.data.cPoints.left.length > 0 ? 'left' : 'top';

    this.data.cPoints[dir].forEach(function(cp) {

      AM[cp.id].forEach(function(v) {
        walk(v, 1);
      });
    });
  };

  return Stage;
})();