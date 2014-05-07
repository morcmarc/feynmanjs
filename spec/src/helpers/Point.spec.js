var Point = require('../../../src/helpers/Point');

var A = { x: 100, y: 60 };
var B = { x: 10,  y: 10 };

describe('Point', function() {

  describe('getAngle()', function() {

    it('returns angle between two points', function() {

      var result = Point.getAngle(A, B, false).toFixed(4);
      expect(result).toEqual('-150.9454');
    });

    it('returns angle between two points in Radian if third argument is true', function() {

      var result = Point.getAngle(A, B, true).toFixed(4);
      expect(result).toEqual('-2.6345');
    })
  });

  describe('getDistance()', function() {

    it('returns distance between two points', function() {

      var result = Point.getDistance(A, B).toFixed(2);
      expect(result).toEqual('102.96');
    });
  });
});