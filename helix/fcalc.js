#!/usr/bin/env node
'use strict';

const v0 = 299792458; // speed of light

const helixD = 5;
const pitch = 1.6;
const turns = 4.33;
const turnsAll = turns;
const helixH = turnsAll * pitch;
const l = Math.sqrt(Math.pow(helixH, 2) + Math.pow(Math.PI * helixD * turnsAll, 2));
const f = 1.16 * v0 / (4 * l);

console.log(f / 1000);

/*
    helix4
    helixD = 5;
    pitch = 1.6;
    turns = 4;
    f = 1375;


    helix5
    helixD = 5;
    pitch = 1.6;
    turns = 5;
    f = 1095;

    helix6
    turns = 6;
    helixD = 5;
    pitch = 1.3;
    f = 919??;

    helix433
    turns = 4.33;
    helixD = 5;
    pitch = 1.6;
    f = 1271??;
*/
