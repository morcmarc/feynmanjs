var Stage = require('./../../src/Stage');

var fontSpy = function() {}

var canvas = {
  size: function() { },
  text: function() { return { font: fontSpy }; }
};

describe('Stage', function() {

  var stage;

  beforeEach(function() {

    stage = new Stage();
    stage.vertices = [];
  });

  describe('setCanvas()', function() {

    it('should set canvas size', function() {

      spyOn(canvas, 'size');
      stage.setCanvas(canvas);
      expect(canvas.size).toHaveBeenCalledWith(100, 100);
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