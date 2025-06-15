#!/usr/bin/env node
'use strict';

const { resolve } = require('path');
const { writeFile } = require('fs/promises');

const template = ({name}) => `\
(footprint "${name}"
  (version 20240108)
  (generator "pcbnew")
  (generator_version "8.0")
  (layer "F.Cu")
  (descr "CUBE-A panel")
  (tags "CUBE")
  (property "Reference" "REF**" (at 0 -2 0) (layer "F.SilkS") (effects (font (size 1 1) (thickness 0.15))))
  (property "Value" "CUBE-A" (at 0 -4 0) (layer "F.Fab") (effects (font (size 1 1) (thickness 0.15))))
  (property "Footprint" "CUBE-A" (at 0 -6 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1))))
  (property "Datasheet" "" (at 0 -8 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1))))
  (property "Description" "" (at 0 -10 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1))))
  (attr smd)

${
  [[0, 0], [100, 0], [100, 100], [0, 100]].map((_, i, arr) =>
    `  (fp_line (start ${arr[i][0]} ${arr[i][1]}) (end ${arr[(i + 1) & 3][0]} ${arr[(i + 1) & 3][1]}) (stroke (width 0.1) (type solid)) (layer "Edge.Cuts"))`
  ).join('\n')
}

${
  Array.from({length: 7}, (_, i) => i).flatMap(y =>
    Array.from({length: 7}, (_, i) => i).flatMap(x =>
      `  (pad "GND" thru_hole oval (at  ${(x + 1) * 100 / 8} ${(y + 1) * 100 / 8} 45) (size 5 15) (drill oval 4 14) (layers "*.Cu" "*.Mask"))`
    )
  ).join('\n')
}

)
`;

async function main (specs) {
  for (const cfg of specs) {
    const { name } = cfg;
    const res = template({name});
    await writeFile(resolve(__dirname, '../AI6YP.pretty', name + '.kicad_mod'), res);
  }
}

main([
  {name: 'CUBE-A'}
]);
