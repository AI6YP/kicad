'use strict';

// BEGIN

function getParameterDefinitions () {
    return [
        {name: 'scale',  type: 'float', initial: 35},
        {name: 'height', type: 'float', initial: 3},
        {name: 'wall', type: 'float', initial: 0.3}
    ];
}

const kc = Math.cos(2 * Math.PI / 5);

const mc = Math.cos(Math.PI / 5);

const lmc = Math.tan(Math.PI / 5);

const pental = (() => {
    const x = kc;
    const y = x * lmc;
    return Math.sqrt(x*x + y*y);
})();

const pentagram = s => {
    const delta = Math.PI / 5;
    return [0, 1, 2, 3, 4].reduce((res, cur) => {
        const alfa = 2 * Math.PI * cur / 5;
        return res.concat([[
            s * Math.sin(alfa),
            s * Math.cos(alfa)
        ], [
            pental * s * Math.sin(alfa + delta),
            pental * s * Math.cos(alfa + delta)
        ]]);
    }, []);
};

const pentagon = s => [0, 1, 2, 3, 4]
    .map(i => 2 * Math.PI * (i + 0.5) / 5)
    .map(alfa => [
        s * Math.sin(alfa),
        s * Math.cos(alfa)
    ]);

const extruder = fn => (s, h) => polygon(fn(s)).extrude({offset: [0, 0, h]});

const pentagram3 = extruder(pentagram);

const pentagon3 = extruder(pentagon);

const stamp = (s, h, wall) => {
    const m = mc * s;
    const k = kc * s;
    const mk2 = (m + k) / 2;
    const b = mk2 - k;

    const topBar = cube({size: [5 * s, mk2, h]})
        .setColor([0, 1, 0]);

    const botBar = cube({size: [-5 * s, -mk2, h]})
        .setColor([0, 0, 1]);

    const bars = topBar.union(botBar)
        .translate([0, b, h / 2]);

    const mbar = cube({size: [11 * s, wall, 5 * h], center: true})
        .translate([0, b, 0]);

    return pentagon3(s, 2 * h)
        .setColor([0, 0, 0])
        .union(bars)
        .subtract(mbar);
};


function main (props) {
    const a = pentagram3(props.scale, props.height);

    const b = pentagram3(props.scale * (1 - props.wall), props.height + 1);

    const c = pentagon3(props.scale / 2, props.height + 1)
        .translate([0, 0, props.height / 2]);

    const d = pentagon3(props.scale * pental, 1.2 * props.height);

    const e = stamp(
        props.scale * pental * (1 - props.wall),
        props.height,
        props.scale * props.wall * 0.3
    );

    return (
        a
            .subtract(b)
            .setColor([1, 0, 0])
            .subtract(c.setColor([0, 0, 0]))
            .union(
                d.subtract(e).setColor([1, 0, 0])
            )
    );
}

// END

/* global polygon */
