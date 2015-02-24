var Electron = require('./particles/Electron');
var Photon   = require('./particles/Photon');
var Gluon    = require('./particles/Gluon');
var Ghost    = require('./particles/Ghost');

module.exports = {

  getParticle: function(type) {

    switch(type) {

      case 'electron':
        return Electron;
      case 'photon':
        return Photon;
      case 'gluon':
        return Gluon;
      case 'ghost':
        return Ghost;
      default:
        return Electron;
    }
  }
};