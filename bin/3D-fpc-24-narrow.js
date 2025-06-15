'use strict';

const { makeBaseBox } = replicad;

const main = () => {
  const n = 24;
  const DIMA = (n - 1) * 0.5;
  const DIMD = DIMA + 2 * 1.9;
  const box1 = makeBaseBox(DIMD, 3.8, 1.2).translateY(-3.8 / 2 + 0.5);
  const box2 = makeBaseBox(DIMA + 1.4, 2, .7).translate([0, -2.4, 0.2]);

  const shape = box1.cut(box2);
  return [{name: `fpc-${n}-pin-narrow`, shape, color: '#555', opacity: .9}];
};
