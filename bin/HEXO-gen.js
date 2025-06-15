#!/usr/bin/env node
'use strict';

const { resolve } = require('path');
const { writeFile } = require('fs/promises');
const { roundedRegularPolygon } = require('./kicad.js');

const template = (cfg) => `\
(footprint "${cfg.name}"
(version 20240108) (generator "pcbnew") (generator_version "8.0") (layer "F.Cu")
(property "Reference" "REF**" (at 0 -0.5 0) (unlocked yes) (layer "F.SilkS") (effects (font (size 1 1) (thickness 0.1))))
(property "Value" "HEXO" (at 0 1 0) (unlocked yes) (layer "F.Fab") (effects (font (size 1 1) (thickness 0.15))))
(property "Footprint" "" (at 0 0 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1) (thickness 0.15))))
(property "Datasheet" "" (at 0 0 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1) (thickness 0.15))))
(property "Description" "" (at 0 0 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1) (thickness 0.15))))
(attr smd)
${[
    ...roundedRegularPolygon({r1: 45, r2: 4,   edges: 6, layer: 'Edge.Cuts'}),
    ...roundedRegularPolygon({r1: 45, r2: 3.5, edges: 6, layer: 'F.SilkS'})
  ].join('\n')}
(fp_text user "\${REFERENCE}" (at 0 2.5 0) (unlocked yes) (layer "F.Fab") (effects (font (size 1 1) (thickness 0.15))))
)
`;

async function main (cfg) {
  const { name } = cfg;
  const res = template(cfg);
  await writeFile(resolve(__dirname, '../AI6YP.pretty', name + '.kicad_mod'), res);
}

main({name: 'hexo-45-4p5'});

// , body: [
//   // ...[-1, 1].flatMap(idx => [
//   //   {kind: 'circle', center: [idx * cfg.pointerLength, 0], end: [idx * (cfg.pointerLength + cfg.magnetR + 1), 0], fill: 'solid', layer: 'F.Cu', net: 1},
//   //   {kind: 'circle', center: [idx * cfg.pointerLength, 0], end: [idx * (cfg.pointerLength + cfg.magnetR + 1), 0], fill: 'solid', layer: 'B.Cu', net: 1},
//   //   {kind: 'circle', center: [idx * cfg.pointerLength, 0], end: [idx * (cfg.pointerLength + cfg.magnetR    ), 0], fill: 'solid', layer: 'F.Mask'},
//   //   {kind: 'circle', center: [idx * cfg.pointerLength, 0], end: [idx * (cfg.pointerLength + cfg.magnetR + 1), 0], fill: 'solid', layer: 'B.Mask'},
//   //   ...[-1, 1].flatMap(idy => {
//   //     const y = idy * cfg.boltSpacing / 2;
//   //     const center = [idx * cfg.pointerLength, y];
//   //     return [
//   //       {kind: 'circle', center, end: [idx * (cfg.pointerLength + 4.22 / 2), y], layer: 'Edge.Cuts'},
//   //       {kind: 'circle', center, end: [idx * (cfg.pointerLength + 8 / 2), y], fill: 'solid', layer: 'F.Cu', net: 1},
//   //       {kind: 'circle', center, end: [idx * (cfg.pointerLength + 7 / 2), y], fill: 'solid', layer: 'B.Cu', net: 1},
//   //       // {kind: 'circle', center, end: [idx * (cfg.pointerLength + 6 / 2), y], fill: 'solid', layer: 'F.Mask'},
//   //       // {kind: 'circle', center, end: [idx * (cfg.pointerLength + 7 / 2), y], fill: 'solid', layer: 'B.Mask'}
//   //     ];
//   //   }),
//   //   {kind: 'circle', center: [idx * cfg.pointerLength, 0], end: [idx * (cfg.pointerLength + cfg.magnetR - 1), 0], layer: 'Edge.Cuts'}
//   // ]),
//   {kind: 'roundedRegularPolygon', r1: 45, r2: 9 / 2, edges: 6, layer: 'Edge.Cuts'},
//   {kind: 'roundedRegularPolygon', r1: 45, r2: 8 / 2, edges: 6, layer: 'F.SilkS'}
//   // {kind: 'rect', start: [-50, -50], end: [50, 50], layer: 'Edge.Cuts'},
// ]}
// ]