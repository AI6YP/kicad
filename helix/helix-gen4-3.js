#!/usr/bin/env node
'use strict';

const scad = require('@jscad/scad-api');
const stlSerializer = require('@jscad/stl-serializer').serialize;

const CSG = scad.csg.CSG;
const CAG = scad.csg.CAG;
const torus = scad.primitives3d.torus;

// BEGIN
function getParameterDefinitions () {
    return [
        {
            name: 'helixD',
            type: 'float',
            initial: 5,
            caption: 'helix diameter [mm]'
        },
        {
            name: 'turns',
            type: 'float',
            initial: 4.33,
            caption: 'number of turns'
        },
        {
            name: 'pitch',
            type: 'float',
            initial: 1.6,
            caption: 'helix pitch'
        },
        {
            name: 'ringD',
            type: 'float',
            initial: 7,
            caption: 'end ring diameter [mm]'
        },
        {
            name: 'wireD',
            type: 'float',
            initial: 0.9,
            caption: 'wire diameter [mm]'
        },
        {
            name: 'canH',
            type: 'float',
            initial: 14,
            caption: 'can height [mm]'
        },
        {
            name: 'canD',
            type: 'float',
            initial: 11,
            caption: 'can diameter [mm]'
        }
    ];
}

function compass3d (props) {
    props = props || {};
    const radius = props.radius || 1;
    const resolution = props.resolution || 16;
    const adelta = 2 * Math.PI / resolution;
    let res = [];
    for(let i = 0; i < resolution; i++) {
        const theta = adelta * i;
        res.push([
            radius * Math.cos(theta),
            radius * Math.sin(theta),
            0
        ]);
    }
    return res;
}

function arcGen (CSG, props) {
    const wireRadius = props.wireD / 2;
    const length = props.length || 1;
    const endRadius = props.endRadius || 1;
    const cut = CSG.Polygon.createFromPoints(compass3d({
        // resolution: 32,
        radius: wireRadius
    }));

    const path = [2, 3, 4, 5, 6, 7, 8]
        .map(i => i * Math.PI / 16)
        .map(angle => ({
            angle: 180 * angle / Math.PI,
            x: endRadius * -Math.cos(angle),
            y: endRadius * Math.sin(angle)
        }))
        .concat([{angle: 90, x: length / 2, y: endRadius}])
        .concat([8, 9, 10, 11, 12, 13, 14]
            .map(i => i * Math.PI / 16)
            .map(angle => ({
                angle: 180 * angle / Math.PI,
                x: endRadius * -Math.cos(angle) + length,
                y: endRadius * Math.sin(angle)
            })));

    return cut.solidFromSlices({
        numslices: path.length,
        callback: function(t, slice) {
            const e = path[slice];
            return this
                .rotateY(e.angle)
                .translate([e.x, 0, e.y]);
        }
    });
}

const ringGenGen = (CSG, props) => {
    const wireRadius = props.wireD / 2;
    const ringRadius = props.ringD / 2;
    const stickOut = 1.5;
    const rmin = ringRadius - wireRadius;
    const rmax = ringRadius + wireRadius;
    const res = torus({
        ri: wireRadius,
        ro: 3.5,
        fno: 22
    })
        .union(CSG.cube({corner1: [-wireRadius,  rmin, 0], corner2: [wireRadius,  rmax, -(stickOut + wireRadius)]}))
        .union(CSG.cube({corner1: [-wireRadius, -rmin, 0], corner2: [wireRadius, -rmax, -(stickOut + wireRadius)]}));

    return (rot, move) => res.rotateY(rot).translate([move, 0, 0]);
};

function cageGen (CSG, props) {
    const wireRadius = props.wireD / 2;
    const H = props.canH;
    const S = props.canD / 2;
    const helixRadius = props.helixD / 2;
    const ringGen = ringGenGen(CSG, props);

    const bar = arcGen(CSG, Object.assign({
        endRadius: S - helixRadius,
        length: H - 1.87 * helixRadius
    }, props)).translate([0, 0, helixRadius]);
    // const bars = [-4, -2, 0, 2, 4, 7, 9, 11, 13, 15]
    const bars = [-2.4, -0.8, 0.8, 2.4, 4, 7, 8.6, 10.2, 11.8, 13.4]
    // const bars = [4]
        .map(el => el * 360 / 22)
        .reduce((res, angle) => res.union(bar.translate([S - helixRadius - 0.65, 0, 0]).rotateX(angle)
        ), {union: el => el});

    return bars
        .union(ringGen(90, -wireRadius))
        .union(ringGen(-90, H + wireRadius));
}

function helixGen (CSG, props) {
    const angleStep = 5;
    const wireRadius = props.wireD / 2;
    const numslices = props.turns * 360 / angleStep;
    const coilRadius = props.helixD / 2;
    const ringRadius = props.ringD / 2;
    const pitch = props.pitch;
    const offset = 0.25 * 360 / angleStep;
    const loopStep = pitch * angleStep / 360;

    const cut = CSG.Polygon.createFromPoints(compass3d({
        // resolution: 32,
        radius: wireRadius
    }));

    const helix = cut.solidFromSlices({
        numslices: numslices,
        callback: function(t, slice) {
            return this.rotate(
                [0, coilRadius, 0],
                [-1, 0, 0],
                angleStep * (slice - offset)
            ).translate([loopStep * (slice - offset), 0, 0]);
        }
    });

    const tap = CSG.roundedCylinder({
        start: [0, 0, 0],
        end: [0, -4, 0],
        radius: wireRadius
    });

    const gnd = CSG.cylinder({
        start: [-0, coilRadius, -coilRadius],
        end: [-3.5, coilRadius, -ringRadius],
        radiusStart: wireRadius,
        radiusEnd: wireRadius
    });

    const core = helix.union(tap).union(gnd);
    return core.translate([3, -coilRadius, 0]);
}

function pcbGen (CSG, props) {
    const canH = props.canH;
    const canD = props.canD;
    const wireD = props.wireD;
    return (
        CSG.cube({
            corner1: [-5, -canD-4, -0.5],
            corner2: [canH + 5,  canD+4, -1.5]
        // }).subtract(CSG.cube({
        //     corner1: [-wireD - 0.1,        -canD+0.3,  2],
        //     corner2: [ wireD + 0.1 + canH,  canD-0.3, -2]
        // }))
        }).subtract(CSG.cube({
            corner1: [-1, -10.5,  2],
            corner2: [15,  10.5, -2]
        }))
    );
}

const main = (props) => {
    const wireRadius = props.wireD / 2;
    const canH = props.canH;

    const core0 = helixGen(CSG, props).setColor(1, 0, 0);
    const cage0 = cageGen(CSG, props).setColor(1, 1, 0);

    const link = CSG.cylinder({
        start: [0, 1, 0],
        end: [0, -1, 0],
        radiusStart: wireRadius,
        radiusEnd: wireRadius,
        resolution: 16
    });

    return core0.setColor(1, 0, 0).union(cage0.setColor(1, 1, 0)).translate([0, -4.5, 0])
        .union(
            core0.setColor(0, 0, 1).union(cage0.setColor(0, 1, 1)).rotateX(180).translate([0, 4.5, 0])
        )
        .union(link.translate([-wireRadius, 0, 0]))
        .union(link.translate([canH + wireRadius, 0, 0]))
        // .union(pcbGen(CSG, props))
        ;
};


// END

const raw = stlSerializer(main({
    helixD: 5,
    // turns: 6, // 915 MHz
    turns: 4.33, // 1270 MHz
    // pitch: 1.3, // 915 MHz
    pitch: 1.6, // 1270 MHz
    ringD: 7,
    wireD: 0.9,
    canH: 13,
    canD: 11
}));

const stl = Buffer.concat([Buffer.from(raw[0]), Buffer.from(raw[1]), Buffer.from(raw[2])]);

process.stdout.write(stl);
