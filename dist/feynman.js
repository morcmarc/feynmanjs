!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Feynman=e():"undefined"!=typeof global?global.Feynman=e():"undefined"!=typeof self&&(self.Feynman=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function() {

  var Feynman = function(canvas) {

    if (typeof canvas === 'undefined') {
      throw new Error('');
    }

    this._version = '1.0.0';
    this._canvas  = new SVG(canvas);
  };

  Feynman.prototype.draw = function(data) {

    if (typeof data === 'undefined') {
      throw new Error('');
    }
  };

  return Feynman;
})();
},{}]},{},[1])
(1)
});
;