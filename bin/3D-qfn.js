'use strict';

const { makeBaseBox } = replicad;

const parts = [
  {n: 'SKY67150-396LF', w: 2.00, h: 2.00, z: 0.75},
  {n: 'FM8652H',        w: 1.10, h: 0.70, z: 0.45},
  {n: 'GGQ4033',        w: 4.00, h: 4.00, z: 0.85},
];

const main = (r, cfg) =>
  parts.map((p) => ({
    name: p.n,
    shape: makeBaseBox(p.w, p.h, p.z).translateZ(0.1),
    color: '#555',
    opacity: .9
  }));
