'use strict';


const { draw } = replicad;

// PCB SMD NUT

const main = () => {
  const A = 1.53;
  const C = 4.09;
  const E = 5.56 - 0.2; // for 3D print
  const L = 5;
  const T = 2.8;

  const profile = draw()
    .movePointerTo([T / 2, -A])
    .hLine((C - T) / 2)
    .vLine(A)
    .hLine((E - C) / 2)
    .vLine(L)
    .hLine((T - E) / 2)
    .close();

  const nut0 = profile
    .sketchOnPlane('XZ')
    .revolve()
    .translateY(15.5);

  const nut1 = profile
    .sketchOnPlane('XZ')
    .revolve()
    .translateY(-15.5);

  return nut0.fuse(nut1);
};
