var Quark = require('./../../../src/propagators/Quark');

describe('Quark', function() {

  it('cannot be instantiated without an id', function() {

    expect(function() {
      new Quark();
    }).toThrow(new Error('Missing id argument!'));
  });

  it('should have defaults', function() {

    var e = new Quark('q1');
    expect(e.anti).toBe(false);
    expect(e.color).toEqual('#000');
    expect(e.length).toEqual(100);
  });

  it('must implement draw() method', function() {

    var e = new Quark('e1');
    expect(function() {
      e.draw();
    }).not.toThrow(new Error('Cannot call abstract method!'));
  });

  it('must implement getPath() method', function() {

    var e = new Quark('e1');
    expect(function() {
      e.getPath();
    }).not.toThrow(new Error('Cannot call abstract method!'));
  });
});