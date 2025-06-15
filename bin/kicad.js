'use strict';

const roundedRegularPolygon = (cfg) => Array
  .from({length: cfg.edges}, (_, i) => i)
  .flatMap(idx => {
    const deltaAngle = Math.PI * 2 / cfg.edges;
    const a0 = deltaAngle * idx;
    const a1 = deltaAngle * (idx + 1);

    const x0 = Math.cos(a0) * cfg.r1;
    const y0 = Math.sin(a0) * cfg.r1;
    const x0p = x0 + Math.cos(a0 + deltaAngle / 2) * cfg.r2;
    const x00 = x0 + Math.cos(a0) * cfg.r2;
    const x0n = x0 + Math.cos(a0 - deltaAngle / 2) * cfg.r2;
    const y0p = y0 + Math.sin(a0 + deltaAngle / 2) * cfg.r2;
    const y00 = y0 + Math.sin(a0) * cfg.r2;
    const y0n = y0 + Math.sin(a0 - deltaAngle / 2) * cfg.r2;

    const x1 = Math.cos(a1) * cfg.r1;
    const y1 = Math.sin(a1) * cfg.r1;
    // const x1p = x1 + Math.cos(a1 + deltaAngle / 2) * el.r2;
    // const x10 = x1 + Math.cos(a1) * el.r2;
    const x1n = x1 + Math.cos(a1 - deltaAngle / 2) * cfg.r2;
    // const y1p = y1 + Math.sin(a1 + deltaAngle / 2) * el.r2;
    // const y10 = y1 + Math.sin(a1) * el.r2;
    const y1n = y1 + Math.sin(a1 - deltaAngle / 2) * cfg.r2;
    return [
      `(fp_line (start ${x0p} ${y0p}) (end ${x1n} ${y1n}) (stroke (width 0.1) (type default)) (layer "${cfg.layer}"))`,
      `(fp_arc (start ${x0n} ${y0n}) (mid ${x00} ${y00}) (end ${x0p} ${y0p}) (stroke (width 0.1) (type default)) (layer "${cfg.layer}"))`
    ];
  });

const rect = (cfg) =>
  `(fp_rect (start ${cfg.start.join(' ')}) (end ${cfg.end.join(' ')}) (stroke (width 0.05) (type default)) (fill none) (layer "${cfg.layer}"))`;

const circle = (cfg) => '(fp_circle\n' +
  '  (center ' + cfg.center.join(' ') + ')\n' +
  '  (end ' + cfg.end.join(' ') + ')\n' +
  '  (stroke\n    (width 0.05)\n    (type default)\n  )\n' +
  '  (fill ' + (cfg.fill || 'none') + ')\n' +
  '  (layer "' + cfg.layer + '")\n' +
  ')';

exports.roundedRegularPolygon = roundedRegularPolygon;
exports.rect = rect;
exports.circle = circle;
