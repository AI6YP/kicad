#!/usr/bin/env node
'use strict';

const scad = require('@jscad/scad-api');
const stlSerializer = require('@jscad/stl-serializer').serialize;

const CSG = scad.csg.CSG;

const wireRadius = 1;
const coilRadius = 10;
const angleStep = 5;
const turns = 4;
const perTurn = 3;

const loopStep = perTurn * angleStep / 360;
const numslices = turns * 360 / angleStep;
const wireRadius3 = wireRadius * Math.sqrt(3) / 2;

const shape = [
	[wireRadius, 0, 0],
	[wireRadius / 2, wireRadius3, 0],
	[-wireRadius / 2, wireRadius3, 0],
	[-wireRadius, 0, 0],
	[-wireRadius / 2, -wireRadius3, 0],
	[wireRadius / 2, -wireRadius3, 0]
];

const main = () => {
    const hex = CSG.Polygon.createFromPoints(shape);
	return hex.solidFromSlices({
		numslices: numslices,
		callback: function(t, slice) {
			return this.rotate(
				[0, coilRadius, 0],
				[-1, 0, 0],
				angleStep * slice
			).translate([loopStep * slice, 0, 0]);
		}
	});
}

const raw = stlSerializer(main());
const stl = Buffer.concat([Buffer.from(raw[0]), Buffer.from(raw[1]), Buffer.from(raw[2])]);

process.stdout.write(stl);
