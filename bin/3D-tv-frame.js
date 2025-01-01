'use strict';

const {
  // draw,
  makeBaseBox
} = replicad;

const WP = 360; // panel width
const HP = 208; // panel height
const WC = 330; // fixture width

const main = () => {

  const panelBox = makeBaseBox(WP + 1 + 1, HP + 1 + 1, 10).translateZ(0.75);
  const viewBox = makeBaseBox(WP - 4 - 4, HP - 4 - 7, 10).translateY((7 - 4) / 2);
  const extraBox = makeBaseBox(WC, HP + 7 + 15, 10).translate(0, (7 - 15) / 2, 1);
  const edgeCutBox = makeBaseBox(WP + 1 + 1, HP + 20 + 20, 10).translateZ(0.75 + 3);

  const panel = panelBox.fuse(viewBox).fuse(extraBox).fuse(edgeCutBox);

  const outerBox = makeBaseBox(
    WP
    + 4 // left
    + 4, // right
    HP
    + (7 + 4) // top
    + (15 + 4), // bottom
    7 + 2 // edge height
  ).translateY((7 - 15) / 2);

  const shape = outerBox.cut(panel);
  // const shape = edgeCutBox;

  return [{name: 'tv-frame-v1.0.0', shape, color: '#555', opacity: .9}];
};

/* globals replicad */
