#!/usr/bin/env node
'use strict';

const { resolve } = require('path');
const { writeFile } = require('fs/promises');

const template = (cfg) => {
  const DIMA = (cfg.num - 1) * .5;
  const DIMB = DIMA + 1.1;
  const DIMC = DIMA + 4.9;
  return `\
(footprint "${cfg.name}"
(version 20240108) (generator "pcbnew") (generator_version "8.0") (layer "F.Cu")
(property "Reference" "REF**" (at 0 -2.5 0) (unlocked yes) (layer "F.SilkS") (effects (font (size 1 1) (thickness 0.1))))
(property "Value" "${cfg.name}" (at 0 1.5 0) (unlocked yes) (layer "F.Fab") (effects (font (size 1 1) (thickness 0.15))))
(fp_text user "\${REFERENCE}" (at 0 3.5 0) (unlocked yes) (layer "F.Fab") (effects (font (size 1 1) (thickness 0.15))))
(property "Footprint" "" (at 0 0 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1) (thickness 0.15))))
(property "Datasheet" "" (at 0 0 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1) (thickness 0.15))))
(property "Description" "" (at 0 0 0) (unlocked yes) (layer "F.Fab") (hide yes) (effects (font (size 1 1) (thickness 0.15))))
(attr smd)
${Array.from({length: cfg.num}, (_, i) => i).map(pin => `\
(pad "${pin + 1}" smd rect (at ${(pin - cfg.num / 2) / 2 + 0.25} -0.75) (size 0.3 1.5) (layers "F.Cu" "F.Paste" "F.Mask"))`).join('\n')
}
(pad "MP" smd rect (at -${DIMA / 2 + 1.7} 1.85) (size 2 1.5) (layers "F.Cu" "F.Paste" "F.Mask"))
(pad "MP" smd rect (at  ${DIMA / 2 + 1.7} 1.85) (size 2 1.5) (layers "F.Cu" "F.Paste" "F.Mask"))
(fp_line (start -${DIMC / 2} 0) (end ${DIMC / 2} 0) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))
(fp_line (start -${DIMC / 2} 4.5) (end ${DIMC / 2} 4.5) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))

(fp_line (start -${DIMC / 2} 0) (end -${DIMC / 2} 4.5) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))
(fp_line (start  ${DIMC / 2} 0) (end  ${DIMC / 2} 4.5) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))

)
`;
};

async function main (cfgs) {
  for (const cfg of cfgs) {
    const res = template(cfg);
    await writeFile(resolve(__dirname, '../AI6YP.pretty', cfg.name + '.kicad_mod'), res);
  }
}

main([6, 24, 30].map(e => ({name: 'FPC-' + e + 'pin', num: e})));
