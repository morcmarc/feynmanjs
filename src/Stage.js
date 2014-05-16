var ParticleGenerator = require('./ParticleGenerator');

module.exports = (function () {

  /**
   * Responsible for rendering the graph onto the canvas.
   * @param canvasId
   * @param canvas
   * @param stageData
   * @returns {Stage}
   * @constructor
   */
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

  /**
   * Draw graph.
   */
  Stage.prototype.draw = function() {

    _drawCanvas.bind(this)();
    // _drawTitle.bind(this)();
    _drawPropagators.bind(this)();
    _drawVertices.bind(this)();
  };

  /**
   * Find vertex on stage by its ID. Return the vertex object if found, undefined otherwise.
   * @param id
   * @returns {*}
   */
  Stage.prototype.getVertexById = function(id) {

    var result;

    this.data.vertices.forEach(function(v) {

      if(v.id === id) {
        result = v;
      }
    });

    return result;
  };

  /**
   * Returns all vertices of a given distance from the "starting" side (left or top).
   * @param dist
   * @returns {Array}
   */
  Stage.prototype.getVerticesByDistance = function (dist) {
    
    var results = [];

    this.data.vertices.forEach(function(v) {

      if(v.distance === dist) {
        results.push(v);
      }
    });

    return results;
  };

  /**
   * Returns the maximum distance in the graph.
   * @returns {number}
   */
  Stage.prototype.getNumberOfLevels = function () {
    
    var levels = 0;

    while(this.getVerticesByDistance(levels + 1).length > 0) {
      levels++;
    }

    return levels;
  };

  /**
   * Returns a control point object if it matches the ID, undefined otherwise.
   * @param id
   * @returns {*}
   */
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

  /**
   * Returns all particles "emitted" from point.
   * @param sP ID of vertex or control point.
   * @returns {*}
   */
  Stage.prototype.getParticlesStartingFromPoint = function(sP) {

    return _getParticleFromOrToPoint.bind(this)('from', sP);
  };

  /**
   * Returns particles "absorbed" by point.
   * @param eP ID of vertex or control point.
   * @returns {*}
   */
  Stage.prototype.getParticlesEndingInPoint = function(eP) {

    return _getParticleFromOrToPoint.bind(this)('to', eP);
  };

  /**
   * Returns particles "absorbed" or "emitted" by point.
   * @param dir "to" or "from"
   * @param point ID of vertex or control point
   * @returns {Array}
   * @private
   */
  var _getParticleFromOrToPoint = function(dir, point) {

    var results = [];

    this.data.particles.forEach(function(p) {

      if(p[dir] === point) {
        results.push(p);
      }
    });

    return results;
  };

  /**
   * Set canvas size and other canvas attributes before drawing.
   * @private
   */
  var _drawCanvas = function() {

    this.canvas.size(this.data.width, this.data.height);
  };

  /**
   * Draw title of graph onto canvas.
   * @private
   */
  var _drawTitle = function() {

    var ui = this.canvas.group();
    ui.text(this.data.title).font({
      family : 'Georgia',
      size   :  14,
      style  : 'italic',
      anchor : 'left'
    }).translate(10, 10);
  };

  /**
   * Iterates around all vertices on stage and draws them on screen depending on their visibility attribute.
   * @private
   */
  var _drawVertices = function() {

    var ui = this.canvas.group();

    this.data.vertices.forEach(function(v) {
      if(v.visible) {
        ui.circle(6).fill('#000').translate(v.x - 3 , v.y - 3);
      }
    });
  };

  /**
   * Draw particles on screen after converting raw data to Particle<T> classes.
   * @private
   */
  var _drawPropagators = function() {

    this.data.particles.forEach(function(p) {

      p.from = this.getVertexById(p.from) ? this.getVertexById(p.from) : this.getControlPointById(p.from);
      p.to   = this.getVertexById(p.to)   ? this.getVertexById(p.to)   : this.getControlPointById(p.to);
      ParticleGenerator.getParticle(p.type).draw(this.canvas, p);
    }, this);
  };

  /**
   * Distribute control points along canvas sides depending on their number and the "direction" of the graph.
   * @private
   */
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

  /**
   * Updates vertices with their final position on the stage
   * @private
   */
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
      var levelCoeff = this.getNumberOfLevels() === 1 ? 0 : 1;

      vertices.forEach(function(v) {

        v[coordA] = sA * (level - levelCoeff) + paddingA;
        v[coordB] = sB * counter + paddingB;
        counter++;
      });
      level++;
    }

    _calculateSubVertexLocations.bind(this)();
  };

  var _getAdjacencyMatrix = function() {

    var AM = {};

    // Empty AM
    this.data.particles.forEach(function(p) {

      AM[p.to]   = [];
      AM[p.from] = [];
    });

    // Push vertices to AM
    this.data.particles.forEach(function(p) {

      AM[p.to].push(p.from);
      AM[p.from].push(p.to);
    });

    return AM;
  };

  var _calculateSubVertexLocations = function() {

    var AM   = _getAdjacencyMatrix.bind(this)();
    var dir  = this.data.cPoints.left.length > 0 ? 'left' : 'top';
    var that = this;
    var subVertexPath = [];

    var walk = function(node, prev, start) {

      var vertex = that.getVertexById(node);
      var sP     = start;

      if(vertex) {

        if(vertex.sub) {
          subVertexPath.push(node);
        } else {

          var i = 1;

          subVertexPath.forEach(function(sv) {

            var svObj      = that.getVertexById(sv);

            if(svObj.start) {
              return;
            }

            var startPoint = that.getVertexById(sP) ? that.getVertexById(sP) : that.getControlPointById(sP);
            var endPoint   = that.getVertexById(node);
            svObj.start    = svObj.start ? svObj.start : start;
            svObj.end      = svObj.end ? svObj.end : node;

            var xDt = Math.abs(endPoint.x - startPoint.x) / (subVertexPath.length + 1);
            var yDt = Math.abs(endPoint.y - startPoint.y) / (subVertexPath.length + 1);
            svObj.x = startPoint.x + xDt * i;
            svObj.y = startPoint.y + yDt * i;
            i++;
          });
          subVertexPath = [];
          sP = node;
        }
        var adj = AM[node].filter(function(n) {
          // We need to filter out the previous node from the list
          return n !== prev &&
                (that.getVertexById(n) &&
                  (
                    !vertex.distance ||
                    that.getVertexById(n).distance > vertex.distance ||
                    that.getVertexById(n).sub
                  )
                );
        });

        adj.forEach(function(n) {
          walk(n, node, sP);
        });
      }
    };

    for(var j = 0; j < this.data.cPoints[dir].length; j++) {

      var id = this.data.cPoints[dir][j].id;

      for(var k = 0; k < AM[id].length; k++) {

        walk(AM[id][k], id, id);
      }
    }
  };

  /**
   * Walk the vertex graph and update their distance attribute with the distance from the closest control point.
   * @private
   */
  var _setVertexDistances = function() {

    var AM = _getAdjacencyMatrix.bind(this)();
    var that  = this;

    /**
     * Recursive helper function. Updates distance attribute of "node" with "distance", then calls itself on adjacent nodes (excluding "previous" node).
     * @param node Vertex / Control Point Id
     * @param distance Integer
     * @param prev Previous node
     */
    var walk = function(node, distance, prev) {

      var vertex = that.getVertexById(node);

      // Control point don't have a distance
      if(vertex) {

        var distanceCoeff = 1;

        if(!vertex.sub) {
          vertex.distance = vertex.distance ? Math.min(vertex.distance, distance) : distance;
        } else {
          distanceCoeff = 0;
        }

        var adj = AM[node].filter(function(n) {
          // We need to filter out the previous node from the list
          return n !== prev &&
                (that.getVertexById(n) &&
                  (
                    // And nodes that's distance is less than the current node.
                    // This is to avoid deadlock on cycles.
                    !that.getVertexById(n).distance ||
                    that.getVertexById(n).distance > vertex.distance
                  )
                );
        });

        adj.forEach(function(n) {
          walk(n, distance + distanceCoeff, node);
        });
      }
    };

    var dir = this.data.cPoints.left.length > 0 ? 'left' : 'top';

    // "Walk" the AM and calculate distances.
    this.data.cPoints[dir].forEach(function(cp) {

      AM[cp.id].forEach(function(v) {
        walk(v, 1);
      });
    });
  };

  return Stage;
})();