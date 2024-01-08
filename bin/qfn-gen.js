#!/usr/bin/env node
'use strict';

const { resolve } = require('path');
const { writeFile } = require('fs/promises');

const genOutline = (hbs) => {
  const at = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
    .map(e =>
      e.map(c => c * hbs));

  at.push(at[0]); // cycle

  const lines = [];
  for (let i = 0; i < at.length - 1; i++) {
    lines.push(`  (fp_line (start ${at[i].join(' ')}) (end ${at[i + 1].join(' ')}) (stroke (width 0.1) (type solid)) (layer "F.Fab"))`);
  }
  return lines.join('\n');
};

const genSilk = (hbs) =>
  [[-1, -1], [1, -1], [1, 1], [-1, 1]]
    .flatMap(e => [
      `(start ${e[0] * hbs} ${e[1] * hbs}) (end ${e[0] * hbs       } ${e[1] * (hbs - .4)})`,
      `(start ${e[0] * hbs} ${e[1] * hbs}) (end ${e[0] * (hbs - .4)} ${e[1] * hbs       })`
    ])
    .map(e => `  (fp_line ${e} (stroke (width 0.1) (type solid)) (layer "F.SilkS"))`)
    .join('\n');


const template = ({name, pads, cfg}) => `\
(footprint "${name}" (version 20231219) (generator pcbnew)
  (layer "F.Cu")
  (descr "generated")
  (tags "QFN NoLead")
  (attr smd)
  (fp_text reference "REF**" (at 0 -${cfg.bodySize / 2 + 1}) (layer "F.SilkS") (effects (font (size 1 1) (thickness 0.15))))
  (fp_text value "${name}" (at 0 2.8) (layer "F.Fab") (effects (font (size 1 1) (thickness 0.15))))
  (fp_text user "\${REFERENCE}" (at 0 0) (layer "F.Fab") (effects (font (size 0.75 0.75) (thickness 0.11))))
  (fp_circle (center ${-cfg.bodySize / 2 - .1} ${-cfg.bodySize / 2 - .1}) (end ${-cfg.bodySize / 2} ${-cfg.bodySize / 2}) (stroke (width 0.1) (type default)) (fill solid) (layer "F.SilkS"))
${genOutline(cfg.bodySize / 2)}
${genSilk(cfg.bodySize / 2 + 0.1)}
${pads.map(pad => `\
  (pad "${pad.idx}" smd roundrect (at ${pad.at.join(' ')}) (size ${pad.size.join(' ')}) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.25))`
  ).join('\n')}
  (pad "${pads.length + 1}" smd rect (at 0 0) (size ${cfg.epSize} ${cfg.epSize}) (layers "F.Cu" "F.Mask"))
${cfg.model3d ? `\
  (model "../AI6YP.3dshapes/${name}.${cfg.model3d}"
    (offset (xyz 0 0 0)) (scale (xyz 1 1 1)) (rotate (xyz 0 0 0))
  )
` : ''
})
`;

const exposure = 0.4; // extra pads outside of package

async function main (specs) {
  for (const cfg of specs) {
    const { vendor, epSize, pinCount, bodySize, pitch, lead } = cfg;
    const name = `${vendor}-QFN-${pinCount}-${bodySize}x${bodySize}mm-P${pitch}mm-EP${epSize}x${epSize}mm`;
    const pads = Array
      .from({length: pinCount})
      .map((pad, i) => {
        const side = Math.floor(i / pinCount * 4);
        const shortIdx = i % (pinCount / 4);
        const h = lead.length + exposure;
        const w = lead.width;
        const x = (shortIdx - pinCount / 8 + 0.5) * pitch;
        const y = (bodySize + (exposure - lead.length)) / 2;
        const at = [[-y, x], [x, y], [y, -x], [-x, -y]][side];
        const size = [[h, w], [w, h]][side & 1];
        return {idx: i + 1, size, at};
      });
    const res = template({name, pads, cfg});
    await writeFile(resolve(__dirname, '../AI6YP.pretty', name + '.kicad_mod'), res);
  }
}

main([
  {vendor: 'ESP',   pinCount: 32, bodySize:  5, pitch: .5, epSize: 3.7,  lead: {width: .25, length: 0.4}, model3d: 'step'},
  {vendor: 'ATMEL', pinCount: 48, bodySize:  7, pitch: .5, epSize: 5.6,  lead: {width: .25, length: 0.4}, model3d: 'step'},
  {vendor: 'GIWIN', pinCount: 88, bodySize: 10, pitch: .4, epSize: 6.74, lead: {width: .2,  length: 0.4}}
]);
