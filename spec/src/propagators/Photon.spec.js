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
    expect(e.length).toEqual(109);
  });

  it('must implement draw() method', function() {

    var e = new Photon('e1');
    expect(function() {
      e.draw();
    }).not.toThrow(new Error('Cannot call abstract method!'));
  });

  it('must implement getPath() method', function() {

    var e = new Photon('e1');
    expect(function() {
      e.getPath();
    }).not.toThrow(new Error('Cannot call abstract method!'));
  });

  describe('getPath()', function() {

    it('returns path string for Line', function() {

      var e = new Photon('g1', '#000', 24);
      expect(e.getPath('line')).toEqual('M 0,0 C 0.814,1.278 3.183,5 5,5 S 9.186,1.278 10,0 S 13.183,-5 15,-5 S 19.186,-1.278 20,0');
    });

    it('returns path string for Arc', function() {

      var e = new Photon('g1', '#000', 24);
      expect(e.getPath('arc')).toEqual('M 0,0 C -0.823,1.272 -3.219,4.977 -2.462,6.629 S 2.666,8.883 3.958,8.636 C 5.303,8.089 8.613,5.172 10.359,5.676 S 13.346,10.414 14.253,12.007 C 15.153,12.494 19.171,14.317 20.693,13.324 S 22.165,7.919 21.73,6.677');
    });
  });
});