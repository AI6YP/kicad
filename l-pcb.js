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
    rotate_extrude(
        {fn: 72},
        translate(
            [25.5, 0, 0],
            polygon([
                [-3, -7], [-4, -6.6], [-4.5, -6], [-5, -5],
                [-5,  5], [-4.5,  6], [-4,  6.6], [-3,  7],
                [ 3,  7], [ 4,  6.6], [ 4.5,  6], [ 5,  5],
                [ 5, -5], [ 4.5, -6], [ 4, -6.6], [ 3, -7]
            ])
        )
    ).setColor([1, 1, 0, 0.5]);

const main = () => union(
    relay4(),
    pcb(),
    t200_6().translate([0, 0, -15])
);
