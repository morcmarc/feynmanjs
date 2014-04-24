var Stage = require('./../../src/Stage');

var fontSpy = function() {};

var canvas = {
  size: function() { },
  text: function() { return { font: fontSpy }; }
};

describe('Stage', function() {

  var stage;

  beforeEach(function() {

    stage = new Stage();
    stage.width  = 400;
    stage.height = 400;
    stage.vertices = [ { id: 'i1', position: [ 'left', 1 ], x: 0, y: 0, draw: function() {} } , { id: 'o1', position: [ 'right', 2 ], x: 0, y: 0, draw: function() {} } ];
  });

  describe('setCanvas()', function() {

    it('should set canvas size', function() {

      spyOn(canvas, 'size');
      stage.setCanvas(canvas);
      expect(canvas.size).toHaveBeenCalledWith(400, 400);
    });
  });

  describe('draw()', function() {

    it('should draw title on canvas', function() {

      fontSpy = jasmine.createSpy('fontSpy');
      stage.setCanvas(canvas).draw();
      expect(fontSpy).toHaveBeenCalled();
    });
  });

  describe('getVertexById()', function() {

    it('should return undefined if the vertex doesnt exist', function() {

      expect(stage.getVertexById('i dont exist')).toBe(undefined);
    });

    it('should return the correct vertex', function() {

      expect(stage.getVertexById('i1')).not.toBe(undefined);
      expect(stage.getVertexById('i1').position[0]).toEqual('left');
    });
  });
});