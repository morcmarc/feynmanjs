var Gluon = require('./../../../src/propagators/Gluon');

describe('Quark', function() {

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
});