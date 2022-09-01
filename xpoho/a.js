'use strict';

const jscad = require('@jscad/modeling');
const { colorize, hexToRgb } = jscad.colors;
const { cylinder, cuboid, cylinderElliptic } = jscad.primitives;
const { union, subtract, intersect } = jscad.booleans;
const { translate, translateX, translateY, translateZ, rotateZ } = jscad.transforms;
const { extrudeFromSlices, slice } = jscad.extrusions;
const { mat4 } = jscad.maths;

const bridge = ({height, d1, d2, pointerLength}) =>
  translate([pointerLength, 0, height / 2],
    subtract(
      cylinder({
        radius: d2 / 2 + 2,
        height
      }),
      cylinder({ // inner hole
        radius: d2 / 2,
        height
      })
    )
  );

const bodyRing = ({innerD, outerD, aboveH, belowH}) => {
  const height = aboveH + belowH;
  const segments = 128;
  return translateZ(
    -height / 2 + aboveH,
    subtract(
      ...[outerD, innerD].map(d =>
        cylinder({
          height,
          segments,
          radius: d / 2
        })
      )
    )
  );
};

const bodyThread = ({aboveH, innerD}) => {
  const halfPitch = .75 / 2;
  const radius = innerD / 2;
  const step = 1 / 64;
  const thread1 =  extrudeFromSlices(
    {
      numberOfSlices: (6 * 2 / step) |0,
      callback: (progress, index, base) => {
        const slice1 = slice.transform(mat4.fromZRotation(mat4.create(), Math.PI * step * index), base);
        const slice2 = slice.transform(mat4.fromTranslation(mat4.create(), [0, 0, halfPitch * step * index]), slice1);
        return slice2;
      }
    },
    slice.fromPoints([
      [0, radius,             halfPitch * .9],
      [0, radius + halfPitch,               0],
      [0, radius,            -halfPitch * .9],
      [0, radius - halfPitch,               0]
    ])
  );
  return translateZ(aboveH - 3, thread1);
};

const bodyFloor = ({belowH, innerD, outerD}) => {
  return translateZ(
    -belowH / 2, // floor
    cylinder({
      radius: (innerD + outerD) / 4,
      height: belowH,
      // segments: 64
    })
  );
};

const bodyFloorHoles = ({pointerLength}) => {
  const magnetD = 23;
  const boltSpacing = 31;
  return [-1, 1].map(x =>
    translateX(x * pointerLength,
      union(
        translateZ(-8, cylinder({ // magnet cylinder hole
          radius: magnetD / 2,
          height: 16.5
        })),
        // translateZ(-22, cylinderElliptic({
        //   height: 16,
        //   startRadius: [14, 50],
        //   endRadius: [magnetD / 2, 23 / 2],
        //   segments: 64
        // })),

        // ...[-1, 1].map(y => translateY(y * 15.5, cylinder({radius: 5.2 / 2, height: 4}))))
        ...[-.5, .5].map(y => translateY(y * boltSpacing, cylinder({radius: 3 / 2, height: 10}))))
    )
  );
};


const body = ({pointerLength}) => {
  const innerD = 94.1 + .3;
  const outerD = 97 + .2;
  const aboveH = 11.5; // mm
  const belowH = 3; // 28; // mm
  return colorize(hexToRgb('#aaaaff'),
    union(
      subtract(
        bodyRing({innerD, outerD, aboveH, belowH}),
        bodyThread({innerD, aboveH})
      ),
      subtract(
        bodyFloor({belowH, innerD, outerD}),
        // cuboid({size: [40, 60, 100]}),
        ...bodyFloorHoles({pointerLength})
      ),
      // ...[-1, 1].flatMap(x => // feet
      //   [-1, 1, -.5, .5].map(y =>
      //     translate([x * 24, y * 30, 0],
      //       subtract(
      //         cylinder({
      //           radius: 2,
      //           height: 11
      //         }),
      //         cylinder({
      //           radius: .7,
      //           height: 11
      //         })
      //       )
      //     )
      //   )
      // )
    )
  );
};

const epaper29 = () =>
  colorize(hexToRgb('#555555'),
    translate(
      [0, 3, 2.5],
      cuboid({size: [38, 80, 6]})
    )
  );

const bezel29 = ({pointerLength}) =>
  colorize(hexToRgb('#77777777'),
    translate([0, 0, 5.5],
      intersect(
        subtract(
          cylinder({
            radius: 92 / 2,
            height: .3
          }),
          cuboid({size: [30, 68, 5]}),
          ...[-1, 1].map(i => translateX(i * pointerLength, cylinder({radius: 24 / 2})))
        ),
        cuboid({size: [60, 100, 5]})
      )
    )
  );

const main = () => {
  const innerD = 94; // lens cap thread diameter
  // const d2 = 23; // metal ring diameter
  const pointerLength = 34;
  return [
    // epaper29(),
    // bezel29({pointerLength}),
    body({pointerLength}),
    // bridge({height: 16, d1, d2, pointerLength}),
    // rotateZ(Math.PI, bridge({height: 16, d1, d2, pointerLength}))
  ];
};

module.exports.main = main;
