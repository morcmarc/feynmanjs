var Coordinates = require('../../../src/helpers/Coordinates');

var A = { x: 100, y: 60 };
var B = { x: 10,  y: 10 };

describe('Coordinates', function() {

  describe('getAngle()', function() {

    it('returns angle between two points', function() {

      var result = Coordinates.getAngle(A, B).toFixed(2);
      expect(result).toEqual('-150.95');
    });
  });

  describe('getDistance()', function() {

    it('returns distance between two points', function() {

      var result = Coordinates.getDistance(A, B).toFixed(2);
      expect(result).toEqual('102.96');
    });
  });
});