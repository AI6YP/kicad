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
            cylinder({r: .5, h: mag(vec), fn: 8})
        )
    );

const turnPattern = [
    [ 0, 2,  10], [ .5, .1,  1 ], [ .5, .1,  .5], [ 1 , .1, .5 ],
    [ 6, 1,   0], [ 1,  .1, -.5], [ .5, .1, -.5], [ .5, .1, -1 ],
    [ 0, 2, -10], [-.5, .1, -1 ], [-.5, .1, -.5], [-1,  .1, -.5],
    [-6, 1,   0], [-1,  .1,  .5], [-.5, .1,  .5], [-.5, .1,  1 ]
];

const genTurns = (nTurns, pattern) => {
    const patternLength = pattern.length;
    const fullTurns = nTurns | 0;
    const tailTurns = (nTurns - fullTurns) * patternLength;
    let res = [];
    for (let i = 0; i < fullTurns; i++) {
        res = res.concat(pattern);
    }
    for (let i = 0; i < tailTurns; i++) {
        res = res.concat([pattern[i]]);
    }
    return res;
};

const coil = nTurns => {
    const turns = genTurns(nTurns, turnPattern);
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
    return res.root;
};

const main = () => coil(5 + 9/16);
