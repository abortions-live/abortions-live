async function sprinkle(per_sec) {
    var canvas = document.getElementById('canvas')
    var babies = sprinkler.create(canvas)
    var FULL_ROTATION = 2 * Math.PI;

    // A list of your images
    var images = [
        'assets/img/babies/3t-pink.png',
        'assets/img/babies/3t-yellow.png',
        'assets/img/babies/3t-brown.png',
        'assets/img/babies/3t-black.png',
    ]

    // Start the animation
    babies.start(images, {
        selectImages: [0, 1, 2, 2, 2, 3, 3],

        angle: Math.PI,

        imagesInSecond: per_sec, // Particles per second
        burnInSeconds: 2,

        // Scale
        zMin: 0.15, zMax: 0.2, // Range of initial particle sizes
        dzMin: 0, dzMax: 0, // Range of growing speeds
        ddzMin: -0.002, ddzMax: -0.002,

        // Rotation
        rMin: 0, rMax: 0.6 * FULL_ROTATION, // Range of initial particle rotations
        drMin: -1, drMax: 1, // Range of rotation speeds
        ddrMin: -0, ddrMax: 0,

        // Alpha
        aMin: 1.0, aMax: 1.0, // Range of initial alpha/opacity
        daMin: 0, daMax: 0, // Range of opacity changing speed
        ddaMin: -0.005, ddaMax: -0.005,

        // Horizontal
        dxMin: -100, dxMax: 100, // Range of horizontal speeds (spread)
        ddxMin: 0, ddxMax: 0,

        // Vertical speed from the starting height y = 0
        dyMin: 120, dyMax: 320, // Range of vertical speeds (fall px/sec)
        ddyMin: 20, ddyMax: 20, // range for vertical acceleration. Between [0, Inf]

        // See docs for advanced animation parameters
    })
}