var Electron = require('./../../../src/propagators/Electron');

describe('Electron', function() {

  it('cannot be instantiated without an id', function() {

    expect(function() {
      new Electron();
    }).toThrow(new Error('Missing id argument!'));
  });

  it('should have defaults', function() {

    var e = new Electron('e1');
    expect(e.anti).toBe(false);
    expect(e.color).toEqual('#000');
    expect(e.length).toEqual(100);
  });
});