var Photon = require('./../../../src/propagators/Photon');

describe('Photon', function() {

  it('cannot be instantiated without an id', function() {

    expect(function() {
      new Photon();
    }).toThrow(new Error('Missing id argument!'));
  });

  it('should have defaults', function() {

    var e = new Photon('ph1');
    expect(e.anti).toBe(undefined);
    expect(e.color).toEqual('#0066FF');
    expect(e.length).toEqual(100);
  });

  it('must implement draw() method', function() {

    var e = new Photon('e1');
    expect(function() {
      e.draw();
    }).not.toThrow(new Error('Cannot call abstract method!'));
  });

  describe('draw()', function() {

    it('returns SVG path string if no canvas is given', function() {

      var e = new Photon('g1', '#000', 24);
      expect(e.draw()).toEqual('M0,0 Q3,8 6,0 Q9,-8 12,0 Q15,8 18,0 Q21,-8');
    });
  });
});