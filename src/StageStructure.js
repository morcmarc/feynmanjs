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
          // id      : 'p1',
          // type    : 'photon',
          // from    : 'i1',
          // to      : 'v1',
          // label   : '$\tau$',
          // right   : true
          // left    : true,
          // tension : '1/3'
        // }
      ],
      vertices  : [
        // {
        //   id: 'v1',
        //   visible: true
        // }
      ],
      cPoints   : {

        left   : [
          // {
          //   id: 'i1'
          // }
        ],
        right  : [
          // {
          //   id: 'i1'
          // }
        ],
        top    : [
          // {
          //   id: 'i1'
          // }
        ],
        bottom : [
          // {
          //   id: 'i1'
          // }
        ]
      }
    });
  }
};