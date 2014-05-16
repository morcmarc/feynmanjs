var Klass       = require('./../../../src/helpers/Klass');
var LatexParser = require('./../../../src/parsers/LatexParser');

describe('LatexParser', function() {

  var p;
  var testData = {
    title: 'Scattering Diagram',
    width: 400,
    height: 100,
    diagram: [
      'fmfleft{i1,i2}',
      'fmfright{o1,o2}',
      'fmf{fermion,tension=1/3,right=0.5,label=$\\tau$,label.side=left,label.dist=10,tag=tag1,width=5,foreground=#00F,background=#000}{i1,v1,i2}',
      'fmf{fermion}{o2,v2,o1}',
      'fmf{photon}{v1,v2}',
      'fmfpen{thin}',
      'fmfdot{v1}'
    ]
  };

  beforeEach(function() {

    p = new LatexParser(testData);
  });

  it('cannot be instantiated without data', function() {

    expect(function() {
      var invalid = new LatexParser();
    }).toThrow(new Error('No data given.'));
  });

  describe('parse()', function() {

    it('returns a StageStructure object', function() {

      expect(p.parse().hasOwnProperty('title')).toBe(true);
      expect(p.parse().hasOwnProperty('width')).toBe(true);
    });

    it('sets title', function() {

      expect(p.parse().title).toEqual(testData.title);
    });

    it('sets width', function() {

      expect(p.parse().width).toEqual(testData.width);
    });

    it('sets height', function() {

      expect(p.parse().height).toEqual(testData.height);
    });

    it('parses "fmfleft"', function() {

      var s = p.parse();
      expect(s.cPoints.left.length).toEqual(2);
      expect(s.cPoints.left[0].id).toEqual('i1');
      expect(s.cPoints.left[1].id).toEqual('i2');
    });

    it('parses "fmfright"', function() {

      var s = p.parse();
      expect(s.cPoints.right.length).toEqual(2);
      expect(s.cPoints.right[0].id).toEqual('o1');
      expect(s.cPoints.right[1].id).toEqual('o2');
    });

    it('does not add the same control point to the list more than once', function() {

      var t = Klass.__clone(testData);
      t.diagram[0] = 'fmfleft{i1,i1,i2,i2}';
      var x = new LatexParser(t);
      var s = x.parse();
      expect(s.cPoints.left.length).toEqual(2);
      expect(s.cPoints.left[0].id).toEqual('i1');
      expect(s.cPoints.left[1].id).toEqual('i2');
    });

    it('parses "fmfleftn"', function() {

      var t = Klass.__clone(testData);
      t.diagram[0] = 'fmfleftn{2}';
      var x = new LatexParser(t);
      var s = x.parse();
      expect(s.cPoints.left.length).toEqual(2);
      expect(s.cPoints.left[0].id).toEqual('i1');
      expect(s.cPoints.left[1].id).toEqual('i2');
    });

    it('parses "fmfrightn"', function() {

      var t = Klass.__clone(testData);
      t.diagram[1] = 'fmfrightn{2}';
      var x = new LatexParser(t);
      var s = x.parse();
      expect(s.cPoints.right.length).toEqual(2);
      expect(s.cPoints.right[0].id).toEqual('o1');
      expect(s.cPoints.right[1].id).toEqual('o2');
    });

    it('parses "fmftopn"', function() {

      var t = Klass.__clone(testData);
      t.diagram[0] = 'fmftopn{2}';
      var x = new LatexParser(t);
      var s = x.parse();
      expect(s.cPoints.top.length).toEqual(2);
      expect(s.cPoints.top[0].id).toEqual('i1');
      expect(s.cPoints.top[1].id).toEqual('i2');
    });

    it('parses "fmfbottomn"', function() {

      var t = Klass.__clone(testData);
      t.diagram[1] = 'fmfbottomn{2}';
      var x = new LatexParser(t);
      var s = x.parse();
      expect(s.cPoints.bottom.length).toEqual(2);
      expect(s.cPoints.bottom[0].id).toEqual('o1');
      expect(s.cPoints.bottom[1].id).toEqual('o2');
    });

    it('parses "fmfpen"', function() {

      var s = p.parse();
      expect(s.thickness).toEqual('thin');
    });

    it('parses particles', function() {

      var s = p.parse();
      expect(s.particles.length).toEqual(5);
    });

    it('sets label for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].label).toEqual('$\\tau$');
    });

    it('sets label position for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].labelSide).toEqual('left');
    });

    it('sets label distance for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].labelDistance).toEqual('10');
    });

    it('sets tension for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].tension).toEqual(parseFloat('1/3'));
    });

    it('sets pen width for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].penWidth).toEqual('5');
    });

    it('sets tag for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].tag).toEqual('tag1');
    });

    it('sets foreground color for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].color).toEqual('#00F');
    });

    it('sets background color for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].bgColor).toEqual('#000');
    });

    it('sets left or right value for propagator', function() {

      var s = p.parse();
      expect(s.particles[0].right).toEqual(0.5);
    });

    it('sets particle type correctly', function() {

      var s = p.parse();
      expect(s.particles[0].type).toEqual('fermion');
      expect(s.particles[4].type).toEqual('photon');
    });

    it('sets particle "end points"', function() {

      var s = p.parse();

      expect(s.particles[0].from).toEqual('i1');
      expect(s.particles[0].to).toEqual('v1');

      expect(s.particles[3].from).toEqual('v2');
      expect(s.particles[3].to).toEqual('o1');

      expect(s.particles[4].from).toEqual('v1');
      expect(s.particles[4].to).toEqual('v2');
    });

    it('gives and ID for each particle', function() {

      var s = p.parse();
      expect(s.particles[0].id).toEqual('p1');
      expect(s.particles[2].id).toEqual('p3');
      expect(s.particles[3].id).toEqual('p4');
    });

    it('creates vertices', function() {

      var s = p.parse();
      expect(s.vertices[0].id).toEqual('v1');
      expect(s.vertices[1].id).toEqual('v2');
    });

    it('parses "fmfdot"', function() {

      var s = p.parse();
      expect(s.vertices[0].visible).toBe(true);
      expect(s.vertices[1].visible).toBe(undefined);
    });
  });
});