module.exports = {

  getAngle: function(A, B, inRadian) {

    var r = inRadian ? 1 : (180 / Math.PI);

    var diffX   = B.x - A.x;
    var diffY   = B.y - A.y;
    return Math.atan2(diffY, diffX) * r;
  },

  getDistance: function(A, B) {

    var diffX   = B.x - A.x;
    var diffY   = B.y - A.y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  }
};