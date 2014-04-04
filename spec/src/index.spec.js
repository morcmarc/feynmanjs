var Feynman     = require('./../../src/index');

window.SVG  = function() {};


describe('Feynman', function() {

  var canvas  = document.createElement('canvas');
  var feynman = new Feynman();

  describe('draw()', function() {

    it('should throw an error when no canvas is given', function() {

      expect(function() {
        feynman.draw();
      }).toThrow(new Error('Missing canvas#id argument!'));

      expect(function() {
        feynman.draw(canvas);
      }).not.toThrow(new Error('Missing canvas#id argument!'));
    });

    it('should throw error if no data argument is given', function() {

      expect(function() {
        feynman.draw(canvas);
      }).toThrow(new Error('Missing data argument!'));

      expect(function() {
        feynman.draw(canvas, { i_am: 'data' });
      }).not.toThrow(new Error('Missing data argument!'));
    });
  });
});