#!/usr/bin/env node
'use strict';

const scad = require('@jscad/scad-api');
const stlSerializer = require('@jscad/stl-serializer').serialize;

const CSG = scad.csg.CSG;
const CAG = scad.csg.CAG;

// BEGIN
// f0 = 915 MHz
// df = 30 MHz
const helixD = 6;
const turns = 4.9;
const pitch = 1.8;
const wireRadius = 0.45;

const angleStep = 5;
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

const main = () => {
    const cut = CSG.Polygon.createFromPoints(compass3d({
        resolution: 16,
        radius: wireRadius
    }));
	return cut.solidFromSlices({
		numslices: numslices,
		callback: function(t, slice) {
			return this.rotate(
				[0, coilRadius, 0],
				[-1, 0, 0],
				angleStep * slice
			).translate([loopStep * slice, 0, 0]);
		}
	});
};
// END

const raw = stlSerializer(main());
const stl = Buffer.concat([Buffer.from(raw[0]), Buffer.from(raw[1]), Buffer.from(raw[2])]);

process.stdout.write(stl);
