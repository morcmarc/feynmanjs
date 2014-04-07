var Gluon = require('./../../../src/propagators/Gluon');

describe('Gluon', function() {

  it('cannot be instantiated without an id', function() {

    expect(function() {
      new Gluon();
    }).toThrow(new Error('Missing id argument!'));
  });

  it('should have defaults', function() {

    var e = new Gluon('g1');
    expect(e.anti).toBe(undefined);
    expect(e.color).toEqual('#009933');
    expect(e.length).toEqual(100);
  });

  it('must implement draw() method', function() {

    var e = new Gluon('e1');
    expect(function() {
      e.draw();
    }).not.toThrow(new Error('Cannot call abstract method!'));
  });

  describe('draw()', function() {

    it('returns SVG path string if no canvas is given', function() {

      var e = new Gluon('g1', '#000', 24);
      expect(e.draw()).toEqual('M0,1 Q3,1 6,2 Q9,4 10,9 Q12,15 6,15 Q0,15 2,9 Q3,4 6,2 Q9,1 12,1 Q15,1 18,2 Q21,4 22,9 Q24,15 18,15 Q12,15 14,9 Q15,4 18,2 Q21,1 24,0');
    });
  });
});