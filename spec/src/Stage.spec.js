var Stage = require('./../../src/Stage');

var canvas = {
  size: function(w, h) { },
  text: function(t) { }
};

describe('Stage', function() {

  var stage;

  beforeEach(function() {

    stage = new Stage();
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

      spyOn(canvas, 'text');
      stage.setCanvas(canvas).draw();
      expect(canvas.text).toHaveBeenCalledWith('Feynman');
    });
  });
});