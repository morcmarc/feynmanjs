var LatexParser    = require('./../../../src/parsers/LatexParser');
var Electron       = require('./../../../src/propagators/Electron');
var Quark          = require('./../../../src/propagators/Quark');
var Stage          = require('./../../../src/Stage');

describe('LatexParser', function() {

  describe('parse()', function() {

    var parser;
    var data = {
      title      : 'Electron-Positron Annihilation',
      width      : 400,
      height     : 250,
      showAxes   : true,
      lang       : 'latex',
      diagram    : [
          'fmfpen{thin}',
          'fmfleft{i1,o1}',
          'fmfright{i2,o2}',
          'fmf{electron}{i1,v1,o1}',
          'fmf{electron}{i1,v1,o1}', // Redundant data
          'fmf{quark}{i2,v2,o2}',
          'fmf{photon}{v1,v2}',
          'fmfdot{v2,v1}'
        ]
      };

    beforeEach(function () {

      parser = new LatexParser();
    });

    it('throws an error if no data given', function () {

      expect(function () {
        parser.parse();
      }).toThrow(new Error('Missing data argument!'));
    });

    it('returns a new Stage object', function () {

      var stage = parser.parse(data);
      expect(stage instanceof Stage).toBe(true);
    });

    it('creates control points', function() {

      var stage = parser.parse(data);
      expect(stage.cPoints.left[0].id).toEqual('i1');
      expect(stage.cPoints.left[1].id).toEqual('o1');
      expect(stage.cPoints.right[0].id).toEqual('i2');
      expect(stage.cPoints.right[1].id).toEqual('o2');
    });

    it('does not add the same control points to the stage twice', function() {

      var stage = parser.parse(data);
      expect(stage.cPoints.left.length).toEqual(2);
      expect(stage.cPoints.right.length).toEqual(2);
    });

    it('creates vertices from propagators', function() {

      var stage = parser.parse(data);
      expect(stage.vertices[0].id).toEqual('v1');
      expect(stage.vertices[1].id).toEqual('v2');
    });

    it('does not add the same vertex to the stage twice', function() {

      var stage = parser.parse(data);
      expect(stage.vertices.length).toEqual(2);
    });

    it('adds propagators to the stage', function() {

      var stage = parser.parse(data);
      expect(stage.propagators[0] instanceof Electron).toBe(true);
      expect(stage.propagators[1] instanceof Electron).toBe(true);
      expect(stage.propagators[4] instanceof Quark).toBe(true);
      expect(stage.propagators[5] instanceof Quark).toBe(true);
    });

    it('sets vertex visibility', function() {

      var stage = parser.parse(data);
      expect(stage.vertices[0].visible).toBe(true);
      expect(stage.vertices[1].visible).toBe(true);
    });

    it('sets pen size', function() {

      var stage = parser.parse(data);
      expect(stage.penSize).toEqual('thin');
    });

  });
});