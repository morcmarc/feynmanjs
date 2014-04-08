var Vector = require('./Vector');

var PI = Math.PI;

module.exports = {

  line: function(tile, period, distance) {

    var bezier = ['M'];
    var num    = Math.floor(distance / period);
    var extra  = distance - period * num + 0.1;

    for(var n = 0; n <= num; n++) {

      for(var i = 0, l = tile.length, item; i < l; i++) {

        item = tile[i];

        if(Object.prototype.toString.call( item ) === '[object Array]') {

          if(n < num || item[0] < extra) {
            bezier.push(Vector.normalize(item[0] + period * n, ',', item[1]));
          } else {
            break;
          }

        } else {
          bezier.push(item);
        }

      }
    }
    return bezier.join(' ').replace(/\s[A-Z][^A-Z]*$/, '');
  },

  arc: function(particle, tile, period, distance) {

    var tension = 2;
    var t       = 0.25 * Math.max(tension, 2);
    var phi     = Math.acos(-0.5 / t);
    var theta   = -2 * Math.asin(period / (t * distance));
    var segment = [];
    var bezier  = ['M', '0,0'];

    // get coordinate pairs for the endpoint of segment
    for(var n = 0; n <= (PI - 2 * phi) / theta; n++) {
      segment.push([distance * (t * Math.cos(theta * n + phi) + 0.5), distance * (t * Math.sin(theta * n + phi) - Math.sqrt(t * t - 0.25))]);
    }
    for(var i = 0, l = segment.length - 1, model; i < l; i++) {

      model = (particle === 'photon' ? tile[i % 2] : tile);

      for(var j = 0, m = model.length, item; j < m; j++) {
        item = model[j];
        bezier.push(typeof item === 'object' ? Vector.getPoint(segment[i][0], segment[i][1],
          segment[i+1][0], segment[i+1][1], item[0], item[1]) : item);
      }
    }
    return bezier.join(' ').replace(/\s[A-Z]$/, '');
  },

  loop: function() {

  }
};