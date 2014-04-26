var Electron = require('./propagators/Electron');
var Quark    = require('./propagators/Quark');
var Gluon    = require('./propagators/Gluon');
var Photon   = require('./propagators/Photon');

module.exports = {

  getParticle: function(data) {

    if(data === undefined) {
      throw new Error('Missing data argument!');
    }

    if(data.type === 'e-') {
      return new Electron(data.id, data.color, data.length, false, data.style);
    }

    if(data.type === 'e+') {
      return new Electron(data.id, data.color, data.length, true, data.style);
    }

    if(data.type === 'q') {
      return new Quark(data.id, data.color, data.length, false, data.style);
    }

    if(data.type === 'aq') {
      return new Quark(data.id, data.color, data.length, true, data.style);
    }

    if(data.type === 'g') {
      return new Gluon(data.id, data.color, data.length, false, data.style);
    }

    if(data.type === 'ph') {
      return new Photon(data.id, data.color, data.length, false, data.style);
    }
  }
};