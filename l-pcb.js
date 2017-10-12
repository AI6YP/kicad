'use strict';

const relay = () =>
    cube([10, 6, 3.90])
        .setColor([1, 1, 1])
        .translate([0, 0, 0.75]);

const pcb = () =>
    cube([40, 40, -1.6])
        .setColor([0, .3, 0])
        .translate([-20, -20]);

const relay4 = () =>
    union(
        relay().translate([1, 4, 0]),
        relay().translate([-11, 4, 0]),
        relay().translate([1, -10, 0]),
        relay().translate([-11, -10, 0])
    );

const t200_6 = () =>
    difference(
        cylinder({r: 25.5, h: 14}),
        cylinder({r: 15.5, h: 15})
    ).setColor([1, 1, 0]);

const main = () => union(
    relay4(),
    pcb(),
    t200_6().translate([0, 0, -25])
);
