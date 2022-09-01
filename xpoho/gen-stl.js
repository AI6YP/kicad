#!/usr/bin/env node
'use strict';

const stlSerializer = require('@jscad/stl-serializer')

const model = require('./a.js');

const raw = stlSerializer.serialize({binary: true}, model.main());

const stl = Buffer.concat([Buffer.from(raw[0]), Buffer.from(raw[1]), Buffer.from(raw[2])]);

process.stdout.write(stl);
