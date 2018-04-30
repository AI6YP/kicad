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
            name: 'turns',
            type: 'float',
            initial: 4.33,
            caption: 'number of turns'
        },
        {
            name: 'backTurns',
            type: 'float',
            initial: 0.25,
            caption: 'number of turns to the ground'
        },
        {
            name: 'pitch',
            type: 'float',
            initial: 1.6,
            caption: 'helix pitch'
        },
        {
            name: 'stages',
            type: 'float',
            initial: 2,
            caption: 'number of stages'
        },
        {
            name: 'stageSpacing',
            type: 'float',
            initial: 1,
            caption: 'distance between stages [mm]'
        },
        {
            name: 'helixD',
            type: 'float',
            initial: 5,
            caption: 'helix diameter [mm]'
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
            initial: 13,
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
    const resolution = props.resolution || 4;
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
        resolution: 8,
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
    // const rmin = ringRadius - wireRadius;
    // const rmax = ringRadius + wireRadius;

    const leg = CSG.roundedCylinder({
        start: [0, 0, 0],
        end: [0, 0, -stickOut],
        radius: wireRadius
    });
    const res = torus({
        ri: wireRadius,
        ro: ringRadius,
        fno: 22
    })
        .union(leg.translate([0, -ringRadius, 0]))
        .union(leg.translate([0, +ringRadius, 0]));

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

function cageGenM (CSG, props) {
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
    const bars = [-2.4, -0.8, 0.8, 2.4, 8.6, 10.2, 11.8, 13.4]
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
    const offset = props.backTurns * 360 / angleStep;
    const loopStep = pitch * angleStep / 360;

    const cut = CSG.Polygon.createFromPoints(compass3d({
        // resolution: 32,
        radius: 1.2 * wireRadius
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

    const gnd = CSG.roundedCylinder({
        start: [3 - (angleStep * props.backTurns / Math.PI), -coilRadius, 0],
        end:   [-wireRadius, -ringRadius, 0],
        radius: wireRadius
    }).rotateX(props.backTurns * 360);

    const core = helix.union(tap);
    return core.translate([3, -coilRadius, 0]).union(gnd);
}

function helixGenM (CSG, props) {
    const angleStep = 5;
    const wireRadius = props.wireD / 2;
    const numslices = props.turns * 360 / angleStep;
    const coilRadius = props.helixD / 2;
    const ringRadius = props.ringD / 2;
    const pitch = props.pitch;
    const offset = props.backTurns * 360 / angleStep;
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

    const gnd = CSG.roundedCylinder({
        start: [3 - (angleStep * props.backTurns / Math.PI), -coilRadius, 0],
        end:   [-wireRadius, -ringRadius, 0],
        radius: wireRadius
    }).rotateX(props.backTurns * 360);

    return helix.translate([3, -coilRadius, 0]).union(gnd);
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
    const ringRadius = props.ringD / 2;

    const core0 = helixGen(CSG, props);
    const cage0 = cageGen(CSG, props);

    const link = CSG.cylinder({
        start: [0, 0, 0],
        end: [0, props.stageSpacing, 0],
        radius: wireRadius
    });

    const stage1 = core0
        .setColor(1, 0, 0)
        .union(cage0.setColor(0, 1, 1)).translate([0, -ringRadius, 0]);

    var res = stage1;

    let stageN = core0
        .setColor(0, 0, 1)
        .union(
            cage0.setColor(1, 1, 0)
        )
        .rotateX(180)
        .union(link.translate([
            -wireRadius,
            -ringRadius - props.stageSpacing,
            0
        ]).setColor(1, 1, 0))
        .union(link.translate([
            canH + wireRadius,
            -ringRadius - props.stageSpacing,
            0
        ]).setColor(1, 1, 0));

    if (props.stages === 2) {
        stageN = stageN.translate([0, ringRadius + props.stageSpacing, 0]);
    } else
    if (props.stages === 3) {
        stageN = stageN.translate([0, 3 * ringRadius + 2 * props.stageSpacing, 0]);
    }

    res = res.union(stageN);

    if (props.stages === 3) {
        const core1 = helixGenM(CSG, props);
        const cage1 = cageGenM(CSG, props);
        const stage2 = core1
            .setColor(0, 1, 0)
            .union(
                cage1.setColor(1, 0, 1)
            )
            .union(link.translate([
                -wireRadius,
                -ringRadius - props.stageSpacing,
                0
            ]).setColor(1, 0, 1))
            .union(link.translate([
                canH + wireRadius,
                -ringRadius - props.stageSpacing,
                0
            ]).setColor(1, 0, 1));
        res = res.union(stage2.translate([
            0,
            ringRadius + props.stageSpacing,
            0
        ]));
    }

    // .union(pcbGen(CSG, props))
    return res;
};
// END

const raw = stlSerializer(main({

    // // 915h2v5
    // turns: 6.25,
    // backTurns: 0.33,
    // pitch: 1.35,
    // stages: 2,
    // stageSpacing: 2,

    // // 915h3v5
    // turns: 6.25,
    // backTurns: 0.33,
    // pitch: 1.35,
    // stages: 3,
    // stageSpacing: 2.25,

    // // 1270h2v5
    // turns: 4.5,
    // backTurns: 0.25,
    // pitch: 1.7,
    // stages: 2,
    // stageSpacing: 2,

    // 1270h3v5
    turns: 4.5,
    backTurns: 0.25,
    pitch: 1.7,
    stages: 3,
    stageSpacing: 2.25,

    helixD: 5,
    ringD: 7,
    wireD: 0.9,
    canH: 13,
    canD: 11
}));

const stl = Buffer.concat([Buffer.from(raw[0]), Buffer.from(raw[1]), Buffer.from(raw[2])]);

process.stdout.write(stl);
