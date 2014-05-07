module.exports = (function () {
  
  function Stage(canvas, stageData) {

    if(typeof canvas === 'undefined') {
      throw new Error('Missing canvas argument.');
    }

    if(typeof stageData === 'undefined') {
      throw new Error('Missing data argument.');
    }

    this.canvas = canvas;
    this.data   = stageData;

    return this;
  }

  Stage.prototype.draw = function() {

    _drawCanvas.bind(this)();
    _drawTitle.bind(this)();
    _drawPropagators.bind(this)();
    _drawVertices.bind(this)();
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

  var _drawVertices = function(ctx) {

    var ui = this.canvas.group();

    this.data.vertices.forEach(function(v) {
      
    });
  };

  var _drawPropagators = function(ctx) {

  };

  var _calculateControlPointLocations = function(ctx) {

  };

  var _calculateVertexLocations = function(ctx) {

  };

  return Stage;
})();