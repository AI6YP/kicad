
function getParameterDefinitions () {
    return [{
        name: 'scale',
        type: 'float',
        initial: 20
    }, {
        name: 'height',
        type: 'float',
        initial: 3
    }, {
        name: 'wall',
        type: 'float',
        initial: 0.25
    }];
}

const pental = (() => {
    const alfa = 2 * Math.PI / 5;
    const x = Math.cos(alfa);
    const y = x * Math.tan(alfa / 2);
    return Math.sqrt(x*x + y*y);
})();

const pentagram = s => {
    const delta = Math.PI / 5;
    return [0, 1, 2, 3, 4].reduce((res, cur) => {
        const alfa = 2 * Math.PI * cur / 5;
        return res.concat([[
            s * Math.sin(alfa),
            s * Math.cos(alfa)
        ], [
            pental * s * Math.sin(alfa + delta),
            pental * s * Math.cos(alfa + delta)
        ]]);
    }, []);
};

const pentagon = s => [0, 1, 2, 3, 4]
    .map(i => 2 * Math.PI * (i + 0.5) / 5)
    .map(alfa => [
        s * Math.sin(alfa),
        s * Math.cos(alfa)
]);

function main (props) {
    const a = polygon(pentagram(props.scale))
        .extrude({offset: [0, 0, props.height]});

    const b = polygon(pentagram(props.scale * (1 - props.wall)))
        .extrude({offset: [0, 0, props.height + 1]});

    const c = polygon(pentagon(props.scale / 2))
        .extrude({offset: [0, 0, props.height + 1]})
        .translate([0, 0, props.height / 2]);

    const d = polygon(pentagon(props.scale * pental))
        .extrude({offset: [0, 0, props.height]});

    const e = polygon(pentagon(props.scale * pental * (1 - props.wall)))
        .extrude({offset: [0, 0, props.height]});
        
    const bar = cube({size: [
        props.scale,
        props.scale * props.wall * 0.3,
        3 * props.height
    ], center: true})
        .translate([0, props.scale * 0.05])
        // .setColor([0, 1, 0])

    return a
        .subtract(b)
        .subtract(c)
        .union(d)
        .subtract(e.subtract(bar))
        // .union(bar)
}
