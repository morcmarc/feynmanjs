var Stage = require('./../../src/Stage');
var ParserFactory = require('./../../src/parsers/ParserFactory');
var SVG = function() {
  return {
    size      : function(){ return this; },
    group     : function(){ return this; },
    text      : function(){ return this; },
    font      : function(){ return this; },
    translate : function(){ return this; },
    circle    : function(){ return this; },
    fill      : function(){ return this; },
    polygon   : function(){ return this; },
    path      : function(){ return this; },
    stroke    : function(){ return this; },
    transform : function(){ return this; },
    scale     : function(){ return this; }
  };
};

describe('Stage', function() {

  var stage;
  var testData = {
    title: 'Scattering Diagram',
    width: 200,
    height: 150,
    diagram: [
      'fmfleft{i1,i2}',
      'fmfright{o1,o2}',
      'fmf{fermion,tension=1/3,right,label=$\\tau$,label.side=left,label.dist=10,tag=tag1,width=5,foreground=#00F,background=#000}{i1,v1,i2}',
      'fmf{fermion}{i1,v1,i2}',
      'fmf{fermion}{o2,v2,o1}',
      'fmf{photon}{v1,v2}',
      'fmfpen{thin}',
      'fmfdot{v1}'
    ]
  };
  var annihilationRev = {
    title      : 'E-P Annihilation',
    width      : 200,
    height     : 300,
    showAxes   : true,
    lang       : 'latex',
    diagram: [
      'fmftop{i1,i2}',
      'fmfbottom{o1,o2}',
      'fmf{photon}{i1,v1}',
      'fmf{photon}{i1,v1}',
      'fmf{photon}{o1,v2}',
      'fmf{photon}{o1,v2}',
      'fmf{fermion}{i2,v1,v2,o2}',
      'fmf{fermion}{i2,v1,v2,o2}',
      'fmfdot{v1,v2}'
    ]
  };

  beforeEach(function() {

    var parser     = ParserFactory.getParser(testData);
    var stageData  = parser.parse();
    stage = new Stage('testCanvas', new SVG('testCanvas'), stageData);
  });

  it('cannot be instantiated without a canvas', function() {

    expect(function() {
      var invalid = new Stage('');
    }).toThrow(new Error('Missing canvas argument.'));
  });

  it('cannot be instantiated without data', function() {

    expect(function() {
      var invalid = new Stage('', {});
    }).toThrow(new Error('Missing data argument.'));
  });

  describe('getVertexById()', function() {

    it('returns vertex object if that exists', function() {

      expect(stage.getVertexById('v1')).toBeDefined();
      expect(stage.getVertexById('v1').id).toEqual('v1');
    });

    it('returns undefined if vertex does not exist', function() {

      expect(stage.getVertexById('v10')).toBeUndefined();
    });
  });

  describe('getVerticesByDistance()', function () {
    
    it('returns an array of vertices for a given distance', function() {

      expect(stage.getVerticesByDistance(1).length).toEqual(1);
      expect(stage.getVerticesByDistance(1)[0].id).toEqual('v1');
      expect(stage.getVerticesByDistance(2).length).toEqual(1);
      expect(stage.getVerticesByDistance(2)[0].id).toEqual('v2');
    });
  });

  describe('getNumberOfLevels()', function () {
    
    it('returns the number of levels', function (done) {
      
      expect(stage.getNumberOfLevels()).toEqual(2);
    });
  });

  describe('getControlPointById()', function() {

    it('returns control point object if that exists', function() {

      expect(stage.getControlPointById('i1')).toBeDefined();
      expect(stage.getControlPointById('i1').id).toEqual('i1');
    });

    it('returns undefined if control point does not exist', function() {

      expect(stage.getControlPointById('i10')).toBeUndefined();
    });
  });

  describe('getParticlesStartingFromPoint()', function() {

    it('returns all particles starting from a Point', function() {

      var results = stage.getParticlesStartingFromPoint('i1');
      expect(results.length).toEqual(2);
      expect(results[0].id).toEqual('p1');
      expect(results[1].id).toEqual('p3');
    });

    it('returns empty array if there are no particles starting from that particular point', function() {

      var results = stage.getParticlesStartingFromPoint('hello');
      expect(results.length).toEqual(0);
    });
  });

  describe('getParticlesEndingInPoint()', function() {

    it('returns all particles ending in Point', function() {

      var results = stage.getParticlesEndingInPoint('i2');
      expect(results.length).toEqual(2);
      expect(results[0].id).toEqual('p2');
    });

    it('returns empty array if there are no particles in that particular point', function() {

      var results = stage.getParticlesEndingInPoint('hello');
      expect(results.length).toEqual(0);
    });
  });

  describe('draw()', function() {

    it('positions control points for Left-Right aligned diagrams', function() {

      stage.draw();
      
      expect(stage.getControlPointById('i1').x).toEqual(30);
      expect(stage.getControlPointById('i2').x).toEqual(30);
      expect(stage.getControlPointById('i1').y).toEqual(30);
      expect(stage.getControlPointById('i2').y).toEqual(120);

      expect(stage.getControlPointById('o1').x).toEqual(170);
      expect(stage.getControlPointById('o2').x).toEqual(170);
      expect(stage.getControlPointById('o1').y).toEqual(30);
      expect(stage.getControlPointById('o2').y).toEqual(120);
    });

    it('positions control points for Top-bottom aligned diagrams', function() {

      var parser     = ParserFactory.getParser(annihilationRev);
      var stageData  = parser.parse();
      stage = new Stage('testCanvas', new SVG('testCanvas'), stageData);
      stage.draw();
      
      expect(stage.getControlPointById('i1').x).toEqual(40);
      expect(stage.getControlPointById('i2').x).toEqual(160);
      expect(stage.getControlPointById('i1').y).toEqual(40);
      expect(stage.getControlPointById('i2').y).toEqual(40);

      expect(stage.getControlPointById('o1').x).toEqual(40);
      expect(stage.getControlPointById('o2').x).toEqual(160);
      expect(stage.getControlPointById('o1').y).toEqual(260);
      expect(stage.getControlPointById('o2').y).toEqual(260);
    });

    it('sets vertex distances for simple diagrams (no loops or cycles)', function (done) {
      
      stage.draw();

      expect(stage.getVertexById('v1').distance).toEqual(1);
      expect(stage.getVertexById('v2').distance).toEqual(2);
    });

    it('sets vertex distances for cycle diagrams', function (done) {
      
      var parser     = ParserFactory.getParser(annihilationRev);
      var stageData  = parser.parse();
      stage = new Stage('testCanvas', new SVG('testCanvas'), stageData);
      stage.draw();

      expect(stage.getVertexById('v1').distance).toEqual(1);
      expect(stage.getVertexById('v2').distance).toEqual(2);
    });

    it('sets vertex positions correctly for Left-Right diagrams', function (done) {
      
      expect(Math.ceil(stage.getVertexById('v1').x)).toEqual(77);
      expect(Math.ceil(stage.getVertexById('v1').y)).toEqual(75);
      expect(Math.ceil(stage.getVertexById('v2').x)).toEqual(124);
      expect(Math.ceil(stage.getVertexById('v2').y)).toEqual(75);
    });

    it('sets vertex positions correctly for Top-Bottom diagrams', function (done) {
      
      var parser     = ParserFactory.getParser(annihilationRev);
      var stageData  = parser.parse();
      stage = new Stage('testCanvas', new SVG('testCanvas'), stageData);
      stage.draw();

      expect(Math.ceil(stage.getVertexById('v1').x)).toEqual(100);
      expect(Math.ceil(stage.getVertexById('v1').y)).toEqual(115);
      expect(Math.ceil(stage.getVertexById('v2').x)).toEqual(100);
      expect(Math.ceil(stage.getVertexById('v2').y)).toEqual(185);
    });
  });
});