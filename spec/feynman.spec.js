;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./../../src/ParserFactory":5,"./../../src/parsers/LatexParser":8,"./../../src/parsers/StandardParser":9}],2:[function(require,module,exports){
var Feynman     = require('./../../src/index');

window.SVG  = function() {};


describe('Feynman', function() {

  var canvas = document.createElement('canvas');

  it('cannot be instantiated without a canvas', function() {

    expect(function() {
      var f = new Feynman();
    }).toThrow(new Error('Missing canvas#id argument!'));

    expect(function() {
      var f = new Feynman(canvas);
    }).not.toThrow(new Error('Missing canvas#id argument!'));
  });

  describe('draw()', function() {

    it('should throw error if no data argument is given', function() {

      expect(function() {
        var f = new Feynman(canvas);
        f.draw();
      }).toThrow(new Error('Missing data argument!'));

      expect(function() {
        var f = new Feynman(canvas);
        f.draw({ i_am: 'data' });
      }).not.toThrow(new Error('Missing data argument!'));
    });
  });
});
},{"./../../src/index":7}],3:[function(require,module,exports){
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
},{"./../../../src/Stage":6,"./../../../src/parsers/LatexParser":8}],4:[function(require,module,exports){
var StandardParser = require('./../../../src/parsers/StandardParser');
var Stage          = require('./../../../src/Stage');

describe('StandardParser', function() {

  describe('parse()', function() {

    var parser;
    var data = {
      title      : 'Electron-Positron Annihilation',
      layout     : 'time-space', // X: time, Y: space. Alternative: 'space-time' (X: space, Y: time)
      width      : 400,
      height     : 250,
      showAxes   : true,
      propagators: [
        { id: 'p1', type: 'e-', color: '#333', length: 200 },
        { id: 'p2', type: 'e+', color: '#333' },
        { id: 'p3', type: 'aq', color: '#333', radiates: [{ id: 'p5', type: 'g', color: '#009933' }] },
        { id: 'p4', type: 'q',  color: '#333' }
      ],
      vertices: [
        {
          id: 'v1',
          inbound : [ 'p1', 'p2' ],
          outbound: [ { id: 'p5', type: 'ph', color: '#00F' } ]
        },
        {
          id: 'v2',
          inbound : [ 'p5' ],
          outbound: [ 'p3', 'p4' ]
        }
      ],
      exchanges: [
        {
          id: 'e1',
          inbound  : [ 'v1' ],
          outbound : [ 'v2' ],
          particles: [ { id: 'p5', type: 'ph', color: '#00F' } ]
        }
      ]
    };
    var emptyData = {
      propagators : [],
      vertices    : []
    };

    beforeEach(function() {

      parser = new StandardParser();
    });

    it('throws an error if no data given', function() {

      expect(function() {
        parser.parse()
      }).toThrow(new Error('Missing data argument!'));
    });

    it('returns a new Stage object', function() {

      var stage = parser.parse(data);
      expect(stage instanceof Stage).toBe(true);
    });

    it('sets the title if there is any', function() {

      var stage = parser.parse(data);
      expect(stage.title).toEqual(data.title);

      var stage2 = parser.parse(emptyData);
      expect(stage2.title).toEqual('Feynman');
    });

    it('sets the layout if there is any', function() {

      var stage = parser.parse(data);
      expect(stage.layout).toEqual(data.layout);

      var stage2 = parser.parse(emptyData);
      expect(stage2.layout).toEqual('time-space');
    });

    it('sets width and height if there is any', function() {

      var stage = parser.parse(data);
      expect(stage.width).toEqual(data.width);
      expect(stage.height).toEqual(data.height);

      var stage2 = parser.parse(emptyData);
      expect(stage2.width).toEqual(100);
      expect(stage2.height).toEqual(100);
    });

    it('sets axes if there is any', function() {

      var stage = parser.parse(data);
      expect(stage.showAxes).toEqual(data.showAxes);

      var stage2 = parser.parse(emptyData);
      expect(stage2.showAxes).toEqual(true);
    });

    it('throws error if there are no propagators', function() {

      expect(function() {
        parser.parse({});
      }).toThrow(new Error('Missing propagators!'));
    });

    it('sets propagators', function() {

      var stage = parser.parse(data);
      expect(stage.propagators.length).toEqual(data.propagators.length);
    });

    it('throws error if there are no vertices', function() {

      expect(function() {
        parser.parse({ propagators: [] });
      }).toThrow(new Error('Missing vertices!'));
    });

    it('sets vertices', function() {

      var stage = parser.parse(data);
      expect(stage.vertices.length).toEqual(data.vertices.length);
    });

    it('sets exchanges', function() {

      var stage = parser.parse(data);
      expect(stage.exchanges.length).toEqual(data.exchanges.length);

      var stage2 = parser.parse(emptyData);
      expect(stage2.exchanges.length).toEqual(0);
    });
  });
});
},{"./../../../src/Stage":6,"./../../../src/parsers/StandardParser":9}],5:[function(require,module,exports){
var StandardParser = require('./parsers/StandardParser');
var LatexParser    = require('./parsers/LatexParser');

module.exports = (function () {
  
  var Parser = function() {

  };

  Parser.prototype.getParser = function(lang) {

    if(lang === 'latex') {
      return new LatexParser();
    }
    return new StandardParser();
  };

  return Parser;

})();
},{"./parsers/LatexParser":8,"./parsers/StandardParser":9}],6:[function(require,module,exports){
module.exports = (function() {

  var Stage = function() {

    // Generic Attributes (optional)
    this.title    = 'Feynman';
    this.layout   = 'time-space';
    this.width    = 100;
    this.height   = 100;
    this.showAxes = true;

    // Main properties (required)
    this.propagators = [];
    this.vertices    = [];

    // Main properties (optional)
    this.exchanges   = [];
  };

  return Stage;
})();
},{}],7:[function(require,module,exports){
var ParserFactory = require('./ParserFactory');

module.exports = (function() {

  var Feynman = function(canvas) {

    if (typeof canvas === 'undefined') {
      throw new Error('Missing canvas#id argument!');
    }

    this._version = '1.0.0';
    this._canvas  = new SVG(canvas);

    return this;
  };

  Feynman.prototype.draw = function(data) {

    if (typeof data === 'undefined') {
      throw new Error('Missing data argument!');
    }

    var parser = new ParserFactory().getParser(data.lang);
    var parsedData = parser.parse(data);
  };

  return Feynman;
})();
},{"./ParserFactory":5}],8:[function(require,module,exports){
var Stage = require('./../Stage');

module.exports = (function() {
  
  var LatexParser = function() {

    return this;
  };

  LatexParser.prototype.parse = function(data) {

    if(data === undefined) {
      throw new Error('Missing data argument!');
    }

    var stage = new Stage();

    return stage;
  };

  return LatexParser;
})();
},{"./../Stage":6}],9:[function(require,module,exports){
var Stage = require('./../Stage');

module.exports = (function() {
  
  var StandardParser = function() {

    return this;
  };

  StandardParser.prototype.parse = function(data) {

    if(data === undefined) {
      throw new Error('Missing data argument!');
    }

    var stage = new Stage();

    _setTitle(stage, data.title);
    _setLayout(stage, data.layout);
    _setDimension(stage, data.width, data.height);
    _setShowAxes(stage, data.showAxes);
    _setPropagators(stage, data.propagators);
    _setVertices(stage, data.vertices);
    _setExchanges(stage, data.exchanges);

    return stage;
  };

  var _setTitle = function(stage, title) {

    if(title !== undefined) {
      stage.title = title;
    }
  };

  var _setLayout = function(stage, layout) {

    if(layout !== undefined) {
      stage.layout = layout;
    }
  };

  var _setDimension = function(stage, width, height) {

    if(width !== undefined) {
      stage.width = width;
    }
    if(height !== undefined) {
      stage.height = height;
    }
  };

  var _setShowAxes = function(stage, showAxes) {

    if(showAxes !== undefined) {
      stage.showAxes = showAxes;
    }
  };

  var _setPropagators = function(stage, propagators) {

    if(propagators === undefined) {
      throw new Error('Missing propagators!');
    }
    stage.propagators = propagators;
  };

  var _setVertices = function(stage, vertices) {

    if(vertices === undefined) {
      throw new Error('Missing vertices!');
    }
    stage.vertices = vertices;
  };

  var _setExchanges = function(stage, exchanges) {

    if(exchanges !== undefined) {
      stage.exchanges = exchanges;
    }
  };

  return StandardParser;
})();
},{"./../Stage":6}]},{},[1,2,3,4])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NwZWMvc3JjL1BhcnNlckZhY3Rvcnkuc3BlYy5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3BlYy9zcmMvaW5kZXguc3BlYy5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3BlYy9zcmMvcGFyc2Vycy9MYXRleFBhcnNlci5zcGVjLmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcGVjL3NyYy9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyLnNwZWMuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9QYXJzZXJGYWN0b3J5LmpzIiwiL1VzZXJzL21hcmNlbGwvQ29kZS9HaXRodWIvZmV5bm1hbi9zcmMvU3RhZ2UuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9tYXJjZWxsL0NvZGUvR2l0aHViL2ZleW5tYW4vc3JjL3BhcnNlcnMvTGF0ZXhQYXJzZXIuanMiLCIvVXNlcnMvbWFyY2VsbC9Db2RlL0dpdGh1Yi9mZXlubWFuL3NyYy9wYXJzZXJzL1N0YW5kYXJkUGFyc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInZhciBTdGFuZGFyZFBhcnNlciA9IHJlcXVpcmUoJy4vLi4vLi4vc3JjL3BhcnNlcnMvU3RhbmRhcmRQYXJzZXInKTtcbnZhciBMYXRleFBhcnNlciAgICA9IHJlcXVpcmUoJy4vLi4vLi4vc3JjL3BhcnNlcnMvTGF0ZXhQYXJzZXInKTtcbnZhciBQYXJzZXJGYWN0b3J5ICA9IHJlcXVpcmUoJy4vLi4vLi4vc3JjL1BhcnNlckZhY3RvcnknKTtcblxuZGVzY3JpYmUoJ1BhcnNlckZhY3RvcnknLCBmdW5jdGlvbiAoKSB7XG4gIFxuICB2YXIgcGFyc2VyRmFjdG9yeSA9IG5ldyBQYXJzZXJGYWN0b3J5KCk7XG5cbiAgZGVzY3JpYmUoJ2dldFBhcnNlcigpJywgZnVuY3Rpb24gKCkge1xuICAgIFxuICAgIGl0KCdyZXR1cm5zIExhdGV4IFBhcnNlciB3aGVuIGxhbmcgaXMgc2V0IHRvIFwibGF0ZXhcIicsIGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgcGFyc2VyID0gcGFyc2VyRmFjdG9yeS5nZXRQYXJzZXIoJ2xhdGV4Jyk7XG4gICAgICBleHBlY3QocGFyc2VyIGluc3RhbmNlb2YgTGF0ZXhQYXJzZXIpLnRvQmUodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBpdCgncmV0dXJucyBTdGFuZGFyZCBQYXJzZXIgd2hlbiBubyBsYW5nIGhhcyBiZWVuIHNwZWNpZmllZCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgcGFyc2VyID0gcGFyc2VyRmFjdG9yeS5nZXRQYXJzZXIoKTtcbiAgICAgIGV4cGVjdChwYXJzZXIgaW5zdGFuY2VvZiBTdGFuZGFyZFBhcnNlcikudG9CZSh0cnVlKTtcbiAgICB9KTtcblxuICAgIGl0KCdyZXR1cm5zIFN0YW5kYXJkIFBhcnNlciB3aGVuIGxhbmcgaXMgc2V0IHRvIFwic3RhbmRhcmRcIicsIGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgcGFyc2VyID0gcGFyc2VyRmFjdG9yeS5nZXRQYXJzZXIoJ3N0YW5kYXJkJyk7XG4gICAgICBleHBlY3QocGFyc2VyIGluc3RhbmNlb2YgU3RhbmRhcmRQYXJzZXIpLnRvQmUodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7IiwidmFyIEZleW5tYW4gICAgID0gcmVxdWlyZSgnLi8uLi8uLi9zcmMvaW5kZXgnKTtcblxud2luZG93LlNWRyAgPSBmdW5jdGlvbigpIHt9O1xuXG5cbmRlc2NyaWJlKCdGZXlubWFuJywgZnVuY3Rpb24oKSB7XG5cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXG4gIGl0KCdjYW5ub3QgYmUgaW5zdGFudGlhdGVkIHdpdGhvdXQgYSBjYW52YXMnLCBmdW5jdGlvbigpIHtcblxuICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmID0gbmV3IEZleW5tYW4oKTtcbiAgICB9KS50b1Rocm93KG5ldyBFcnJvcignTWlzc2luZyBjYW52YXMjaWQgYXJndW1lbnQhJykpO1xuXG4gICAgZXhwZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGYgPSBuZXcgRmV5bm1hbihjYW52YXMpO1xuICAgIH0pLm5vdC50b1Rocm93KG5ldyBFcnJvcignTWlzc2luZyBjYW52YXMjaWQgYXJndW1lbnQhJykpO1xuICB9KTtcblxuICBkZXNjcmliZSgnZHJhdygpJywgZnVuY3Rpb24oKSB7XG5cbiAgICBpdCgnc2hvdWxkIHRocm93IGVycm9yIGlmIG5vIGRhdGEgYXJndW1lbnQgaXMgZ2l2ZW4nLCBmdW5jdGlvbigpIHtcblxuICAgICAgZXhwZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZiA9IG5ldyBGZXlubWFuKGNhbnZhcyk7XG4gICAgICAgIGYuZHJhdygpO1xuICAgICAgfSkudG9UaHJvdyhuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKSk7XG5cbiAgICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGYgPSBuZXcgRmV5bm1hbihjYW52YXMpO1xuICAgICAgICBmLmRyYXcoeyBpX2FtOiAnZGF0YScgfSk7XG4gICAgICB9KS5ub3QudG9UaHJvdyhuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKSk7XG4gICAgfSk7XG4gIH0pO1xufSk7IiwidmFyIExhdGV4UGFyc2VyICAgID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9zcmMvcGFyc2Vycy9MYXRleFBhcnNlcicpO1xudmFyIFN0YWdlICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9zcmMvU3RhZ2UnKTtcblxuZGVzY3JpYmUoJ0xhdGV4UGFyc2VyJywgZnVuY3Rpb24oKSB7XG5cbiAgZGVzY3JpYmUoJ3BhcnNlKCknLCBmdW5jdGlvbigpIHtcblxuICAgIHZhciBwYXJzZXI7XG4gICAgdmFyIGRhdGEgPSAnJyArXG4gICAgICAnXFxcXGJlZ2lue2ZtZmZpbGV9e2VsZWN0cm9uX3Bvc2l0cm9uX2FubmloaWxhdGlvbn0nICtcbiAgICAgICcgXFxcXGJlZ2lue2ZtZmdyYXBoKn0oNDAwLDQwMCknICtcbiAgICAgICcgICBcXFxcZm1mbGVmdHtpMSxpMn0nICtcbiAgICAgICcgICBcXFxcZm1mcmlnaHR7bzEsbzJ9JyArXG4gICAgICAnICAgXFxcXGZtZntmZXJtaW9ufXtpMSx2MSxpMn0nICtcbiAgICAgICcgICBcXFxcZm1me2Zlcm1pb259e28xLHYyLG8yfScgK1xuICAgICAgJyAgIFxcXFxmbWZ7cGhvdG9ufXt2MSx2Mn0nICtcbiAgICAgICcgXFxcXGVuZHtmbWZncmFwaCp9JyArXG4gICAgICAnXFxcXGVuZHtmbWZmaWxlfSc7XG5cbiAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcblxuICAgICAgcGFyc2VyID0gbmV3IExhdGV4UGFyc2VyKCk7XG4gICAgfSk7XG5cbiAgICBpdCgndGhyb3dzIGFuIGVycm9yIGlmIG5vIGRhdGEgZ2l2ZW4nLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGV4cGVjdChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHBhcnNlci5wYXJzZSgpXG4gICAgICB9KS50b1Rocm93KG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpKTtcbiAgICB9KTtcblxuICAgIGl0KCdyZXR1cm5zIGEgbmV3IFN0YWdlIG9iamVjdCcsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHN0YWdlID0gcGFyc2VyLnBhcnNlKGRhdGEpO1xuICAgICAgZXhwZWN0KHN0YWdlIGluc3RhbmNlb2YgU3RhZ2UpLnRvQmUodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xufSk7IiwidmFyIFN0YW5kYXJkUGFyc2VyID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9zcmMvcGFyc2Vycy9TdGFuZGFyZFBhcnNlcicpO1xudmFyIFN0YWdlICAgICAgICAgID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9zcmMvU3RhZ2UnKTtcblxuZGVzY3JpYmUoJ1N0YW5kYXJkUGFyc2VyJywgZnVuY3Rpb24oKSB7XG5cbiAgZGVzY3JpYmUoJ3BhcnNlKCknLCBmdW5jdGlvbigpIHtcblxuICAgIHZhciBwYXJzZXI7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICB0aXRsZSAgICAgIDogJ0VsZWN0cm9uLVBvc2l0cm9uIEFubmloaWxhdGlvbicsXG4gICAgICBsYXlvdXQgICAgIDogJ3RpbWUtc3BhY2UnLCAvLyBYOiB0aW1lLCBZOiBzcGFjZS4gQWx0ZXJuYXRpdmU6ICdzcGFjZS10aW1lJyAoWDogc3BhY2UsIFk6IHRpbWUpXG4gICAgICB3aWR0aCAgICAgIDogNDAwLFxuICAgICAgaGVpZ2h0ICAgICA6IDI1MCxcbiAgICAgIHNob3dBeGVzICAgOiB0cnVlLFxuICAgICAgcHJvcGFnYXRvcnM6IFtcbiAgICAgICAgeyBpZDogJ3AxJywgdHlwZTogJ2UtJywgY29sb3I6ICcjMzMzJywgbGVuZ3RoOiAyMDAgfSxcbiAgICAgICAgeyBpZDogJ3AyJywgdHlwZTogJ2UrJywgY29sb3I6ICcjMzMzJyB9LFxuICAgICAgICB7IGlkOiAncDMnLCB0eXBlOiAnYXEnLCBjb2xvcjogJyMzMzMnLCByYWRpYXRlczogW3sgaWQ6ICdwNScsIHR5cGU6ICdnJywgY29sb3I6ICcjMDA5OTMzJyB9XSB9LFxuICAgICAgICB7IGlkOiAncDQnLCB0eXBlOiAncScsICBjb2xvcjogJyMzMzMnIH1cbiAgICAgIF0sXG4gICAgICB2ZXJ0aWNlczogW1xuICAgICAgICB7XG4gICAgICAgICAgaWQ6ICd2MScsXG4gICAgICAgICAgaW5ib3VuZCA6IFsgJ3AxJywgJ3AyJyBdLFxuICAgICAgICAgIG91dGJvdW5kOiBbIHsgaWQ6ICdwNScsIHR5cGU6ICdwaCcsIGNvbG9yOiAnIzAwRicgfSBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogJ3YyJyxcbiAgICAgICAgICBpbmJvdW5kIDogWyAncDUnIF0sXG4gICAgICAgICAgb3V0Ym91bmQ6IFsgJ3AzJywgJ3A0JyBdXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBleGNoYW5nZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAnZTEnLFxuICAgICAgICAgIGluYm91bmQgIDogWyAndjEnIF0sXG4gICAgICAgICAgb3V0Ym91bmQgOiBbICd2MicgXSxcbiAgICAgICAgICBwYXJ0aWNsZXM6IFsgeyBpZDogJ3A1JywgdHlwZTogJ3BoJywgY29sb3I6ICcjMDBGJyB9IF1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH07XG4gICAgdmFyIGVtcHR5RGF0YSA9IHtcbiAgICAgIHByb3BhZ2F0b3JzIDogW10sXG4gICAgICB2ZXJ0aWNlcyAgICA6IFtdXG4gICAgfTtcblxuICAgIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgIHBhcnNlciA9IG5ldyBTdGFuZGFyZFBhcnNlcigpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Rocm93cyBhbiBlcnJvciBpZiBubyBkYXRhIGdpdmVuJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgcGFyc2VyLnBhcnNlKClcbiAgICAgIH0pLnRvVGhyb3cobmV3IEVycm9yKCdNaXNzaW5nIGRhdGEgYXJndW1lbnQhJykpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3JldHVybnMgYSBuZXcgU3RhZ2Ugb2JqZWN0JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzdGFnZSA9IHBhcnNlci5wYXJzZShkYXRhKTtcbiAgICAgIGV4cGVjdChzdGFnZSBpbnN0YW5jZW9mIFN0YWdlKS50b0JlKHRydWUpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3NldHMgdGhlIHRpdGxlIGlmIHRoZXJlIGlzIGFueScsIGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc3RhZ2UgPSBwYXJzZXIucGFyc2UoZGF0YSk7XG4gICAgICBleHBlY3Qoc3RhZ2UudGl0bGUpLnRvRXF1YWwoZGF0YS50aXRsZSk7XG5cbiAgICAgIHZhciBzdGFnZTIgPSBwYXJzZXIucGFyc2UoZW1wdHlEYXRhKTtcbiAgICAgIGV4cGVjdChzdGFnZTIudGl0bGUpLnRvRXF1YWwoJ0ZleW5tYW4nKTtcbiAgICB9KTtcblxuICAgIGl0KCdzZXRzIHRoZSBsYXlvdXQgaWYgdGhlcmUgaXMgYW55JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzdGFnZSA9IHBhcnNlci5wYXJzZShkYXRhKTtcbiAgICAgIGV4cGVjdChzdGFnZS5sYXlvdXQpLnRvRXF1YWwoZGF0YS5sYXlvdXQpO1xuXG4gICAgICB2YXIgc3RhZ2UyID0gcGFyc2VyLnBhcnNlKGVtcHR5RGF0YSk7XG4gICAgICBleHBlY3Qoc3RhZ2UyLmxheW91dCkudG9FcXVhbCgndGltZS1zcGFjZScpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3NldHMgd2lkdGggYW5kIGhlaWdodCBpZiB0aGVyZSBpcyBhbnknLCBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHN0YWdlID0gcGFyc2VyLnBhcnNlKGRhdGEpO1xuICAgICAgZXhwZWN0KHN0YWdlLndpZHRoKS50b0VxdWFsKGRhdGEud2lkdGgpO1xuICAgICAgZXhwZWN0KHN0YWdlLmhlaWdodCkudG9FcXVhbChkYXRhLmhlaWdodCk7XG5cbiAgICAgIHZhciBzdGFnZTIgPSBwYXJzZXIucGFyc2UoZW1wdHlEYXRhKTtcbiAgICAgIGV4cGVjdChzdGFnZTIud2lkdGgpLnRvRXF1YWwoMTAwKTtcbiAgICAgIGV4cGVjdChzdGFnZTIuaGVpZ2h0KS50b0VxdWFsKDEwMCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2V0cyBheGVzIGlmIHRoZXJlIGlzIGFueScsIGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc3RhZ2UgPSBwYXJzZXIucGFyc2UoZGF0YSk7XG4gICAgICBleHBlY3Qoc3RhZ2Uuc2hvd0F4ZXMpLnRvRXF1YWwoZGF0YS5zaG93QXhlcyk7XG5cbiAgICAgIHZhciBzdGFnZTIgPSBwYXJzZXIucGFyc2UoZW1wdHlEYXRhKTtcbiAgICAgIGV4cGVjdChzdGFnZTIuc2hvd0F4ZXMpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBpdCgndGhyb3dzIGVycm9yIGlmIHRoZXJlIGFyZSBubyBwcm9wYWdhdG9ycycsIGZ1bmN0aW9uKCkge1xuXG4gICAgICBleHBlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhcnNlci5wYXJzZSh7fSk7XG4gICAgICB9KS50b1Rocm93KG5ldyBFcnJvcignTWlzc2luZyBwcm9wYWdhdG9ycyEnKSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2V0cyBwcm9wYWdhdG9ycycsIGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc3RhZ2UgPSBwYXJzZXIucGFyc2UoZGF0YSk7XG4gICAgICBleHBlY3Qoc3RhZ2UucHJvcGFnYXRvcnMubGVuZ3RoKS50b0VxdWFsKGRhdGEucHJvcGFnYXRvcnMubGVuZ3RoKTtcbiAgICB9KTtcblxuICAgIGl0KCd0aHJvd3MgZXJyb3IgaWYgdGhlcmUgYXJlIG5vIHZlcnRpY2VzJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgcGFyc2VyLnBhcnNlKHsgcHJvcGFnYXRvcnM6IFtdIH0pO1xuICAgICAgfSkudG9UaHJvdyhuZXcgRXJyb3IoJ01pc3NpbmcgdmVydGljZXMhJykpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3NldHMgdmVydGljZXMnLCBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHN0YWdlID0gcGFyc2VyLnBhcnNlKGRhdGEpO1xuICAgICAgZXhwZWN0KHN0YWdlLnZlcnRpY2VzLmxlbmd0aCkudG9FcXVhbChkYXRhLnZlcnRpY2VzLmxlbmd0aCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2V0cyBleGNoYW5nZXMnLCBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHN0YWdlID0gcGFyc2VyLnBhcnNlKGRhdGEpO1xuICAgICAgZXhwZWN0KHN0YWdlLmV4Y2hhbmdlcy5sZW5ndGgpLnRvRXF1YWwoZGF0YS5leGNoYW5nZXMubGVuZ3RoKTtcblxuICAgICAgdmFyIHN0YWdlMiA9IHBhcnNlci5wYXJzZShlbXB0eURhdGEpO1xuICAgICAgZXhwZWN0KHN0YWdlMi5leGNoYW5nZXMubGVuZ3RoKS50b0VxdWFsKDApO1xuICAgIH0pO1xuICB9KTtcbn0pOyIsInZhciBTdGFuZGFyZFBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2Vycy9TdGFuZGFyZFBhcnNlcicpO1xudmFyIExhdGV4UGFyc2VyICAgID0gcmVxdWlyZSgnLi9wYXJzZXJzL0xhdGV4UGFyc2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgXG4gIHZhciBQYXJzZXIgPSBmdW5jdGlvbigpIHtcblxuICB9O1xuXG4gIFBhcnNlci5wcm90b3R5cGUuZ2V0UGFyc2VyID0gZnVuY3Rpb24obGFuZykge1xuXG4gICAgaWYobGFuZyA9PT0gJ2xhdGV4Jykge1xuICAgICAgcmV0dXJuIG5ldyBMYXRleFBhcnNlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFN0YW5kYXJkUGFyc2VyKCk7XG4gIH07XG5cbiAgcmV0dXJuIFBhcnNlcjtcblxufSkoKTsiLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgU3RhZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIEdlbmVyaWMgQXR0cmlidXRlcyAob3B0aW9uYWwpXG4gICAgdGhpcy50aXRsZSAgICA9ICdGZXlubWFuJztcbiAgICB0aGlzLmxheW91dCAgID0gJ3RpbWUtc3BhY2UnO1xuICAgIHRoaXMud2lkdGggICAgPSAxMDA7XG4gICAgdGhpcy5oZWlnaHQgICA9IDEwMDtcbiAgICB0aGlzLnNob3dBeGVzID0gdHJ1ZTtcblxuICAgIC8vIE1haW4gcHJvcGVydGllcyAocmVxdWlyZWQpXG4gICAgdGhpcy5wcm9wYWdhdG9ycyA9IFtdO1xuICAgIHRoaXMudmVydGljZXMgICAgPSBbXTtcblxuICAgIC8vIE1haW4gcHJvcGVydGllcyAob3B0aW9uYWwpXG4gICAgdGhpcy5leGNoYW5nZXMgICA9IFtdO1xuICB9O1xuXG4gIHJldHVybiBTdGFnZTtcbn0pKCk7IiwidmFyIFBhcnNlckZhY3RvcnkgPSByZXF1aXJlKCcuL1BhcnNlckZhY3RvcnknKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEZleW5tYW4gPSBmdW5jdGlvbihjYW52YXMpIHtcblxuICAgIGlmICh0eXBlb2YgY2FudmFzID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNhbnZhcyNpZCBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB0aGlzLl92ZXJzaW9uID0gJzEuMC4wJztcbiAgICB0aGlzLl9jYW52YXMgID0gbmV3IFNWRyhjYW52YXMpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRmV5bm1hbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBwYXJzZXIgPSBuZXcgUGFyc2VyRmFjdG9yeSgpLmdldFBhcnNlcihkYXRhLmxhbmcpO1xuICAgIHZhciBwYXJzZWREYXRhID0gcGFyc2VyLnBhcnNlKGRhdGEpO1xuICB9O1xuXG4gIHJldHVybiBGZXlubWFuO1xufSkoKTsiLCJ2YXIgU3RhZ2UgPSByZXF1aXJlKCcuLy4uL1N0YWdlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBcbiAgdmFyIExhdGV4UGFyc2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBMYXRleFBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBkYXRhIGFyZ3VtZW50IScpO1xuICAgIH1cblxuICAgIHZhciBzdGFnZSA9IG5ldyBTdGFnZSgpO1xuXG4gICAgcmV0dXJuIHN0YWdlO1xuICB9O1xuXG4gIHJldHVybiBMYXRleFBhcnNlcjtcbn0pKCk7IiwidmFyIFN0YWdlID0gcmVxdWlyZSgnLi8uLi9TdGFnZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgXG4gIHZhciBTdGFuZGFyZFBhcnNlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgU3RhbmRhcmRQYXJzZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaWYoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgZGF0YSBhcmd1bWVudCEnKTtcbiAgICB9XG5cbiAgICB2YXIgc3RhZ2UgPSBuZXcgU3RhZ2UoKTtcblxuICAgIF9zZXRUaXRsZShzdGFnZSwgZGF0YS50aXRsZSk7XG4gICAgX3NldExheW91dChzdGFnZSwgZGF0YS5sYXlvdXQpO1xuICAgIF9zZXREaW1lbnNpb24oc3RhZ2UsIGRhdGEud2lkdGgsIGRhdGEuaGVpZ2h0KTtcbiAgICBfc2V0U2hvd0F4ZXMoc3RhZ2UsIGRhdGEuc2hvd0F4ZXMpO1xuICAgIF9zZXRQcm9wYWdhdG9ycyhzdGFnZSwgZGF0YS5wcm9wYWdhdG9ycyk7XG4gICAgX3NldFZlcnRpY2VzKHN0YWdlLCBkYXRhLnZlcnRpY2VzKTtcbiAgICBfc2V0RXhjaGFuZ2VzKHN0YWdlLCBkYXRhLmV4Y2hhbmdlcyk7XG5cbiAgICByZXR1cm4gc3RhZ2U7XG4gIH07XG5cbiAgdmFyIF9zZXRUaXRsZSA9IGZ1bmN0aW9uKHN0YWdlLCB0aXRsZSkge1xuXG4gICAgaWYodGl0bGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UudGl0bGUgPSB0aXRsZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIF9zZXRMYXlvdXQgPSBmdW5jdGlvbihzdGFnZSwgbGF5b3V0KSB7XG5cbiAgICBpZihsYXlvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UubGF5b3V0ID0gbGF5b3V0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldERpbWVuc2lvbiA9IGZ1bmN0aW9uKHN0YWdlLCB3aWR0aCwgaGVpZ2h0KSB7XG5cbiAgICBpZih3aWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS53aWR0aCA9IHdpZHRoO1xuICAgIH1cbiAgICBpZihoZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc3RhZ2UuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFNob3dBeGVzID0gZnVuY3Rpb24oc3RhZ2UsIHNob3dBeGVzKSB7XG5cbiAgICBpZihzaG93QXhlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdGFnZS5zaG93QXhlcyA9IHNob3dBeGVzO1xuICAgIH1cbiAgfTtcblxuICB2YXIgX3NldFByb3BhZ2F0b3JzID0gZnVuY3Rpb24oc3RhZ2UsIHByb3BhZ2F0b3JzKSB7XG5cbiAgICBpZihwcm9wYWdhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgcHJvcGFnYXRvcnMhJyk7XG4gICAgfVxuICAgIHN0YWdlLnByb3BhZ2F0b3JzID0gcHJvcGFnYXRvcnM7XG4gIH07XG5cbiAgdmFyIF9zZXRWZXJ0aWNlcyA9IGZ1bmN0aW9uKHN0YWdlLCB2ZXJ0aWNlcykge1xuXG4gICAgaWYodmVydGljZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHZlcnRpY2VzIScpO1xuICAgIH1cbiAgICBzdGFnZS52ZXJ0aWNlcyA9IHZlcnRpY2VzO1xuICB9O1xuXG4gIHZhciBfc2V0RXhjaGFuZ2VzID0gZnVuY3Rpb24oc3RhZ2UsIGV4Y2hhbmdlcykge1xuXG4gICAgaWYoZXhjaGFuZ2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHN0YWdlLmV4Y2hhbmdlcyA9IGV4Y2hhbmdlcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFN0YW5kYXJkUGFyc2VyO1xufSkoKTsiXX0=
;