module.exports = (function () {
  
  function Stage(canvas, stageData) {

    if(typeof canvas === 'undefined') {
      throw new Error('Missing canvas argument.');
    }

    if(typeof stageData === 'undefined') {
      throw new Error('Missing data argument.');
    }

    this.canvas = canvas;
    this.data   = stageData;
  }

  return Stage;
})();