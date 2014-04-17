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
  });
});