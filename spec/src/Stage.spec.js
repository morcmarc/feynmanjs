var Stage = require('./../../src/Stage');

describe('Stage', function() {

  var stage;

  beforeEach(function() {

    stage = new Stage({}, {});
  });

  it('cannot be instantiated without a canvas', function() {

    expect(function() {
      var invalid = new Stage();
    }).toThrow(new Error('Missing canvas argument.'));
  });

  it('cannot be instantiated without data', function() {

    expect(function() {
      var invalid = new Stage({});
    }).toThrow(new Error('Missing data argument.'));
  });
});