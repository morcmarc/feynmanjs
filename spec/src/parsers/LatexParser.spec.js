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
          'fmfright{i2,o2}',
          'fmf{e}{i1,v1,o1}',
          'fmf{q}{i2,v2,o2}',
          'fmf{ph}{v1,v2}',
          'fmfdot{v1,v2}'
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
      expect(stage.vertices.length).toEqual(2);
    });
  });
});