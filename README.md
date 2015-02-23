#Feynman

Cross-browser Javascript library for drawing Feynman diagrams using SVG and HTML5, based on feynMF [1].

![alt tag](https://raw.github.com/morcmarc/feynmanjs/master/examples/ex1.png)

####Disclaimer

The library is by no means ready yet to be used in "production". Check out jQuery.feyn [2] for a reliable HTML5 solution.

##Usage

###Dependencies

- [SVG.js](http://www.svgjs.com/) - *for now, see roadmap*

###Latex (feynMF) flavour example

**HTML:**

```html
<div id="annihilation"></div>
```

**JavaScript:**

```javascript
var feynman = new Feynman();

var annihilation = {
  title      : 'Electron-Positron Annihilation',
  width      : 400,
  height     : 400,
  showAxes   : true,
  lang       : 'latex',
  diagram    : [
    'fmfleft{i1,o1}',
    'fmfright{i2,o2}',
    'fmf{electron}{i1,v1,o1}',
    'fmf{quark}{i2,v2,o2}',
    'fmf{photon}{v1,v2}',
    'fmfdot{v1,v2}'
  ]
};

feynman.draw("annihilation", annihilation);
```

You can find more examples in the examples folder.

##Features

###Auto-layout

The library is based on feynMF [1] and it implements most of its features including the auto-layout system. Given a simple instruction set and description of participants in a system the engine will attempt to lay out the diagram as nicely as possible without any manual intervention. Currently there is no option to position elements by hand but it is top priority.

###Parsers

The library allows easy implementation of different parser engines through a unified stage class. At the moment only the feynMF language is supported.

###Labels

**Experimental**. The current label positioning function is dodgy, there is too many variables to calculate with and MathJax is
unreliable. However it places labels good enough so that they can be fine tuned by hand using the `labelx` and `labely` attributes (see examples).

##Roadmap

- Add more line types e.g.: dashed, dotted
- Add more vertex types, i.e.: blobs
- Implement API to allow after-draw handling of elements (i.e.: fine tuning position of vertices, propagators etc.)
- Remove svg.js dependency
- Add support for non MathJax labels (i.e.: unicode labels)
- Add option to turn off auto-layout and allow users to position elements through configuration
- Animations: for educational purposes, to help easier understanding of particle behaviour

##Development

###Contributing

To submit a fix or an enhancement fork the repository, checkout the 'development' branch, add your name to the Contributors section in README.md, and send a pull request!

###Building

Install dependencies first:

`npm install`

Then run build task:

`grunt`

Generated files can be found in the `dist` folder.

###Running unit tests

To run test suite from command line type:

`grunt test`

Alternatively you can run it in the browser at `/spec`. There is also a grunt task with live reload:

`grunt watch:test`

##References

\[1\] [http://photino.github.io/jquery-feyn/index.html](http://photino.github.io/jquery-feyn/index.html)

\[2\] [http://www.pd.infn.it/TeX/doc/latex/feynmf/manual.pdf](http://www.pd.infn.it/TeX/doc/latex/feynmf/manual.pdf)

---

This software is licensed under the MIT License.

##Contributors

- [Marcell Jusztin](mailto:hello@morcmarc.com)