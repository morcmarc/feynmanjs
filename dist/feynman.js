(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Electron = require('./particles/Electron');
var Photon   = require('./particles/Photon');
var Gluon    = require('./particles/Gluon');

module.exports = {

  getParticle: function(type) {

    switch(type) {

      case 'electron':
        return Electron;
      case 'photon':
        return Photon;
      case 'gluon':
        return Gluon;
      default:
        return Electron;
    }
  }
};
},{"./particles/Electron":12,"./particles/Gluon":13,"./particles/Photon":14}],2:[function(require,module,exports){
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
    _drawTitle.bind(this)();
    _drawPropagators.bind(this)();
    _drawVertices.bind(this)();
    _drawControlPoints.bind(this)();
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
    var t  = ui.text(this.data.title).font({
      family : 'Georgia',
      size   :  12,
      style  : 'italic',
      anchor : 'middle',
    })
    t.translate(this.data.width/2, this.data.height - 30);
  };

  var _drawControlPoints = function() {

    var ui   = this.canvas.group();
    var that = this;

    for(var key in this.data.cPoints) {

      if(this.data.cPoints.hasOwnProperty(key)) {

        this.data.cPoints[key].forEach(function(cPoint) {

          // Label stuff
          if(!cPoint.label) {
            return;
          }

          var cx  = that.data.width  / 2;
          var cy  = that.data.height / 2;
          var nx  = cPoint.x - cx;
          var ny  = cPoint.y - cy;
          
          nx *= 1.10;
          ny *= 1.10;

          var label = ui.foreignObject().attr({ id: cPoint.id });
          label.appendChild('div', { id: 'label-' + cPoint.id, innerText: cPoint.label });
          
          label.move(cx+nx+cPoint.labelX, cy+ny+cPoint.labelY);
        });
      }
    }
  };

  /**
   * Iterates around all vertices on stage and draws them on screen depending on their visibility attribute.
   * @private
   */
  var _drawVertices = function() {

    var ui   = this.canvas.group();
    var that = this;

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

    var ui = this.canvas.group();

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
          // Offset coordinates to fit a nice curve instead of a hard line
          // Farther away from the "center" we are the more we push the CP to the left or down.
          cp[coordA] += Math.abs((sideA/2) - cp[coordB]) * coeff * 0.1;
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
    var paddingA = (sideA * 0.15);
    var paddingB = (sideB * 0.3);
    var stageA   = (sideA * 0.7);
    var stageB   = (sideB * 0.4);

    var level = 1;

    while(this.getVerticesByDistance(level).length > 0) {

      var vertices  = this.getVerticesByDistance(level);
      var segmentsA = this.getNumberOfLevels() === 1 ? 2 : this.getNumberOfLevels() + 1;
      var segmentsB = vertices.length === 1 ? 2 : vertices.length - 1;
      var sA        = stageA / segmentsA;
      var sB        = stageB / segmentsB;

      var counter = vertices.length === 1 ? 1 : 0;

      vertices.forEach(function(v) {
        v[coordA] = sA * (level) + paddingA;
        v[coordB] = sB * counter + paddingB;
        // Vertices on the same level "attract" each other, pulling the image tighter.
        v[coordA] += (sideA/2 - v[coordA]) * 0.1;
        v[coordB] += (sideB/2 - v[coordB]) * 0.1;
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

      if(p.tension === 0) {
        return;
      }

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
                (that.getControlPointById(n) || (that.getVertexById(n) &&
                  (
                    !vertex.distance ||
                    !that.getVertexById(n).distance ||
                    that.getVertexById(n).distance > vertex.distance ||
                    that.getVertexById(n).sub
                  )
                ));
        });

        adj.forEach(function(n) {
          walk(n, node, sP);
        });
      } else {

        var j = 1;

        subVertexPath.forEach(function(sv) {

          var svObj      = that.getVertexById(sv);

          if(svObj.start) {
            return;
          }

          var startPoint = that.getVertexById(sP) ? that.getVertexById(sP) : that.getControlPointById(sP);
          var endPoint   = that.getControlPointById(node);
          svObj.start    = svObj.start ? svObj.start : start;
          svObj.end      = svObj.end ? svObj.end : node;

          var xDt = Math.abs(endPoint.x - startPoint.x) / (subVertexPath.length + 1);
          var yDt = Math.abs(endPoint.y - startPoint.y) / (subVertexPath.length + 1);
          svObj.x = startPoint.x + xDt * j;
          svObj.y = startPoint.y + yDt * j;
          j++;
        });
        subVertexPath = [];
      }
    };

    // "Walk" the AM and calculate distances.
    this.data.cPoints[dir].forEach(function(cp) {

      if(!AM[cp.id]) {
        return;
      }

      AM[cp.id].forEach(function(v) {
        walk(v, cp.id, cp.id);
      });
    });
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

      if(!AM[cp.id]) {
        return;
      }

      AM[cp.id].forEach(function(v) {
        walk(v, 1);
      });
    });
  };

  return Stage;
})();
},{"./ParticleGenerator":1}],3:[function(require,module,exports){
var Klass = require('./helpers/Klass');

module.exports = {

  getStructure: function() {

    return Klass.__clone({
      title     : '',
      width     : 200,
      height    : 150,
      thickness : 'thick', // or 'thin'
      particles : [
        // {
          // id            : 'p1',
          // type          : 'photon',
          // from          : 'i1',
          // to            : 'v1',
          // label         : '$\\tau$',
          // right         : 0
          // left          : 1.6,
          // tension       : 0.5,
          // tag           : 'tag1',
          // color         : '#F00',
          // bgColor       : '#0F0',
          // penWidth      : 5,
          // labelSide     : 'right',
          // labelDistance : 10,
          // labelX        : 10,
          // labelY        : 10
        // }
      ],
      vertices  : [
        // {
          // id      : 'v1',
          // visible : true,
          // label   : '$v_1$',
          // labelX  : 10,
          // labelY  : 10,
          // sub     : false
        // }
      ],
      cPoints   : {

        left   : [
          // {
            // id     : 'i1',
            // side   : 'left',
            // label  : '$c_1$',
            // labelX : 10,
            // labelY : 10,
          // }
        ],
        right  : [
          // {
          //   id: 'i1'
          //   ...
          // }
        ],
        top    : [
          // {
          //   id: 'i1'
          //   ...
          // }
        ],
        bottom : [
          // {
          //   id: 'i1'
          //   ...
          // }
        ]
      }
    });
  }
};
},{"./helpers/Klass":6}],4:[function(require,module,exports){
module.exports = {

  merge: function(target, source) {
        
    /* Merges two (or more) objects,
       giving the last one precedence */
    
    if ( typeof target !== 'object' ) {
      target = {};
    }
    
    for (var property in source) {
        
      if ( source.hasOwnProperty(property) ) {
          
        var sourceProperty = source[ property ];
          
        if ( typeof sourceProperty === 'object' ) {
          target[ property ] = this.merge( target[ property ], sourceProperty );
          continue;
        }
        
        if(sourceProperty !== undefined) {
          target[ property ] = sourceProperty;
        }
          
      }
      
    }
    
    for (var a = 2, l = arguments.length; a < l; a++) {
      this.merge(target, arguments[a]);
    }
    
    return target;
  }
};
},{}],5:[function(require,module,exports){
var PI      = Math.PI;
var isArray = function(a) {
  return Object.prototype.toString.call(a) === '[object Array]';
};

module.exports = {

  normalizePathString: function() {

    var str = '';

    for(var i = 0, l = arguments.length, item; i < l; i++) {

      item = arguments[i];
      str += ' ' + (typeof item !== 'number' ?
        item :
        item.toFixed(3).replace(/(.\d*?)0+$/, '$1').replace(/\.$/, '')
      );
    }
    var trimmed = str.trim();

    return trimmed.replace(/ ?, ?/g, ',');
  },

  /**
   * Get coordinates of a given point in reference to a given Bezier curve segment
   *
   * @param sx Start of segment X
   * @param sy Start of segment Y
   * @param ex End of segment X
   * @param ey End of segment Y
   * @param x  Point to fit X
   * @param y  Point to fit Y
   * @returns {*}
   */
  getCoordinatesInBezier: function(sx, sy, ex, ey, x, y) {

    var ang = Math.atan2(ey - sy, ex - sx);

    return this.normalizePathString(x * Math.cos(ang) - y * Math.sin(ang) + sx, ',', x * Math.sin(ang) + y * Math.cos(ang) + sy);
  },

  /**
   * Project a given (Lp) 1/4 period long Bezier spline (C) onto an (Ll) long straight line.
   *
   * @param tile       (C)  Curve segment
   * @param period     (Lp) Length of a quarter period
   * @param length     (Ll) Length of propagator
   * @returns {string} SVG path
   */
  line: function(tile, period, length) {

    var bezier = ['M'];
    var num    = Math.floor(length / period);
    var extra  = length - period * num + 0.1;

    for(var n = 0; n <= num; n++) {

      for(var i = 0, l = tile.length, item; i < l; i++) {

        item = tile[i];

        if(isArray(item)) {

          if(n < num || item[0] < extra) {
            bezier.push(this.normalizePathString(item[0] + period * n, ',', item[1]));
          } else {
            break;
          }
        } else {
          bezier.push(item);
        }

      }
    }
    return bezier.join(' ').replace(/\s[A-Z][^A-Z]*$/, '');
  },

  /**
   * Project a given (Lp) quarter period long Bezier spline (C) onto an (Ll) long arc.
   *
   * @param particle   Type of particle, e.g.: "photon"
   * @param tile       (C)  Curve segment
   * @param period     (Lp) Length of a 1/4 period
   * @param length     (Ll) Length
   * @returns {string} SVG path
   */
  arc: function(particle, tile, period, length, tens) {

    var tension = tens ? tens : 2;
    var t       = 0.25 * tension;
    var phi     = Math.acos(-0.5 / t);
    var theta   = -2 * Math.asin(period / (t * length));
    var segment = [];
    var bezier  = ['M', '0,0'];

    // get coordinate pairs for the endpoint of segment
    for(var n = 0; n <= (PI - 2 * phi) / theta; n++) {
      segment.push([length * (t * Math.cos(theta * n + phi) + 0.5), length * (t * Math.sin(theta * n + phi) - Math.sqrt(t * t - 0.25))]);
    }

    for(var i = 0, l = segment.length - 1, model; i < l; i++) {

      model = (particle === 'photon' ? tile[i % 2] : tile);

      for(var j = 0, m = model.length, item; j < m; j++) {
        item = model[j];
        bezier.push(isArray(item)
          ? this.getCoordinatesInBezier(segment[i][0], segment[i][1], segment[i+1][0], segment[i+1][1], item[0], item[1])
          : item
        );
      }
    }

    return bezier.join(' ').replace(/\s[A-Z]$/, '');
  },

  /**
   * Project a given (Lp) quarter period long Bezier spline (C) onto an (Ll) diameter circle.
   *
   * @param particle   Type of particle, e.g.: "photon"
   * @param tile       (C) Curve segment
   * @param period     (N) Length of a 1/4 period
   * @param length     (L) Length
   * @returns {string} SVG path
   */
  loop: function(particle, tile, period, length) {

    var cw      = true;
    var theta   = 2 * Math.asin(2 * period / length);
    var num     = 2 * PI / theta;
    var segment = [];
    var lift    = (cw ? -0.5 : 0.5);
    var bezier  = ['M', (particle === 'gluon' ? lift + ',0' : '0,' + lift)];

    // find the modified distance such that the number of tiles is an integer
    for(var x = -0.1, dis = length; Math.floor(num) % 4 || num - Math.floor(num) > 0.1; x += 0.001) {

      length = (1 + x) * dis;
      theta  = 2 * Math.asin(2 * period / length);
      num    = 2 * PI / theta;
    }

    // get coordinate pairs for the endpoint of segment
    for(var n = 0; n <= num; n++) {

      var sx = 0.5 * length * (1 - Math.cos(theta * n));
      var sy = 0.5 * length * Math.sin(theta * n);
      segment.push([sx, sy]);
    }

    for(var i = 0, l = segment.length - 1, model; i < l; i++) {

      // two photon tiles form a period whereas one gluon tile is a period
      model = (particle === 'photon' ? tile[i % 2] : tile);

      // get bezier path for photon and gluon arc
      for(var j = 0, m = model.length, item; j < m; j++) {

        item = model[j];
        bezier.push(isArray(item)
          ? this.getCoordinatesInBezier(segment[i][0], segment[i][1], segment[i+1][0], segment[i+1][1], item[0], item[1])
          : item
        );
      }
    }

    return bezier.join(' ').replace(/\s[A-Z]$/, '') + ' Z';
  }
};
},{}],6:[function(require,module,exports){
var __hasProp = {}.hasOwnProperty;

module.exports = {
  __extends: function(child, parent) {

    for (var key in parent) {
      if (__hasProp.call(parent, key)) {
        child[key] = parent[key];
      }
    }

    function ctor() {
      this.constructor = child;
    }

    ctor.prototype  = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;

    return child;
  },

  __clone: function (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
};
},{}],7:[function(require,module,exports){
module.exports = function(canvas, opts, angle) {

  var label = canvas.foreignObject().attr({ id: opts.id });
  label.appendChild('span', { id: 'label-' + opts.id, innerText: opts.label });
  var e = document.getElementById('label-' + opts.id);
  if(!e) {
    return;
  }

  e.style.textAlign = 'center';

  var nx = opts.to.x - opts.from.x;
  var ny = opts.to.y - opts.from.y;
  var dt = Math.sqrt( nx * nx + ny * ny );

  nx /= dt * (1 / opts.labelDistance);
  ny /= dt * (1 / opts.labelDistance);

  var n1x = -ny + ((opts.to.x + opts.from.x) / 2);
  var n1y =  nx + ((opts.to.y + opts.from.y) / 2);
  var n2x =  ny + ((opts.to.x + opts.from.x) / 2);
  var n2y = -nx + ((opts.to.y + opts.from.y) / 2);

  var dx  = opts.labelX !== NaN ? opts.labelX : 0;
  var dy  = opts.labelY !== NaN ? opts.labelY : 0;

  if(opts.labelSide === 'left') {
    label.move(n1x + dx, n1y + dy);
  } else {
    label.move(n2x + dx, n2y + dy);
  }

  return label;
};
},{}],8:[function(require,module,exports){
module.exports = {

  getAngle: function(A, B, inRadian) {

    var r = inRadian ? 1 : (180 / Math.PI);

    var diffX   = B.x - A.x;
    var diffY   = B.y - A.y;
    return Math.atan2(diffY, diffX) * r;
  },

  getDistance: function(A, B) {

    var diffX   = B.x - A.x;
    var diffY   = B.y - A.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  },

  getPositionValues: function(pA, pB) {

    var angle  = this.getAngle(pA, pB);
    var length = this.getDistance(pA, pB);

    return { x: pA.x, y: pA.y, r: angle, l: length };
  }
};
},{}],9:[function(require,module,exports){
var ParserFactory = require('./parsers/ParserFactory');
var Stage         = require('./Stage');

module.exports = (function() {

  var Feynman = function() {

    return this;
  };

  /**
   * Draw diagram onto canvas.
   * @param canvas Id of canvas element
   * @param data   Diagram properties
   */
  Feynman.prototype.draw = function(canvas, data) {

    if (typeof canvas === 'undefined') {
      throw new Error('Missing canvas#id argument!');
    }

    if (typeof data === 'undefined') {
      throw new Error('Missing data argument!');
    }

    var svgCanvas  = new SVG(canvas);
    var parser     = ParserFactory.getParser(data);
    var stageData  = parser.parse();
    var stage      = new Stage(canvas, svgCanvas, stageData);

    stage.draw();

    return this;
  };

  window.Feynman = Feynman;

  return Feynman;
})();
},{"./Stage":2,"./parsers/ParserFactory":11}],10:[function(require,module,exports){
var StageStructure = require('./../StageStructure');
var Klass = require('./../helpers/Klass');

module.exports = (function() {

  var data;

  function LatexParser(raw) {

    if(typeof raw === 'undefined') {
      throw new Error('No data given.');
    }

    this.raw = raw;

    data = StageStructure.getStructure();

    return this;
  }

  LatexParser.prototype.parse = function() {

    if(this.raw.title) {
      data.title = this.raw.title;
    }
    if(this.raw.width) {
      data.width = this.raw.width;
    }
    if(this.raw.height) {
      data.height = this.raw.height;
    }
    if(this.raw.diagram) {
      this.raw.diagram.forEach(function(command) {
        _processCommand(command);
      });
    }
    return data;
  };

  var _processCommand = function(command) {

    // Match first "word"
    var keyword   = command.match(/\w+/g)[0];
    // Match anything between curly braces { ... }
    // Example: http://www.regexr.com/38rpl
    var rawArgs   = command.match(/\{([^{}]+)\}|\{(\$[\S]+\$)\}|\{\S+(\$[\S]+\$)\}/g);
    // Get rid of curly braces and convert comma separated args into an Array
    var args      = _explodeArgs(_stripCurlies(rawArgs,keyword));

    if(keyword !== undefined && _keywordFunctionMap[keyword] !== undefined) {
      _keywordFunctionMap[keyword](args);
    }
  };

  var _processParticle = function(args) {

    var i = 0;

    while(args[1][i + 1]) {

      var fromId = args[1][i];
      var toId   = args[1][i + 1];
      var id     = 'p' + (data.particles.length + 1);

      _processEndPoint(fromId);
      _processEndPoint(toId);

      var options = _processPropagatorOptions(args[0].slice(1));

      var rightValue = 0;
      var leftValue  = 0;

      if(options.right) {
        rightValue = typeof options.right === 'string' ? parseFloat(options.right) : 1;
      }

      if(options.left) {
        leftValue = typeof options.left === 'string' ? parseFloat(options.left) : 1;
      }

      var p = {
        id            : id,
        from          : fromId,
        to            : toId,
        type          : args[0][0],
        label         : options.label,
        labelSide     : options.side,
        labelDistance : options.dist,
        labelX        : options.labelx ? parseInt(options.labelx) : 0,
        labelY        : options.labely ? parseInt(options.labely) : 0,
        tension       : parseFloat(options.tension),
        right         : rightValue,
        left          : leftValue,
        tag           : options.tag,
        color         : options.foreground,
        bgColor       : options.background,
        penWidth      : options.width
      };

      data.particles.push(p);
      i++;
    }
  };

  var _processControlPoint = function(pos, args) {

    args[0].forEach(function(pId) {

      if(_getControlPointById(pId)) {
        return;
      }

      data.cPoints[pos].push({ id: pId, x: 0, y: 0, side: pos });
    });
  };

  var _processRight = function(args) {

    _processControlPoint('right', args);
  };

  var _processLeft = function(args) {

    _processControlPoint('left', args);
  };

  var _processTop = function(args) {

    _processControlPoint('top', args);
  };

  var _processBottom = function(args) {

    _processControlPoint('bottom', args);
  };

  var _processNPos = function(pos, args) {

    var n        = parseInt(args[0], 10);
    var points   = [];
    var i        = 1;
    var idLetter = pos === 'left' || pos === 'top' ? 'i' : 'o';

    while(i <= n) {
      points.push(idLetter + i);
      i++;
    }

    _processControlPoint(pos, [points]);
  };

  var _processNRight = function(args) {

    _processNPos('right', args);
  };

  var _processNLeft = function(args) {

    _processNPos('left', args);
  };

  var _processNTop = function(args) {

    _processNPos('top', args);
  };

  var _processNBottom = function(args) {

    _processNPos('bottom', args);
  };

  var _processDot = function(args) {

    args[0].forEach(function(vId) {
      var v = _getVertexById(vId);
      if(v) {
        v.visible = true;
      }
    });
  };

  var _processPenSize = function(args) {

    if(args[0][0] === 'thick' || args[0][0] === 'thin') {
      data.thickness = args[0][0];
    }
  };

  var _processLabel = function(args) {

    var obj = _getVertexById(args[0][0]);

    if(!obj) {
      obj = _getControlPointById(args[0][0]);
    }

    if(!obj) {
      return;
    }

    var labelCoords = _processPropagatorOptions(args[0].slice(1));

    obj.labelX = labelCoords.labelx ? parseInt(labelCoords.labelx) : 0;
    obj.labelY = labelCoords.labely ? parseInt(labelCoords.labely) : 0;
    obj.label  = args[1][0];
  };

  var _isVertex = function(point) {

    return point[0] === 'v';
  };

  var _isSubVertex = function(point) {

    return (/\*/).test(point);
  };

  var _processEndPoint = function(id) {

    if(_isVertex(id) && !_getVertexById(id)) {
      var v = { id: id };
      if(_isSubVertex(id)) {
        v.sub = true;
      }
      data.vertices.push(v);
    }
  };

  var _stripCurlies = function(args) {

    var pattern = /^\{|\}$/gm;

    return args.map(function(arg) {
      return arg.replace(pattern, '');
    });
  };

  var _explodeArgs = function(args, keyword) {

    var explodedArgs = [];

    args.forEach(function(arg) {

      // See http://www.regexr.com/3afr4
      var pattern   = new RegExp(/([\w.]+|\$[\S,]?\S+\$)=?(\$[\S\ ]*,?[\S\ ]*\$|[\w.*-]+|#\w+)?/g);
      var matches   = pattern.exec(arg);
      var processed = [];

      while(matches !== null) {
        processed.push(matches[0]);
        matches = pattern.exec(arg);
      }

      explodedArgs.push(_processArgumentOptions(processed));
    });

    return explodedArgs;
  };

  var _processArgumentOptions = function(args) {

    var processed = [];

    args.forEach(function(arg) {
      
      var pa      = arg;
      var pattern = /(\w+)\=(\S+)/g;
      var matches = pattern.exec(pa);

      if(matches && matches.length > 2) {
        var key   = matches[1];
        var value = matches[2];
        pa = {};
        pa[key] = value;
      }

      processed.push(pa);
    });

    return processed;
  };

  var _processPropagatorOptions = function(options) {

    var processed = {};

    if(options && options.length === 0) {
      return processed;
    }

    options.forEach(function(o) {
      if(typeof o === 'string') {
        processed[o] = true;
      }
      if(typeof o === 'object') {
        var key = Object.keys(o)[0];
        processed[key] = typeof o[key] === 'undefined' ? true : o[key];
      }
    });

    return processed;
  };

  var _getVertexById = function(id) {

    var result;

    data.vertices.forEach(function(v) {

      if(v.id === id) {
        result = v;
      }
    });

    return result;
  };

  var _getControlPointById = function(id) {

    var result;

    for(var key in data.cPoints) {

      if(data.cPoints.hasOwnProperty(key)) {

        data.cPoints[key].forEach(function(cPoint) {

          if(cPoint.id === id) {
            result = cPoint;
          }
        });
      }
    }

    return result;
  };

  var _keywordFunctionMap = {
    'fmf'       : _processParticle,
    'fmfbottom' : _processBottom,
    'fmfbottomn': _processNBottom,
    'fmfdot'    : _processDot,
    'fmflabel'  : _processLabel,
    'fmfleft'   : _processLeft,
    'fmfleftn'  : _processNLeft,
    'fmfpen'    : _processPenSize,
    'fmfright'  : _processRight,
    'fmfrightn' : _processNRight,
    'fmftop'    : _processTop,
    'fmftopn'   : _processNTop
  };

  return LatexParser;
})();
},{"./../StageStructure":3,"./../helpers/Klass":6}],11:[function(require,module,exports){
var LatexParser = require('./LatexParser');

module.exports = {

  getParser: function(data) {

    switch(data.lang) {
      default:
        return new LatexParser(data);
    }
  }
};
},{"./LatexParser":10}],12:[function(require,module,exports){
var PointHelper = require('./../helpers/Point');
var ArrayHelper = require('./../helpers/Array');
var Bezier      = require('./../helpers/Bezier');
var Label       = require('./../helpers/Label');

var _defaults = {
  type          : 'electron',
  from          : { x: 0, y: 0 },
  to            : { x: 0, y: 0 },
  label         : '',
  right         : false,
  left          : false,
  tension       : 1,
  tag           : '',
  color         : '#000',
  bgColor       : null,
  penWidth      : 2,
  labelSide     : 'right',
  labelDistance : 10
};

module.exports = {

  draw: function(canvas, options) {

    if(!canvas) {
      return;
    }

    var opts = {};
    ArrayHelper.merge(opts, _defaults);
    ArrayHelper.merge(opts, options);

    var ui       = canvas.group();
    var position = PointHelper.getPositionValues(options.from, options.to);
    var angleRad = PointHelper.getAngle(opts.from, opts.to, true);
    var shape    = 'line';
    var arcDir   = true;
    var tension  = 2;

    if(options.left || options.right) {
      shape   = 'arc';
      arcDir  = options.right !== 0 ? -1 : 1;
      tension = options.right !== 0 ? options.right : options.left;
    }

    if(options.type !== 'plain') {
      this._drawArrow(ui, position.l, options.color ? options.color : _defaults.color, options.type === 'antifermion');
    }

    if(opts.label) {
      var label = new Label(canvas, opts, angleRad);
    }

    ui
      .path(this.getPath(shape, options, tension))
      .fill('none')
      .stroke({ width: options.penWidth ? options.penWidth : _defaults.penWidth, color: options.color ? options.color : _defaults.color })
      .scale(1, arcDir);
    ui
      .transform({
        cx       : position.x,
        cy       : position.y,
        rotation : position.r,
        x        : position.x,
        y        : position.y
      });

    return ui;
  },

  getPath: function(shape, options, tension) {

    var position = PointHelper.getPositionValues(options.from, options.to);
    var length   = position.l;
    var tile     = [ [1, 1], [2, 1] ];
    var l        = 1;

    switch(shape) {
      case 'line':
        return Bezier.line(tile, 1, length);
      case 'arc':
        return Bezier.arc('electron', tile, 1, length, tension);
      case 'loop':
        return Bezier.loop('electron', tile, 1, length);
      default:
        return Bezier.line(tile, 1, length);
    }
  },

  _drawArrow: function(ui, length, color, anti) {

    var coeff = anti ? -1 : 1;

    //On-the-line
    var x1 = length / 2 + coeff * 7;
    var y1 = 0;
    //Below-the-line
    var x2 = length / 2 - coeff * 7;
    var y2 = 3.5;
    //Above-the-line
    var x3 = length / 2 - coeff * 7;
    var y3 = -3.5;
    //'x1,y1 x2,y2, x3,y3'
    var polygonString = '' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3;
    ui
      .polygon(polygonString)
      .fill(color);
  }
};
},{"./../helpers/Array":4,"./../helpers/Bezier":5,"./../helpers/Label":7,"./../helpers/Point":8}],13:[function(require,module,exports){
var PointHelper = require('./../helpers/Point');
var ArrayHelper = require('./../helpers/Array');
var Bezier      = require('./../helpers/Bezier');
var Label       = require('./../helpers/Label');

var _defaults = {
  type          : 'gluon',
  from          : { x: 0, y: 0 },
  to            : { x: 0, y: 0 },
  label         : '',
  right         : false,
  left          : false,
  tension       : 1,
  tag           : '',
  color         : '#009933',
  bgColor       : null,
  penWidth      : 2,
  labelSide     : 'right',
  labelDistance : 10
};

module.exports = {

  draw: function(canvas, options) {

    if(!canvas) {
      return;
    }

    var opts = {};
    ArrayHelper.merge(opts, _defaults);
    ArrayHelper.merge(opts, options);

    var ui       = canvas.group();
    var position = PointHelper.getPositionValues(opts.from, opts.to);
    var angleRad = PointHelper.getAngle(opts.from, opts.to, true);
    var shape    = 'line';
    var arcDir   = true;
    var tension  = 2;

    if(opts.left || opts.right) {
      shape   = 'arc';
      arcDir  = opts.right !== 0 ? -1 : 1;
      tension = opts.right !== 0 ? opts.right : opts.left;
    }

    if(opts.label) {
      var label = new Label(canvas, opts, angleRad);
    }

    ui
      .path(this.getPath(shape, opts, tension))
      .fill('none')
      .stroke({ width: opts.penWidth ? opts.penWidth : _defaults.penWidth, color: opts.color ? opts.color : _defaults.color })
      .scale(1, arcDir);
    ui
      .transform({
        cx       : position.x,
        cy       : position.y,
        rotation : position.r,
        x        : position.x,
        y        : position.y
      });

    return ui;
  },

  /**
   * Approximation of the first quarter of one period of a sine curve
   * is a cubic Bezier curve with the following control points:
   *
   * (0, 0) (lambda * p / PI, lambda * a / 2) (2 * p / PI, a) (p, a)
   *
   * References:
   *
   * [1] http://mathb.in/1447
   * [2] https://github.com/photino/jquery-feyn/blob/master/js/jquery.feyn-1.0.1.js
   *
   * @param shape
   * @returns {*}
   */
  getPath: function(shape, options, tension) {

    var position = PointHelper.getPositionValues(options.from, options.to);
    var length   = position.l + (5 - position.l % 5);

    var gluon = {
      width  : 13,   // the coil width of gluon propagators
      height : 13,   // the coil height of gluon propagators
      factor : 0.75, // the factor parameter for gluon propagators
      percent: 0.6,  // the percent parameter for gluon propagators
      scale  : 1.15  // the scale parameter for gluon arcs and loops
    };

    var kappa = 0.55191502;
    // a and b are one-half of the ellipse's major and minor axes
    var a     = gluon.height * gluon.factor;
    var b     = gluon.width  * gluon.percent;
    // c and d are one-half of major and minor axes of the other ellipse
    var c     = gluon.height * (gluon.factor - 0.5);
    var d     = gluon.width  * (1 - gluon.percent);

    var dir   = true;
    var pts   = (dir
      ? [[0, 0], 'A ' + a + ' ' + b, 0, 0, 1, [a, b],
                 'A ' + c + ' ' + d, 0, 1, 1, [a - 2 * c, b],
                 'A ' + a + ' ' + b, 0, 0, 1]
      : [[0, 0], 'A ' + a + ' ' + b, 0, 0, 0, [a, -b],
                 'A ' + c + ' ' + d, 0, 1, 0, [a - 2 * c, -b],
                 'A ' + a + ' ' + b, 0, 0, 0]
    );

    a = (dir ? a : gluon.scale * a);
    var lift = a / Math.pow(length, 0.6);

    var tile = (dir
      ? ['C', [kappa * a, lift], [a, b - kappa * b], [a, b],
         'C', [a, b + kappa * d], [a - c + kappa * c, b + d], [a - c, b + d],
         'S', [a - 2 * c, b + kappa * d], [a - 2 * c, b],
         'C', [a - 2 * c, b - kappa * b], [2 * (a - c) - kappa * a, 0], [2 * (a - c), -lift]]
      : ['C', [kappa * a, lift], [a, -b + kappa * b], [a, -b],
         'C', [a, -b - kappa * d], [a - c + kappa * c, -b - d], [a - c, -b - d],
         'S', [a - 2 * c, -b - kappa * d], [a - 2 * c, -b],
         'C', [a - 2 * c, -b + kappa * b], [2 * (a - c) - kappa * a, 0], [2 * (a - c), -lift]]
    );

    switch(shape) {
      case 'line':
        return Bezier.line(pts, gluon.height, length);
      case 'arc':
        return Bezier.arc('gluon', tile, a - c, length, tension);
      case 'loop':
        return Bezier.loop('gluon', tile, a - c, length);
      default:
        return Bezier.line(pts, gluon.height, length);
    }
  }
};
},{"./../helpers/Array":4,"./../helpers/Bezier":5,"./../helpers/Label":7,"./../helpers/Point":8}],14:[function(require,module,exports){
var PointHelper = require('./../helpers/Point');
var ArrayHelper = require('./../helpers/Array');
var Bezier      = require('./../helpers/Bezier');
var Label       = require('./../helpers/Label');

var _defaults = {
  type          : 'photon',
  from          : { x: 0, y: 0 },
  to            : { x: 0, y: 0 },
  label         : '',
  right         : false,
  left          : false,
  tension       : 1,
  tag           : '',
  color         : '#0066FF',
  bgColor       : null,
  penWidth      : 2,
  labelSide     : 'right',
  labelDistance : 15
};

module.exports = {

  draw: function(canvas, options) {

    if(!canvas) {
      return;
    }

    var opts = {};
    ArrayHelper.merge(opts, _defaults);
    ArrayHelper.merge(opts, options);

    var ui       = canvas.group();
    var position = PointHelper.getPositionValues(opts.to, opts.from);
    var angleRad = PointHelper.getAngle(opts.from, opts.to, true);
    var shape    = 'line';
    var arcDir   = 1;
    var tension  = 2;

    if(opts.left || opts.right) {
      shape   = 'arc';
      arcDir  = opts.right !== 0 ? -1 : 1;
      tension = opts.right !== 0 ? opts.right : opts.left;
    }

    if(opts.label) {
      var label = new Label(canvas, opts, angleRad);
    }

    ui
      .path(this.getPath(shape, opts, tension))
      .fill('none')
      .stroke({ width: opts.penWidth ? opts.penWidth : _defaults.penWidth, color: opts.color ? opts.color : _defaults.color })
      .scale(1, arcDir);
    ui
      .transform({
        cx       : position.x,
        cy       : position.y,
        rotation : position.r,
        x        : position.x,
        y        : position.y
      });

    return ui;
  },

  /**
   * Approximation of the first quarter of one period of a sine curve
   * is a cubic Bezier curve with the following control points:
   *
   * (0, 0) (lambda * p / PI, lambda * a / 2) (2 * p / PI, a) (p, a)
   *
   * References:
   *
   * [1] http://mathb.in/1447
   * [2] https://github.com/photino/jquery-feyn/blob/master/js/jquery.feyn-1.0.1.js
   *
   * @param shape
   * @returns {*}
   */
  getPath: function(shape, options, tension) {

    var position = PointHelper.getPositionValues(options.from, options.to);
    var length   = position.l;// + (5 - position.l % 5);

    var PI     = Math.PI;
    var lambda = 0.51128733;
    var a      = 2;
    var b      = 0.5 * lambda * a;
    var p      = 3;
    var q      = 2 * p / PI;
    var t      = lambda * p / PI;
    var dir    = true;

    var pts = (dir
      ? [[0, 0], 'C', [t, -b], [q, -a], [p, -a],
                 'S', [2 * p - t, -b], [2 * p, 0],
                 'S', [2 * p + q, a], [3 * p, a],
                 'S', [4 * p - t, b]]
      : [[0, 0], 'C', [t, b], [q, a], [p, a],
                 'S', [2 * p - t, b], [2 * p, 0],
                 'S', [2 * p + q, -a], [3 * p, -a],
                 'S', [4 * p - t, -b]]
    );

    var tile = (dir
      ? [['C', [t, -b], [q, -a], [p, -a],
          'S', [2 * p - t, -b], [2 * p + 0.5, 0]],
         ['C', [t, b], [q, a], [p, a],
          'S', [2 * p - t, -b], [2 * p - 0.5, 0]]]
      : [['C', [t, b], [q, a], [p, a],
          'S', [2 * p - t, b], [2 * p - 0.5, 0]],
         ['C', [t, -b], [q, -a], [p, -a],
          'S', [2 * p - t, -b], [2 * p + 0.5, 0]]]
    );

    switch(shape) {
      case 'line':
        return Bezier.line(pts, 4 * p, length);
      case 'arc':
        return Bezier.arc('photon', tile, p, length, tension);
      case 'loop':
        return Bezier.loop('photon', tile, p, length);
      default:
        return Bezier.line(pts, 4 * p, length);
    }
  }
};
},{"./../helpers/Array":4,"./../helpers/Bezier":5,"./../helpers/Label":7,"./../helpers/Point":8}]},{},[9]);
