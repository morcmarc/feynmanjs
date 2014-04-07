var Electron          = require('./../../src/propagators/Electron');
var Quark             = require('./../../src/propagators/Quark');
var Gluon             = require('./../../src/propagators/Gluon');
var Photon            = require('./../../src/propagators/Photon');
var ParticleGenerator = require('./../../src/ParticleGenerator');

describe('ParticleGenerator', function() {

  describe('getParticle()', function () {

    it('throws error if no particle data is given', function() {

      expect(function() {
        ParticleGenerator.getParticle();
      }).toThrow(new Error('Missing data argument!'));
    });

    it('should be able to create Electrons', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'e-', color: '#333', length: 200 });
      expect(e instanceof Electron).toBe(true);
    });

    it('should be able to create Positrons', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'e+', color: '#333', length: 200 });
      expect(e instanceof Electron).toBe(true);
    });

    it('should be able to create Quarks', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'q', color: '#333', length: 200 });
      expect(e instanceof Quark).toBe(true);
    });

    it('should be able to create Anti-Quarks', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'aq', color: '#333', length: 200 });
      expect(e instanceof Quark).toBe(true);
    });

    it('should be able to create Gluons', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'g' });
      expect(e instanceof Gluon).toBe(true);
    });

    it('should be able to create Photons', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'ph' });
      expect(e instanceof Photon).toBe(true);
    });
  });
});