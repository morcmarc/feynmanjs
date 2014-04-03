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