var StandardParser = require('./../../src/parsers/StandardParser');
var LatexParser    = require('./../../src/parsers/LatexParser');
var ParserFactory  = require('./../../src/ParserFactory');

describe('ParserFactory', function () {
  
  var parserFactory = new ParserFactory();

  describe('getParser()', function () {
    
    it('returns Latex Parser when lang is set to "latex"', function() {

      var parser = parserFactory.getParser('latex');
      expect(parser instanceof LatexParser).toBe(true);
    });

    it('returns Standard Parser when no lang has been specified', function() {

      var parser = parserFactory.getParser();
      expect(parser instanceof StandardParser).toBe(true);
    });

    it('returns Standard Parser when lang is set to "standard"', function() {

      var parser = parserFactory.getParser('standard');
      expect(parser instanceof StandardParser).toBe(true);
    });
  });
});