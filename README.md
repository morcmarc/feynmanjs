#Feynman
========

**A simple cross-browser Javascript library for generating (animated) Feynman diagrams using SVG.**

##Usage

###Dependencies

- [SVG.js](http://www.svgjs.com/) - Included with source code

###Latex Example

**HTML:**

```html
<div id="feynman" style = "width: 400px; height: 400px; background-color: #EEE; "></div>
```

**JavaScript:**

```javascript
<script>
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

  feynman.draw("feynman", annihilation);
</script>
```

##Features

Coming soon...

##Roadmap

Coming soon...

##Contributing

The library relies on contributions of the open-source community! To submit a fix or an enhancement fork the repository, checkout the 'development' branch, make your changes, add your name to the Contributors section in README.md, and send a pull request!

###Dependencies

- [Jasmine 2.0](https://github.com/pivotal/jasmine) - Included with source code

###Building

Install dependencies first:

`npm install`

Then run build task:

`grunt`

Generated files can be found in the `dist` folder.

###Running unit tests

To run test suite from command line type:

`grunt test`

Alternatively you can run it in the browser at '/spec/'. There is also a grunt task with live reload:

`grunt watch:test`

##References

\[1\] [http://www.pd.infn.it/TeX/doc/latex/feynmf/manual.pdf](http://www.pd.infn.it/TeX/doc/latex/feynmf/manual.pdf)

---

[Marcell Jusztin](mailto:hello@morcmarc.com)

Copyright (c) 2014 Marcell Jusztin. This software is licensed under the MIT License.