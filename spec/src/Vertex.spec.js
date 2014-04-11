var Vertex = require('./../../src/Vertex');

describe('Vertex', function() {

  it('throws an error if no id is given', function() {

    expect(function() {
      var v = new Vertex();
    }).toThrow(new Error('Missing id argument!'));

    expect(function() {
      var v = new Vertex('v1', [], [], []);
    }).not.toThrow(new Error('Missing id argument!'));
  });

  it('throws an error if no position given', function() {

    expect(function() {
      var v = new Vertex('v1');
    }).toThrow(new Error('Missing position argument!'));
  });

  it('must have either an inbound or outbound attribute', function() {

    expect(function() {
      var v = new Vertex('v1', []);
    }).toThrow(new Error('Vertices must have either an inbound or outbound attribute!'));

    expect(function() {
      var v = new Vertex('v1', [], [], []);
    }).toThrow(new Error('Vertices must have either an inbound or outbound attribute!'));
  });

  describe('move()', function() {

    it('sets the correct position depending on Stage size', function() {

      var stageMock = { width: 400, height: 400 };
      var v         = new Vertex('v1', [ 'left', 1 ], [ 'i1' ], [ 'o1' ]);
      
      v.move(stageMock);

      expect(v.x).toEqual(100);
      expect(v.y).toEqual(100);
    });
  });
});