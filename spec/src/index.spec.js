var Feynman     = require('./../../src/index');

window.SVG  = function() {};


describe('Feynman', function() {

  var canvas = document.createElement('canvas');

  it('cannot be instantiated without a canvas', function() {

    expect(function() {
      var f = new Feynman();
    }).toThrow(new Error('Missing canvas#id argument!'));

    expect(function() {
      var f = new Feynman(canvas);
    }).not.toThrow(new Error('Missing canvas#id argument!'));
  });

  describe('draw()', function() {

    it('should throw error if no data argument is given', function() {

      expect(function() {
        var f = new Feynman(canvas);
        f.draw();
      }).toThrow(new Error('Missing data argument!'));

      expect(function() {
        var f = new Feynman(canvas);
        f.draw({ i_am: 'data' });
      }).not.toThrow(new Error('Missing data argument!'));
    });
  });
});