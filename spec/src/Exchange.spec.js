var Exchange = require('./../../src/Exchange');
var Photon   = require('./../../src/propagators/Photon');

var VertexMockA = {};
var VertexMockB = {};

describe('Exchange', function() {

  it('throws an error if no id is given', function() {

    expect(function() {
      new Exchange();
    }).toThrow(new Error('Missing id argument!'));

    expect(function() {
      new Exchange('v1', VertexMockA, VertexMockB);
    }).not.toThrow(new Error('Missing id argument!'));
  });

  it('must have both an inbound and outbound attribute', function() {

    expect(function() {
      new Exchange('v1');
    }).toThrow(new Error('Exchange must have both an inbound and outbound attribute!'));

    expect(function() {
      new Exchange('v1', VertexMockA);
    }).toThrow(new Error('Exchange must have both an inbound and outbound attribute!'));

    expect(function() {
      new Exchange('v1', undefined, VertexMockB);
    }).toThrow(new Error('Exchange must have both an inbound and outbound attribute!'));
  });

  it('throws an error if there are no particles to be exchanged', function() {

    expect(function() {
      new Exchange('e1', VertexMockA, VertexMockB);
    }).toThrow(new Error('No particles given!'));
  });

  it('calls ParticleGenerator to create exchangeable particles', function() {

    var e = new Exchange('v1', VertexMockA, VertexMockB, [ { id: 'p5', type: 'ph' } ]);
    expect(e.particles[0] instanceof Photon).toBe(true);
  });
});