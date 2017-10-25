'use strict';

const mag = vec => Math.sqrt(
    vec.reduce((res, e) => res + Math.pow(e, 2), 0));

const rotx = vec => -Math.atan2(
    Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2)),
    vec[2]
  ) * 180 / Math.PI;

const rotz = vec => -Math.atan2(vec[0], vec[1]) * 180 / Math.PI;

const wireSegment = (pos, vec) =>
    translate(pos,
        rotate([rotx(vec), 0, rotz(vec)],
            cylinder({r: .325, h: mag(vec), fn: 8})
        )
    );

const turnPattern = [
    [ 0, 1.8,  10], [1, .1, 1.5 ], [ 1.5, .1,  1],
    [ 6, .8,   0], [1.5, .1, -1], [ 1, .1, -1.5],
    [ 0, 1.8, -10], [-1, .1, -1.5], [-1.5, .1, -1],
    [-6, .8,   0], [-1.5, .1,  1], [-1, .1,  1.5]
];

const t200CrossSection = () => (
    polygon([
        [-3, -7], [-4, -6.5], [-4.5, -6], [-5, -5],
        [-5,  5], [-4.5,  6], [-4,  6.6], [-3,  7],
        [ 3,  7], [ 4,  6.5], [ 4.5,  6], [ 5,  5],
        [ 5, -5], [ 4.5, -6], [ 4, -6.6], [ 3, -7]
    ])
);

const genTurns = (nTurns, pattern) => {
    const patternLength = pattern.length;
    const fullTurns = nTurns | 0;
    const tailTurns = Math.round((nTurns - fullTurns) * patternLength);
    let res = [];
    for (let i = 0; i < fullTurns; i++) {
        res = res.concat(pattern);
    }
    for (let i = 0; i < tailTurns; i++) {
        res = res.concat([pattern[i]]);
    }
    return res;
};

const bendTurns = (turns, radius, step) => {
    let oldPos = [radius, 0, 0];
    return turns.map(vec => {
        const fullVec = [
            vec[0],
            vec[1] * step,
            vec[2]
        ];
        const newPos = [
            oldPos[0] + fullVec[0],
            oldPos[1] + fullVec[1],
            oldPos[2] + fullVec[2]
        ];
        const oldAng = [
            oldPos[0] * Math.cos(oldPos[1]),
            oldPos[0] * Math.sin(oldPos[1]),
            oldPos[2]
        ];
        const newAng = [
            newPos[0] * Math.cos(newPos[1]),
            newPos[0] * Math.sin(newPos[1]),
            newPos[2]
        ];
        const vecAng = [
            newAng[0] - oldAng[0],
            newAng[1] - oldAng[1],
            newAng[2] - oldAng[2]
        ];
        oldPos = newPos;
        return vecAng;
    });
};

const coil = nTurns => {
    const turns = bendTurns(
        genTurns(nTurns, turnPattern), 15.2, 0.02
    );
    const res = turns.reduce((res, turn, i) => {
        const {root, pos} = res;
        return {
            root: root.union(wireSegment(pos, turn)),
            pos: pos.map((e, i) => e + turn[i])
        };
    }, {
        root: {union: el => el},
        pos: [0, 0, 0]
    });
    return res.root.translate([15.2, 0, -5]);
};


const main = () => union(
    rotate_extrude(
        {fn: 72},
        translate(
            [20.7, 0, 0],
            t200CrossSection()
        )
    ).setColor([1, 1, 0, 0.5]),
    coil(50 + 7/12).setColor([1, .3, .1])
);
