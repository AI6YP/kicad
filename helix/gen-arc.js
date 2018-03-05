#!/usr/bin/env node
'use strict';

const scad = require('@jscad/scad-api');
const stlSerializer = require('@jscad/stl-serializer').serialize;

const CSG = scad.csg.CSG;
// const CAG = scad.csg.CAG;

// BEGIN

function compass3d (props) {
    props = props || {};
    const radius = props.radius || 1;
    const resolution = props.resolution || 16;
    const adelta = 2 * Math.PI / resolution;
    let res = [];
    for (let i = 0; i < resolution; i++) {
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
    props = props || {};
    const wireRadius = props.wireRadius || 1;
    const length = props.length || 1;
    const endRadius = props.endRadius || 1;
    const cut = CSG.Polygon.createFromPoints(compass3d({
        // resolution: 32,
        radius: wireRadius
    }));

    const path = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        .map(i => i * Math.PI / 16)
        .map(angle => ({
            angle: 180 * angle / Math.PI,
            x: endRadius * -Math.cos(angle),
            y: endRadius * Math.sin(angle)
        }))
        .concat([{
            angle: 90,
            x: length,
            y: endRadius
        }])
        .concat([8, 9, 10, 11, 12, 13, 14, 15, 16]
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
                .translate([
                    e.x,
                    0,
                    e.y
                ]);
        }
    });
}

function getParameterDefinitions () {
    return [
        {name: 'wireRadius', caption: 'wire radius [mm]', type: 'float', initial: 1},
        {name: 'length', caption: 'length [mm]', type: 'float', initial: 5},
        {name: 'endRadius', caption: 'end radius [mm]', type: 'float', initial: 3}
    ];
}

const main = (props) => {
    return arcGen(CSG, props);
};

// END

const raw = stlSerializer(main({
    wireD: 1,
    length: 5
}));

const stl = Buffer.concat([Buffer.from(raw[0]), Buffer.from(raw[1]), Buffer.from(raw[2])]);

process.stdout.write(stl);
