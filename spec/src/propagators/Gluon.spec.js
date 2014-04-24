var Gluon = require('./../../../src/propagators/Gluon');

describe('Gluon', function() {

  it('cannot be instantiated without an id', function() {

    expect(function() {
      new Gluon();
    }).toThrow(new Error('Missing id argument!'));
  });

  it('should have defaults', function() {

    var e = new Gluon('g1');
    expect(e.color).toEqual('#009933');
    expect(e.length).toEqual(96);
  });

  it('must implement draw() method', function() {

    var e = new Gluon('e1');
    expect(function() {
      e.draw();
    }).not.toThrow(new Error('Cannot call abstract method!'));
  });

  it('must implement getPath() method', function() {

    var e = new Gluon('e1');
    expect(function() {
      e.getPath();
    }).not.toThrow(new Error('Cannot call abstract method!'));
  });

  describe('draw()', function() {

    it('returns SVG path string if no canvas is given', function() {

      var e = new Gluon('g1', '#000', 24);
      expect(e.getPath('line')).toEqual('M 0,0 A 11.25 9 0 0 0 11.25,-9 A 3.75 6 0 1 0 3.75,-9 A 11.25 9 0 0 0 15,0');
    });
  });
});