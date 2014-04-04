var Electron          = require('./../../src/propagators/Electron');
var Quark             = require('./../../src/propagators/Quark');
var Gluon             = require('./../../src/propagators/Gluon');
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
      expect(e.color).toEqual('#333');
      expect(e.length).toEqual(200);
      expect(e.anti).toBe(false);
    });

    it('should be able to create Positrons', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'e+', color: '#333', length: 200 });
      expect(e instanceof Electron).toBe(true);
      expect(e.color).toEqual('#333');
      expect(e.length).toEqual(200);
      expect(e.anti).toBe(true);
    });

    it('should be able to create Quarks', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'q', color: '#333', length: 200 });
      expect(e instanceof Quark).toBe(true);
      expect(e.color).toEqual('#333');
      expect(e.length).toEqual(200);
      expect(e.anti).toBe(false);
    });

    it('should be able to create Anti-Quarks', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'aq', color: '#333', length: 200 });
      expect(e instanceof Quark).toBe(true);
      expect(e.color).toEqual('#333');
      expect(e.length).toEqual(200);
      expect(e.anti).toBe(true);
    });

    it('should be able to create Gluons', function() {

      var e = ParticleGenerator.getParticle({ id: 'p1', type: 'g' });
      expect(e instanceof Gluon).toBe(true);
      expect(e.color).toEqual('#009933');
      expect(e.length).toEqual(100);
      expect(e.anti).toBe(undefined);
    });
  });
});