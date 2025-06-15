#!/usr/bin/env node
'use strict';

const { resolve } = require('path');
const { writeFile } = require('fs/promises');

const template = (cfg) => {
  const DIMA = (cfg.num - 1) * .5;
  // const DIMB = DIMA + 1.1;
  // const DIMC = DIMA + 4.9;

  const S = {
    x1: -(DIMA / 2 + 1.9 + 0.2),
    x2:  (DIMA / 2 + 1.9 + 0.2),
    y1: -0.2 - 0.5,
    y2: 3.8 + 0.2 - 0.5
  };


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
(pad "${pin + 1}" smd rect (at ${(pin - cfg.num / 2) / 2 + 0.25} -0.6) (size 0.3 1.2) (layers "F.Cu" "F.Paste" "F.Mask"))`).join('\n')
}
(pad "MP" smd rect (at -${DIMA / 2 + 2.45 - 1.2 / 2} ${3.1 - 1.6 / 2 - 0.9}) (size 1.2 1.6) (layers "F.Cu" "F.Paste" "F.Mask"))
(pad "MP" smd rect (at  ${DIMA / 2 + 2.45 - 1.2 / 2} ${3.1 - 1.6 / 2 - 0.9}) (size 1.2 1.6) (layers "F.Cu" "F.Paste" "F.Mask"))

(fp_line (start ${S.x1} ${S.y2}) (end ${S.x2} ${S.y2}) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))
(fp_line (start ${S.x1} ${S.y1}) (end ${S.x1 + 1} ${S.y1}) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))
(fp_line (start ${S.x2} ${S.y1}) (end ${S.x2 - 1} ${S.y1}) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))

(fp_line (start ${S.x1} ${S.y1}) (end ${S.x1} ${S.y1 + 1}) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))
(fp_line (start ${S.x2} ${S.y1}) (end ${S.x2} ${S.y1 + 1}) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))
(fp_line (start ${S.x1} ${S.y2}) (end ${S.x1} ${S.y2 - 1}) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))
(fp_line (start ${S.x2} ${S.y2}) (end ${S.x2} ${S.y2 - 1}) (stroke (width 0.1) (type solid)) (layer "F.SilkS"))

(model "\${AI6YP_3DMODEL_DIR}/fpc-${cfg.num}-pin-narrow.step" (offset (xyz 0 0 0)) (scale (xyz 1 1 1)) (rotate (xyz 0 0 0)))
)
`;
};

async function main (cfgs) {
  for (const cfg of cfgs) {
    const res = template(cfg);
    await writeFile(resolve(__dirname, '../AI6YP.pretty', cfg.name + '.kicad_mod'), res);
  }
}

main([6, 24].map(e => ({name: 'FPC-' + e + 'pin-narrow', num: e})));
