var LatexParser    = require('./../../../src/parsers/LatexParser');
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
          'fmfleft{i1,o1}',
          'fmfleft{i3,o3}',
          'fmfright{i2,o2}',
          'fmf{electron}{i1,v1,o1}',
          'fmf{quark}{i2,v2,o2}',
          'fmf{photon}{v1,v2}',
          'fmfdot{v1,v3}'
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

    it('creates vertices', function() {

      var stage = parser.parse(data);
      expect(stage.vertices.left.length).toEqual(2);
      expect(stage.vertices.right.length).toEqual(1);
    });

    it('creates vertices with the right ID', function() {

      var stage = parser.parse(data);
      expect(stage.vertices.left[0].id).toEqual('v1');
      expect(stage.vertices.right[0].id).toEqual('v3');
    });

    it('creates vertices in the right position', function() {

      var stage = parser.parse(data);
      expect(stage.vertices.left[0].position[0]).toEqual('left');
      expect(stage.vertices.right[0].position[0]).toEqual('right');
      expect(stage.vertices.left[0].position[1]).toEqual(1);
      expect(stage.vertices.right[0].position[1]).toEqual(1);
    });

    it('creates vertices with the right inbound-outbound particles', function() {

      var stage = parser.parse(data);
      expect(stage.vertices.left[0].inbound[0]).toEqual('i1');
    });

    it('creates particles with the right Id', function() {

      var stage = parser.parse(data);
      expect(stage.propagators[0].id).toEqual('i1');
      expect(stage.propagators[1].id).toEqual('o1');
      expect(stage.propagators[2].id).toEqual('i2');
    });

    it('dot function sets visibility of a vertex', function() {

      var stage = parser.parse(data);
      expect(stage.vertices.left[0].visible).toBe(true);
      expect(stage.vertices.left[1].visible).toBe(false);
      expect(stage.vertices.right[0].visible).toBe(true);
    });
  });
});