'use strict';

const {
  drawRoundedRectangle,
  draw
} = replicad;

// PCB SMD NUT

const A = 10;
const B = 6;
const C = 12;
const D = 3;
const c = 3.6;

const main = () => {

  const box = drawRoundedRectangle(A, B)
    .sketchOnPlane()
    .extrude(C);

  const pimpa = draw()
    .movePointerTo([c / 2, 0])
    .hLine((B - c) / 2)
    .vLine(C + D)
    .hLine((c - B) / 2)
    .close()
    .sketchOnPlane('XZ')
    .revolve()
    .fillet(.2, (e) => e.inPlane('XY', C + D));

  // return pimpa;
  return [{name: 'foo', shape: box.fuse(pimpa), color: '#555', opacity: .9}];
};
/* globals replicad */
