// levels.js - Level data for all 5 levels
// Tile size: 40x40 pixels
// Canvas reference: wider levels scroll with camera

const TILE = 40;

const LEVEL_NAMES = [
    'TEAMWORK',
    'BUTTONS',
    'TRAPS',
    'CHAOS',
    'FRUSTRATED'
];

const LEVEL_MESSAGES = {
    1: [
        { x: 300, text: "Welcome to FRUSTRATED!" },
        { x: 800, text: "Work together!" },
        { x: 1600, text: "Everyone must reach the flag!" }
    ],
    2: [
        { x: 200, text: "Stand on buttons to open doors!" },
        { x: 900, text: "Some doors need 2 buttons!" },
        { x: 1800, text: "Don't leave your team behind!" }
    ],
    3: [
        { x: 200, text: "Watch out for traps!" },
        { x: 1000, text: "Timing is everything!" }
    ],
    4: [
        { x: 200, text: "CHAOS MODE!" },
        { x: 1200, text: "Who pressed that button?!" }
    ],
    5: [
        { x: 200, text: "FRUSTRATED?" },
        { x: 1500, text: "Almost there..." },
        { x: 2800, text: "DON'T GIVE UP!" }
    ]
};

// Level builder helper
function createLevel(config) {
    return {
        name: config.name,
        width: config.width,
        height: config.height || 600,
        spawnX: config.spawnX || 80,
        spawnY: config.spawnY || 400,
        platforms: config.platforms || [],
        spikes: config.spikes || [],
        buttons: config.buttons || [],
        doors: config.doors || [],
        movingPlatforms: config.movingPlatforms || [],
        checkpoints: config.checkpoints || [],
        finish: config.finish,
        decorations: config.decorations || []
    };
}

const LEVELS = {
    // ========== LEVEL 1: TEAMWORK ==========
    1: createLevel({
        name: 'TEAMWORK',
        width: 3200,
        height: 600,
        spawnX: 80,
        spawnY: 400,
        platforms: [
            // Ground sections
            { x: 0, y: 520, w: 600, h: 80 },
            { x: 720, y: 520, w: 400, h: 80 },
            { x: 1240, y: 520, w: 500, h: 80 },
            { x: 1860, y: 520, w: 300, h: 80 },
            { x: 2280, y: 520, w: 920, h: 80 },

            // Stepping platforms
            { x: 600, y: 460, w: 80, h: 20 },
            { x: 680, y: 420, w: 80, h: 20 },

            // Higher platforms
            { x: 1100, y: 400, w: 120, h: 20 },
            { x: 1300, y: 360, w: 100, h: 20 },

            // Wall sections
            { x: 1740, y: 320, w: 40, h: 200 },

            // Upper path
            { x: 1860, y: 380, w: 200, h: 20 },
            { x: 2100, y: 340, w: 160, h: 20 },

            // Final area platforms
            { x: 2500, y: 400, w: 120, h: 20 },
            { x: 2700, y: 350, w: 120, h: 20 },
        ],
        spikes: [
            { x: 1160, y: 500, w: 80, h: 20 },
            { x: 2160, y: 500, w: 120, h: 20 },
        ],
        buttons: [
            { id: 'btn1', x: 1680, y: 496, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#2ed573' }
        ],
        doors: [
            { id: 'door1', x: 1740, y: 360, w: 40, h: 160, color: '#2ed573' }
        ],
        movingPlatforms: [
            { x: 2000, y: 450, w: 100, h: 20, moveX: 160, moveY: 0, speed: 1.5 }
        ],
        checkpoints: [
            { id: 1, x: 1260, y: 480 },
            { id: 2, x: 2300, y: 480 }
        ],
        finish: { x: 3000, y: 440, w: 80, h: 80 }
    }),

    // ========== LEVEL 2: BUTTONS ==========
    2: createLevel({
        name: 'BUTTONS',
        width: 4000,
        height: 600,
        spawnX: 80,
        spawnY: 400,
        platforms: [
            // Ground
            { x: 0, y: 520, w: 500, h: 80 },
            { x: 620, y: 520, w: 300, h: 80 },
            { x: 1040, y: 520, w: 600, h: 80 },
            { x: 1760, y: 520, w: 400, h: 80 },
            { x: 2280, y: 520, w: 300, h: 80 },
            { x: 2700, y: 520, w: 500, h: 80 },
            { x: 3320, y: 520, w: 680, h: 80 },

            // Stepping platforms
            { x: 500, y: 460, w: 80, h: 20 },
            { x: 560, y: 420, w: 80, h: 20 },

            // Button platforms
            { x: 1100, y: 420, w: 100, h: 20 },
            { x: 1380, y: 420, w: 100, h: 20 },

            // Upper area
            { x: 1700, y: 380, w: 120, h: 20 },
            { x: 1900, y: 340, w: 100, h: 20 },

            // Walls for doors
            { x: 940, y: 320, w: 40, h: 200 },
            { x: 1640, y: 280, w: 40, h: 240 },
            { x: 2580, y: 300, w: 40, h: 220 },

            // Platform after doors
            { x: 2000, y: 440, w: 200, h: 20 },
            { x: 2700, y: 400, w: 120, h: 20 },
            { x: 2900, y: 350, w: 100, h: 20 },

            // Button platforms (elevated)
            { x: 2300, y: 400, w: 80, h: 20 },
            { x: 2460, y: 400, w: 80, h: 20 },

            // Final stretch
            { x: 3100, y: 420, w: 120, h: 20 },
            { x: 3400, y: 380, w: 120, h: 20 },
        ],
        spikes: [
            { x: 920, y: 500, w: 120, h: 20 },
            { x: 2160, y: 500, w: 120, h: 20 },
            { x: 3200, y: 500, w: 120, h: 20 },
        ],
        buttons: [
            { id: 'btn1', x: 440, y: 496, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#2ed573' },
            { id: 'btn2', x: 1120, y: 396, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#3742fa' },
            { id: 'btn3', x: 1400, y: 396, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#3742fa' },
            { id: 'btn4', x: 2320, y: 376, w: 40, h: 24, doorIds: ['door3'], requiredCount: 1, color: '#ffa502' },
            { id: 'btn5', x: 2480, y: 376, w: 40, h: 24, doorIds: ['door3'], requiredCount: 1, color: '#ffa502' },
        ],
        doors: [
            { id: 'door1', x: 940, y: 360, w: 40, h: 160, color: '#2ed573' },
            { id: 'door2', x: 1640, y: 320, w: 40, h: 200, color: '#3742fa', requiredButtons: 2 },
            { id: 'door3', x: 2580, y: 340, w: 40, h: 180, color: '#ffa502', requiredButtons: 2 },
        ],
        movingPlatforms: [
            { x: 1800, y: 480, w: 100, h: 20, moveX: 0, moveY: -140, speed: 1.2 },
            { x: 3000, y: 460, w: 100, h: 20, moveX: 200, moveY: 0, speed: 1.8 },
        ],
        checkpoints: [
            { id: 1, x: 1060, y: 480 },
            { id: 2, x: 1780, y: 480 },
            { id: 3, x: 2720, y: 480 }
        ],
        finish: { x: 3800, y: 440, w: 80, h: 80 }
    }),

    // ========== LEVEL 3: TRAPS ==========
    3: createLevel({
        name: 'TRAPS',
        width: 4400,
        height: 600,
        spawnX: 80,
        spawnY: 400,
        platforms: [
            // Ground with gaps (traps!)
            { x: 0, y: 520, w: 400, h: 80 },
            { x: 520, y: 520, w: 200, h: 80 },
            { x: 840, y: 520, w: 300, h: 80 },
            { x: 1260, y: 520, w: 200, h: 80 },
            { x: 1580, y: 520, w: 400, h: 80 },
            { x: 2100, y: 520, w: 300, h: 80 },
            { x: 2520, y: 520, w: 400, h: 80 },
            { x: 3040, y: 520, w: 300, h: 80 },
            { x: 3460, y: 520, w: 940, h: 80 },

            // Small platforms over spikes
            { x: 400, y: 450, w: 60, h: 15 },
            { x: 480, y: 400, w: 60, h: 15 },

            // Elevated sections
            { x: 900, y: 400, w: 100, h: 20 },
            { x: 1050, y: 350, w: 80, h: 20 },
            { x: 1200, y: 400, w: 80, h: 20 },

            // Button areas
            { x: 1600, y: 400, w: 80, h: 20 },
            { x: 1800, y: 360, w: 80, h: 20 },

            // Walls
            { x: 1980, y: 280, w: 40, h: 240 },
            { x: 2920, y: 300, w: 40, h: 220 },

            // Tricky platforms
            { x: 2400, y: 420, w: 60, h: 15 },
            { x: 2460, y: 370, w: 60, h: 15 },

            // Button elevated
            { x: 2560, y: 380, w: 80, h: 20 },
            { x: 2760, y: 380, w: 80, h: 20 },

            // Final area
            { x: 3100, y: 400, w: 100, h: 20 },
            { x: 3300, y: 350, w: 100, h: 20 },
            { x: 3500, y: 400, w: 120, h: 20 },
        ],
        spikes: [
            { x: 400, y: 500, w: 120, h: 20 },
            { x: 720, y: 500, w: 120, h: 20 },
            { x: 1140, y: 500, w: 120, h: 20 },
            { x: 1460, y: 500, w: 120, h: 20 },
            { x: 1980, y: 500, w: 120, h: 20 },
            { x: 2400, y: 500, w: 120, h: 20 },
            { x: 2920, y: 500, w: 120, h: 20 },
            { x: 3340, y: 500, w: 120, h: 20 },
            // Trap spikes on platforms
            { x: 1680, y: 376, w: 60, h: 20 },
        ],
        buttons: [
            { id: 'btn1', x: 1620, y: 376, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#2ed573' },
            { id: 'btn2', x: 1820, y: 336, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#2ed573' },
            { id: 'btn3', x: 2580, y: 356, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#ff4757' },
            { id: 'btn4', x: 2780, y: 356, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#ff4757' },
        ],
        doors: [
            { id: 'door1', x: 1980, y: 320, w: 40, h: 200, color: '#2ed573', requiredButtons: 2 },
            { id: 'door2', x: 2920, y: 340, w: 40, h: 180, color: '#ff4757', requiredButtons: 2 },
        ],
        movingPlatforms: [
            { x: 740, y: 460, w: 80, h: 20, moveX: 0, moveY: -100, speed: 2 },
            { x: 2100, y: 440, w: 90, h: 20, moveX: 200, moveY: 0, speed: 2.5 },
            { x: 3200, y: 480, w: 80, h: 20, moveX: 0, moveY: -130, speed: 1.5 },
        ],
        checkpoints: [
            { id: 1, x: 860, y: 480 },
            { id: 2, x: 1600, y: 480 },
            { id: 3, x: 2540, y: 480 },
            { id: 4, x: 3060, y: 480 }
        ],
        finish: { x: 4200, y: 440, w: 80, h: 80 }
    }),

    // ========== LEVEL 4: CHAOS ==========
    4: createLevel({
        name: 'CHAOS',
        width: 5000,
        height: 600,
        spawnX: 80,
        spawnY: 400,
        platforms: [
            // Start area
            { x: 0, y: 520, w: 400, h: 80 },
            // Chaos gaps
            { x: 520, y: 520, w: 160, h: 80 },
            { x: 800, y: 520, w: 160, h: 80 },
            { x: 1080, y: 520, w: 200, h: 80 },
            { x: 1400, y: 520, w: 400, h: 80 },
            { x: 1920, y: 520, w: 300, h: 80 },
            { x: 2340, y: 520, w: 200, h: 80 },
            { x: 2660, y: 520, w: 400, h: 80 },
            { x: 3180, y: 520, w: 200, h: 80 },
            { x: 3500, y: 520, w: 300, h: 80 },
            { x: 3920, y: 520, w: 1080, h: 80 },

            // Elevated button platforms
            { x: 1420, y: 380, w: 80, h: 20 },
            { x: 1580, y: 380, w: 80, h: 20 },
            { x: 1720, y: 380, w: 80, h: 20 },

            // Vertical platforms
            { x: 520, y: 400, w: 60, h: 15 },
            { x: 620, y: 350, w: 60, h: 15 },
            { x: 720, y: 300, w: 60, h: 15 },

            // Upper route
            { x: 900, y: 350, w: 120, h: 20 },
            { x: 1100, y: 300, w: 100, h: 20 },

            // Walls
            { x: 1280, y: 260, w: 40, h: 260 },
            { x: 1800, y: 260, w: 40, h: 260 },
            { x: 2540, y: 280, w: 40, h: 240 },
            { x: 3060, y: 280, w: 40, h: 240 },
            { x: 3380, y: 300, w: 40, h: 220 },

            // After doors
            { x: 1940, y: 400, w: 100, h: 20 },
            { x: 2100, y: 350, w: 100, h: 20 },
            { x: 2350, y: 380, w: 80, h: 20 },
            { x: 2480, y: 380, w: 80, h: 20 },

            // More chaos
            { x: 2700, y: 380, w: 80, h: 20 },
            { x: 2900, y: 350, w: 80, h: 20 },

            // Button platforms for door3
            { x: 3200, y: 380, w: 80, h: 20 },
            { x: 3300, y: 340, w: 80, h: 20 },

            // Final run
            { x: 3600, y: 400, w: 100, h: 20 },
            { x: 3800, y: 350, w: 100, h: 20 },
            { x: 4000, y: 400, w: 120, h: 20 },
            { x: 4200, y: 350, w: 100, h: 20 },
            { x: 4400, y: 400, w: 120, h: 20 },
        ],
        spikes: [
            { x: 400, y: 500, w: 120, h: 20 },
            { x: 680, y: 500, w: 120, h: 20 },
            { x: 960, y: 500, w: 120, h: 20 },
            { x: 1280, y: 500, w: 120, h: 20 },
            { x: 2220, y: 500, w: 120, h: 20 },
            { x: 2540, y: 500, w: 120, h: 20 },
            { x: 3060, y: 500, w: 120, h: 20 },
            { x: 3380, y: 500, w: 120, h: 20 },
            // Platform spikes
            { x: 1520, y: 356, w: 40, h: 20 },
            { x: 2760, y: 356, w: 40, h: 20 },
        ],
        buttons: [
            // Door 1: needs 3 buttons!
            { id: 'btn1', x: 1440, y: 356, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#a855f7' },
            { id: 'btn2', x: 1600, y: 356, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#a855f7' },
            { id: 'btn3', x: 1740, y: 356, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#a855f7' },
            // Door 2: needs 2
            { id: 'btn4', x: 2370, y: 356, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#ffa502' },
            { id: 'btn5', x: 2500, y: 356, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#ffa502' },
            // Door 3: needs 2
            { id: 'btn6', x: 3220, y: 356, w: 40, h: 24, doorIds: ['door3'], requiredCount: 1, color: '#2ed573' },
            { id: 'btn7', x: 3320, y: 316, w: 40, h: 24, doorIds: ['door3'], requiredCount: 1, color: '#2ed573' },
        ],
        doors: [
            { id: 'door1', x: 1800, y: 300, w: 40, h: 220, color: '#a855f7', requiredButtons: 3 },
            { id: 'door2', x: 2540, y: 320, w: 40, h: 200, color: '#ffa502', requiredButtons: 2 },
            { id: 'door3', x: 3380, y: 340, w: 40, h: 180, color: '#2ed573', requiredButtons: 2 },
        ],
        movingPlatforms: [
            { x: 1300, y: 460, w: 80, h: 20, moveX: 0, moveY: -140, speed: 2.5 },
            { x: 1850, y: 440, w: 100, h: 20, moveX: 200, moveY: 0, speed: 2 },
            { x: 2600, y: 450, w: 80, h: 20, moveX: 0, moveY: -120, speed: 3 },
            { x: 3400, y: 460, w: 100, h: 20, moveX: 100, moveY: 0, speed: 2.5 },
        ],
        checkpoints: [
            { id: 1, x: 1100, y: 480 },
            { id: 2, x: 1940, y: 480 },
            { id: 3, x: 2680, y: 480 },
            { id: 4, x: 3520, y: 480 }
        ],
        finish: { x: 4700, y: 440, w: 80, h: 80 }
    }),

    // ========== LEVEL 5: FRUSTRATED ==========
    5: createLevel({
        name: 'FRUSTRATED',
        width: 5600,
        height: 600,
        spawnX: 80,
        spawnY: 400,
        platforms: [
            // Tiny starting area
            { x: 0, y: 520, w: 300, h: 80 },
            // Gaps everywhere
            { x: 420, y: 520, w: 120, h: 80 },
            { x: 660, y: 520, w: 120, h: 80 },
            { x: 900, y: 520, w: 200, h: 80 },
            { x: 1220, y: 520, w: 200, h: 80 },
            { x: 1540, y: 520, w: 300, h: 80 },
            { x: 1960, y: 520, w: 200, h: 80 },
            { x: 2280, y: 520, w: 200, h: 80 },
            { x: 2600, y: 520, w: 400, h: 80 },
            { x: 3120, y: 520, w: 200, h: 80 },
            { x: 3440, y: 520, w: 300, h: 80 },
            { x: 3860, y: 520, w: 200, h: 80 },
            { x: 4180, y: 520, w: 400, h: 80 },
            { x: 4700, y: 520, w: 900, h: 80 },

            // Tiny stepping stones
            { x: 300, y: 460, w: 50, h: 15 },
            { x: 370, y: 410, w: 50, h: 15 },
            { x: 540, y: 450, w: 50, h: 15 },
            { x: 600, y: 400, w: 50, h: 15 },
            { x: 780, y: 460, w: 50, h: 15 },
            { x: 850, y: 410, w: 50, h: 15 },

            // Upper complex
            { x: 1000, y: 380, w: 80, h: 20 },
            { x: 1120, y: 330, w: 80, h: 20 },

            // Button sections (elevated)
            { x: 1560, y: 380, w: 60, h: 20 },
            { x: 1680, y: 340, w: 60, h: 20 },
            { x: 1800, y: 380, w: 60, h: 20 },

            // Walls (many)
            { x: 1420, y: 240, w: 40, h: 280 },
            { x: 1860, y: 220, w: 40, h: 300 },
            { x: 2480, y: 240, w: 40, h: 280 },
            { x: 3000, y: 260, w: 40, h: 260 },
            { x: 3320, y: 260, w: 40, h: 260 },
            { x: 3740, y: 280, w: 40, h: 240 },
            { x: 4580, y: 260, w: 40, h: 260 },

            // After doors
            { x: 2000, y: 400, w: 80, h: 20 },
            { x: 2140, y: 350, w: 80, h: 20 },
            { x: 2300, y: 380, w: 80, h: 20 },
            { x: 2420, y: 340, w: 80, h: 20 },

            // More buttons
            { x: 2620, y: 380, w: 60, h: 20 },
            { x: 2800, y: 340, w: 60, h: 20 },
            { x: 2940, y: 380, w: 60, h: 20 },

            // Final gauntlet buttons
            { x: 3140, y: 380, w: 60, h: 20 },
            { x: 3260, y: 340, w: 60, h: 20 },

            // After door3
            { x: 3460, y: 400, w: 80, h: 20 },
            { x: 3600, y: 350, w: 80, h: 20 },
            { x: 3680, y: 380, w: 60, h: 20 },

            // Final button area
            { x: 3880, y: 380, w: 60, h: 20 },
            { x: 4000, y: 340, w: 60, h: 20 },
            { x: 4100, y: 380, w: 60, h: 20 },

            // Victory platforms
            { x: 4300, y: 380, w: 100, h: 20 },
            { x: 4500, y: 340, w: 80, h: 20 },

            // Final stretch
            { x: 4800, y: 400, w: 100, h: 20 },
            { x: 5000, y: 360, w: 100, h: 20 },
            { x: 5200, y: 400, w: 120, h: 20 },
        ],
        spikes: [
            { x: 300, y: 500, w: 120, h: 20 },
            { x: 540, y: 500, w: 120, h: 20 },
            { x: 780, y: 500, w: 120, h: 20 },
            { x: 1100, y: 500, w: 120, h: 20 },
            { x: 1420, y: 500, w: 120, h: 20 },
            { x: 1840, y: 500, w: 120, h: 20 },
            { x: 2160, y: 500, w: 120, h: 20 },
            { x: 2480, y: 500, w: 120, h: 20 },
            { x: 3000, y: 500, w: 120, h: 20 },
            { x: 3320, y: 500, w: 120, h: 20 },
            { x: 3740, y: 500, w: 120, h: 20 },
            { x: 4060, y: 500, w: 120, h: 20 },
            { x: 4580, y: 500, w: 120, h: 20 },
            // Platform traps
            { x: 1620, y: 356, w: 40, h: 20 },
            { x: 2740, y: 356, w: 40, h: 20 },
            { x: 3200, y: 356, w: 40, h: 20 },
            { x: 4040, y: 356, w: 40, h: 20 },
        ],
        buttons: [
            // Door 1: 3 buttons
            { id: 'btn1', x: 1575, y: 356, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#ff4757' },
            { id: 'btn2', x: 1695, y: 316, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#ff4757' },
            { id: 'btn3', x: 1815, y: 356, w: 40, h: 24, doorIds: ['door1'], requiredCount: 1, color: '#ff4757' },
            // Door 2: 3 buttons
            { id: 'btn4', x: 2635, y: 356, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#3742fa' },
            { id: 'btn5', x: 2815, y: 316, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#3742fa' },
            { id: 'btn6', x: 2955, y: 356, w: 40, h: 24, doorIds: ['door2'], requiredCount: 1, color: '#3742fa' },
            // Door 3: 2 buttons
            { id: 'btn7', x: 3155, y: 356, w: 40, h: 24, doorIds: ['door3'], requiredCount: 1, color: '#ffa502' },
            { id: 'btn8', x: 3275, y: 316, w: 40, h: 24, doorIds: ['door3'], requiredCount: 1, color: '#ffa502' },
            // Door 4: 3 buttons (final!)
            { id: 'btn9', x: 3895, y: 356, w: 40, h: 24, doorIds: ['door4'], requiredCount: 1, color: '#a855f7' },
            { id: 'btn10', x: 4015, y: 316, w: 40, h: 24, doorIds: ['door4'], requiredCount: 1, color: '#a855f7' },
            { id: 'btn11', x: 4115, y: 356, w: 40, h: 24, doorIds: ['door4'], requiredCount: 1, color: '#a855f7' },
        ],
        doors: [
            { id: 'door1', x: 1860, y: 260, w: 40, h: 260, color: '#ff4757', requiredButtons: 3 },
            { id: 'door2', x: 3000, y: 300, w: 40, h: 220, color: '#3742fa', requiredButtons: 3 },
            { id: 'door3', x: 3320, y: 300, w: 40, h: 220, color: '#ffa502', requiredButtons: 2 },
            { id: 'door4', x: 4580, y: 300, w: 40, h: 220, color: '#a855f7', requiredButtons: 3 },
        ],
        movingPlatforms: [
            { x: 1100, y: 460, w: 70, h: 20, moveX: 0, moveY: -120, speed: 3 },
            { x: 1900, y: 440, w: 80, h: 20, moveX: 200, moveY: 0, speed: 3 },
            { x: 2500, y: 460, w: 70, h: 20, moveX: 0, moveY: -140, speed: 2.5 },
            { x: 3100, y: 450, w: 80, h: 20, moveX: 160, moveY: 0, speed: 3.5 },
            { x: 3800, y: 460, w: 70, h: 20, moveX: 0, moveY: -120, speed: 2 },
            { x: 4600, y: 440, w: 90, h: 20, moveX: 200, moveY: 0, speed: 3 },
        ],
        checkpoints: [
            { id: 1, x: 920, y: 480 },
            { id: 2, x: 1560, y: 480 },
            { id: 3, x: 2620, y: 480 },
            { id: 4, x: 3460, y: 480 },
            { id: 5, x: 4200, y: 480 }
        ],
        finish: { x: 5400, y: 440, w: 80, h: 80 }
    })
};
