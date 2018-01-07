#!/usr/bin/env node
'use strict';

const scad = require('@jscad/scad-api');
const stlSerializer = require('@jscad/stl-serializer').serialize;

const CSG = scad.csg.CSG;
const CAG = scad.csg.CAG;

// BEGIN
const helixD = 5;
const turns = 5;
const pitch = 8 / 5;
const wireRadius = 0.5;
const angleStep = 5;
const offset = 0.25 * 360 / angleStep;

const coilRadius = helixD / 2;
const loopStep = pitch * angleStep / 360;
const numslices = turns * 360 / angleStep;
const wireRadius3 = wireRadius * Math.sqrt(3) / 2;

function compass3d (props) {
	props = props || {};
	const radius = props.radius || 1;
	const resolution = props.resolution || 8;
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

function cageGen (CSG, props) {
    props = props || {};
    const H = props.H || 5;
    const S = props.S || 5;
    const min = props.min || 0.8;

    const bars = [-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(el => el / Math.PI)
    .map(el => [S * Math.cos(el), S * Math.sin(el)])
    .reduce((res, el) => {
        return res.union(CSG.roundedCylinder({
            start: [0, el[0], el[1]],
            end: [H, el[0], el[1]],
            radius: min / 2
        }))
    }, {union: el => el});

    const floor = CSG.cylinder({
        start: [0, 0, 0],
        end: [0 - min, 0, 0],
        radius: S + min / 2
    }).subtract(CSG.cylinder({
        start: [3, -3, 0],
        end: [-3, -9, 0],
        radius: 1.5
    }));

    const ceiling = CSG.cylinder({
        start: [H, 0, 0],
        end: [H + min, 0, 0],
        radius: S
    }).subtract(CSG.cylinder({
        start: [0, 0, 0],
        end: [H + min + 1, 0, 0],
        radius: 1.25
    }));

    return bars.union(floor).union(ceiling);
}

function helixGen (CSG, props) {
    const cut = CSG.Polygon.createFromPoints(compass3d({
        resolution: 16,
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
	    start: [0,0,0],
	    end: [-3.5, -3.5, 0],
	    radius: wireRadius
	});

	const gnd = CSG.cylinder({
	    start: [-0, coilRadius, -coilRadius],
	    end: [-3.5, coilRadius, -coilRadius],
	    radiusStart: wireRadius,
	    radiusEnd: 3 * wireRadius
	})

	const core = helix.union(tap).union(gnd);
	return core.translate([3, -coilRadius, 0]);
}

const main = () => {
    const core0 = helixGen(CSG).setColor(1,0,0);
    const cage0 = cageGen(CSG, {H: 13, S: 5.5}).setColor(1,1,0);
    const core1 = helixGen(CSG).setColor(0, 0, 1);
    const cage1 = cageGen(CSG, {H: 13, S: 5.5}).setColor(0, 1, 1);
    const link = CSG.cube({
        corner1: [9, -.5, 3],
        corner2: [13.5, .5, -3]
    });
	return core0.union(cage0).translate([0, -5, 0])
	.union(core1.union(cage1).rotateX(180).translate([0, 5, 0]))
	.union(link);
};
// END

const raw = stlSerializer(main());
const stl = Buffer.concat([Buffer.from(raw[0]), Buffer.from(raw[1]), Buffer.from(raw[2])]);

process.stdout.write(stl);
