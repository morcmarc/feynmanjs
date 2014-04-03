var LatexParser    = require('./../../../src/parsers/LatexParser');
var Stage          = require('./../../../src/Stage');

describe('LatexParser', function() {

  describe('parse()', function() {

    var parser;
    var data = '' +
      '\\begin{fmffile}{electron_positron_annihilation}' +
      ' \\begin{fmfgraph*}(400,400)' +
      '   \\fmfleft{i1,i2}' +
      '   \\fmfright{o1,o2}' +
      '   \\fmf{fermion}{i1,v1,i2}' +
      '   \\fmf{fermion}{o1,v2,o2}' +
      '   \\fmf{photon}{v1,v2}' +
      ' \\end{fmfgraph*}' +
      '\\end{fmffile}';

    beforeEach(function () {

      parser = new LatexParser();
    });

    it('throws an error if no data given', function () {

      expect(function () {
        parser.parse()
      }).toThrow(new Error('Missing data argument!'));
    });

    it('returns a new Stage object', function () {

      var stage = parser.parse(data);
      expect(stage instanceof Stage).toBe(true);
    });
  });
});