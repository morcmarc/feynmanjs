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
    stage.vertices = [
      { position: [ 'l', 1 ], x: 0, y: 0, draw: function() {} },
      { position: [ 'r', 2 ], x: 0, y: 0, draw: function() {} }
    ];
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
});