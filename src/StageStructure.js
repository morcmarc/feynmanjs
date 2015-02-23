var Klass = require('./helpers/Klass');

module.exports = {

  getStructure: function() {

    return Klass.__clone({
      title     : '',
      width     : 200,
      height    : 150,
      thickness : 'thick', // or 'thin'
      particles : [
        // {
          // id            : 'p1',
          // type          : 'photon',
          // from          : 'i1',
          // to            : 'v1',
          // label         : '$\\tau$',
          // right         : 0
          // left          : 1.6,
          // tension       : 0.5,
          // tag           : 'tag1',
          // color         : '#F00',
          // bgColor       : '#0F0',
          // penWidth      : 5,
          // labelSide     : 'right',
          // labelDistance : 10,
          // labelX        : 10,
          // labelY        : 10
        // }
      ],
      vertices  : [
        // {
          // id      : 'v1',
          // visible : true,
          // label   : '$v_1$',
          // labelX  : 10,
          // labelY  : 10,
          // sub     : false
        // }
      ],
      cPoints   : {

        left   : [
          // {
            // id     : 'i1',
            // side   : 'left',
            // label  : '$c_1$',
            // labelX : 10,
            // labelY : 10,
          // }
        ],
        right  : [
          // {
          //   id: 'i1'
          //   ...
          // }
        ],
        top    : [
          // {
          //   id: 'i1'
          //   ...
          // }
        ],
        bottom : [
          // {
          //   id: 'i1'
          //   ...
          // }
        ]
      }
    });
  }
};