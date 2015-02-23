module.exports = function(canvas, opts, angle) {

  var label = canvas.foreignObject().attr({ id: opts.id });
  label.appendChild('span', { id: 'label-' + opts.id, innerText: opts.label });
  var e = document.getElementById('label-' + opts.id);
  if(!e) {
    return;
  }

  e.style.textAlign = 'center';

  var nx = opts.to.x - opts.from.x;
  var ny = opts.to.y - opts.from.y;
  var dt = Math.sqrt( nx * nx + ny * ny );

  nx /= dt * (1 / opts.labelDistance);
  ny /= dt * (1 / opts.labelDistance);

  var n1x = -ny + ((opts.to.x + opts.from.x) / 2);
  var n1y =  nx + ((opts.to.y + opts.from.y) / 2);
  var n2x =  ny + ((opts.to.x + opts.from.x) / 2);
  var n2y = -nx + ((opts.to.y + opts.from.y) / 2);

  var dx  = opts.labelX !== NaN ? opts.labelX : 0;
  var dy  = opts.labelY !== NaN ? opts.labelY : 0;

  if(opts.labelSide === 'left') {
    label.move(n1x + dx, n1y + dy);
  } else {
    label.move(n2x + dx, n2y + dy);
  }

  return label;
};