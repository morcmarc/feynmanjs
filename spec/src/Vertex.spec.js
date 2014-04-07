var Vertex = require('./../../src/Vertex');

describe('Vertex', function() {

  it('throws an error if no id is given', function() {

    expect(function() {
      new Vertex();
    }).toThrow(new Error('Missing id argument!'));

    expect(function() {
      new Vertex('v1', [], []);
    }).not.toThrow(new Error('Missing id argument!'));
  });

  it('must have either an inbound or outbound attribute', function() {

    expect(function() {
      new Vertex('v1');
    }).toThrow(new Error('Vertices must have either an inbound or outbound attribute!'));

    expect(function() {
      new Vertex('v1', [], []);
    }).toThrow(new Error('Vertices must have either an inbound or outbound attribute!'));
  });
});