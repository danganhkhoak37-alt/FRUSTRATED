// game.js - Main game loop, multiplayer sync, and game state management

// ========== INITIALIZATION ==========
let socket = null;
try {
    socket = typeof io !== 'undefined' ? io() : null;
} catch (e) {
    console.warn('Socket error:', e);
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let roomCode = sessionStorage.getItem('roomCode') || 'SOLO01';
let username = sessionStorage.getItem('username') || 'Player';
let localPlayerId = sessionStorage.getItem('playerId') || 'local_p1';

// ========== GAME STATE ==========
let gameState = {
    level: 1,
    players: {},
    localPlayer: null,
    currentLevel: null,
    camera: { x: 0, y: 0 },
    keys: { left: false, right: false, jump: false },
    totalDeaths: 0,
    startTime: Date.now(),
    activeCheckpoint: 0,
    buttonStates: {},
    doorStates: {},
    isPlaying: false,
    isPaused: false
};

const renderer = new ObstacleRenderer(ctx);

// ========== CANVAS SETUP ==========
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 50; // Account for HUD
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========== REJOIN & START ==========
if (socket && socket.connected) {
    socket.emit('joinRoom', { username, roomCode, password: null }, (response) => {
        if (response && response.success) {
            localPlayerId = socket.id;
            sessionStorage.setItem('playerId', socket.id);

            const gameData = JSON.parse(sessionStorage.getItem('gameData') || '{}');
            initGame(gameData.level || 1, gameData.players || []);
        } else {
            const gameData = JSON.parse(sessionStorage.getItem('gameData') || '{}');
            localPlayerId = socket.id;
            initGame(gameData.level || 1, gameData.players || []);
        }
    });
} else {
    // Offline or direct mode
    const gameData = JSON.parse(sessionStorage.getItem('gameData') || '{}');
    initGame(gameData.level || 1, gameData.players || []);
}

function initGame(level, playersData) {
    gameState.level = level;
    gameState.currentLevel = JSON.parse(JSON.stringify(LEVELS[level] || LEVELS[1]));
    gameState.startTime = Date.now();
    gameState.totalDeaths = 0;
    gameState.activeCheckpoint = 0;
    gameState.buttonStates = {};
    gameState.doorStates = {};
    gameState.isPlaying = true;

    // Initialize doors as closed
    for (const door of gameState.currentLevel.doors) {
        door.isOpen = false;
        gameState.doorStates[door.id] = false;
    }

    // Initialize moving platforms
    gameState.currentLevel._movingPlatforms = gameState.currentLevel.movingPlatforms.map(mp => ({
        ...mp,
        currentX: mp.x,
        currentY: mp.y,
        startX: mp.x,
        startY: mp.y,
        direction: 1,
        dx: 0,
        dy: 0
    }));

    // Create players
    gameState.players = {};
    const spawnX = gameState.currentLevel.spawnX;
    const spawnY = gameState.currentLevel.spawnY;

    if (playersData && playersData.length > 0) {
        for (const pd of playersData) {
            const isLocal = pd.id === (socket ? socket.id : localPlayerId);
            const player = new Player(pd.id, pd.username, pd.color, pd.colorIndex, isLocal);
            player.x = spawnX + Math.random() * 40;
            player.y = spawnY;
            player.targetX = player.x;
            player.targetY = player.y;
            gameState.players[pd.id] = player;
            if (isLocal) {
                gameState.localPlayer = player;
            }
        }
    }

    // If local player not found in data, create one
    if (!gameState.localPlayer) {
        const id = socket ? socket.id : localPlayerId;
        const player = new Player(id, username, '#ff4757', 0, true);
        player.x = spawnX;
        player.y = spawnY;
        gameState.players[id] = player;
        gameState.localPlayer = player;
    }

    // Update HUD
    document.getElementById('hudLevel').textContent = `LEVEL ${level} - ${LEVEL_NAMES[level - 1] || ''}`;

    // Hide all overlays
    hideOverlay('deathOverlay');
    hideOverlay('teamDefeatedOverlay');
    hideOverlay('levelCompleteOverlay');
    hideOverlay('gameCompleteOverlay');

    showToast(`LEVEL ${level}: ${LEVEL_NAMES[level - 1]}`, true);

    // Start game loop
    if (!gameState._loopStarted) {
        gameState._loopStarted = true;
        gameLoop();
    }
}

// ========== INPUT ==========
const keyMap = {
    'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
    'ArrowRight': 'right', 'd': 'right', 'D': 'right',
    ' ': 'jump', 'ArrowUp': 'jump', 'w': 'jump', 'W': 'jump'
};

document.addEventListener('keydown', (e) => {
    const action = keyMap[e.key];
    if (action) {
        e.preventDefault();
        gameState.keys[action] = true;
    }
    if (e.key === 'r' || e.key === 'R') {
        respawn();
    }
    if (e.key === 'Enter') {
        const chatInput = document.getElementById('chatInput');
        if (document.activeElement !== chatInput) {
            chatInput.focus();
        } else {
            sendChat();
            chatInput.blur();
        }
    }
    // Prevent space scrolling
    if (e.key === ' ' && document.activeElement !== document.getElementById('chatInput')) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    const action = keyMap[e.key];
    if (action) {
        gameState.keys[action] = false;
    }
});

// Mobile input
function mobileInput(action, pressed) {
    gameState.keys[action] = pressed;
}

// ========== GAME LOOP ==========
let lastSendTime = 0;
const SEND_RATE = 1000 / 30; // 30 times per second

function gameLoop() {
    if (!gameState.isPlaying) {
        requestAnimationFrame(gameLoop);
        return;
    }

    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    const level = gameState.currentLevel;
    if (!level) return;

    // Update moving platforms
    updateMovingPlatforms(level);

    // Update all players
    for (const id in gameState.players) {
        const player = gameState.players[id];
        player.update(level, player.isLocal ? gameState.keys : {}, gameState.players);
    }

    // Local player specific
    const lp = gameState.localPlayer;
    if (lp && lp.isAlive) {
        // Check buttons
        const prevButton = lp._prevButton;
        if (lp.onButton !== prevButton) {
            if (prevButton) {
                if (socket) socket.emit('buttonActivated', { buttonId: prevButton, activated: false });
                gameState.buttonStates[prevButton] = false;
            }
            if (lp.onButton) {
                if (socket) socket.emit('buttonActivated', { buttonId: lp.onButton, activated: true });
                gameState.buttonStates[lp.onButton] = true;
            }
            lp._prevButton = lp.onButton;
            updateDoorStates();
        }

        // Check checkpoints
        for (const cp of level.checkpoints) {
            if (lp.collidesWithRect(cp.x - 10, cp.y - 40, 40, 60)) {
                if (cp.id > gameState.activeCheckpoint) {
                    gameState.activeCheckpoint = cp.id;
                    if (socket) socket.emit('reachCheckpoint', { checkpointId: cp.id });
                    showToast(`⭐ Checkpoint ${cp.id}!`);
                }
            }
        }

        // Check finish
        const finish = level.finish;
        if (!lp.isFinished && lp.collidesWithRect(finish.x, finish.y, finish.w, finish.h)) {
            lp.isFinished = true;
            if (socket) {
                socket.emit('reachFinish');
            } else {
                // Solo mode finish
                document.getElementById('lcScore').textContent = 1000;
                document.getElementById('lcTime').textContent = document.getElementById('hudTime').textContent;
                document.getElementById('lcDeaths').textContent = gameState.totalDeaths;
                showOverlay('levelCompleteOverlay');
            }
            showToast('🏁 Bạn đã đến đích!', true);
        }

        // Send position to server
        const now = Date.now();
        if (now - lastSendTime > SEND_RATE) {
            if (socket) {
                socket.emit('playerMove', {
                    x: lp.x,
                    y: lp.y,
                    vx: lp.vx,
                    vy: lp.vy,
                    facingRight: lp.facingRight,
                    isGrounded: lp.isGrounded,
                    isJumping: lp.isJumping
                });
            }
            lastSendTime = now;
        }
    }

    // Update camera
    updateCamera();

    // Update HUD
    updateHUD();

    // Update renderer
    renderer.update();
}

function updateMovingPlatforms(level) {
    if (!level._movingPlatforms) return;
    for (const mp of level._movingPlatforms) {
        const prevX = mp.currentX;
        const prevY = mp.currentY;

        if (mp.moveX) {
            mp.currentX += mp.speed * mp.direction;
            if (mp.currentX > mp.startX + mp.moveX || mp.currentX < mp.startX) {
                mp.direction *= -1;
            }
        }
        if (mp.moveY) {
            mp.currentY += mp.speed * mp.direction;
            if (mp.currentY > mp.startY || mp.currentY < mp.startY + mp.moveY) {
                mp.direction *= -1;
            }
        }

        mp.dx = mp.currentX - prevX;
        mp.dy = mp.currentY - prevY;
    }
}

function updateDoorStates() {
    const level = gameState.currentLevel;
    if (!level) return;

    for (const door of level.doors) {
        const requiredButtons = door.requiredButtons || 1;
        let activatedCount = 0;
        for (const btn of level.buttons) {
            if (btn.doorIds && btn.doorIds.includes(door.id)) {
                if (gameState.buttonStates[btn.id]) {
                    activatedCount++;
                }
            }
        }
        door.isOpen = activatedCount >= requiredButtons;
        gameState.doorStates[door.id] = door.isOpen;
    }
}

function updateCamera() {
    const lp = gameState.localPlayer;
    if (!lp) return;
    const level = gameState.currentLevel;
    if (!level) return;

    const targetX = lp.x - canvas.width / 2 + lp.width / 2;
    const targetY = lp.y - canvas.height / 2 + lp.height / 2;

    gameState.camera.x += (targetX - gameState.camera.x) * 0.1;
    gameState.camera.y += (targetY - gameState.camera.y) * 0.1;

    // Clamp camera
    gameState.camera.x = Math.max(0, Math.min(level.width - canvas.width, gameState.camera.x));
    gameState.camera.y = Math.max(0, Math.min(level.height - canvas.height, gameState.camera.y));
}

function updateHUD() {
    const players = Object.values(gameState.players);
    const alive = players.filter(p => p.isAlive).length;
    document.getElementById('hudAlive').textContent = `${alive}/${players.length}`;
    document.getElementById('hudDeaths').textContent = gameState.totalDeaths;

    const elapsed = Date.now() - gameState.startTime;
    const min = String(Math.floor(elapsed / 60000)).padStart(2, '0');
    const sec = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
    document.getElementById('hudTime').textContent = `${min}:${sec}`;

    // Update team sidebar
    const teamList = document.getElementById('teamList');
    teamList.innerHTML = '';
    for (const p of players) {
        const div = document.createElement('div');
        div.className = 'team-member';
        let status, statusClass, dotColor;
        if (p.isFinished) {
            status = '🏁 FINISH';
            statusClass = 'status-finished';
            dotColor = '#ffa502';
        } else if (!p.isAlive) {
            status = 'DEAD';
            statusClass = 'status-dead';
            dotColor = '#ff4757';
        } else {
            status = 'ALIVE';
            statusClass = 'status-alive';
            dotColor = '#2ed573';
        }
        div.innerHTML = `
            <span class="team-dot" style="background: ${dotColor};"></span>
            <span class="team-member-name" style="color: ${p.color};">${p.username}</span>
            <span class="team-member-status ${statusClass}">${status}</span>
        `;
        teamList.appendChild(div);
    }
}

// ========== RENDER ==========
function render() {
    const level = gameState.currentLevel;
    if (!level) return;

    const cx = gameState.camera.x;
    const cy = gameState.camera.y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    renderer.drawBackground(level, canvas.width, canvas.height, cx, cy);

    // Level messages
    renderer.drawLevelMessages(level, gameState.level, cx, cy, canvas.width);

    // Platforms
    for (const plat of level.platforms) {
        renderer.drawPlatform(plat, cx, cy);
    }

    // Moving platforms
    if (level._movingPlatforms) {
        for (const mp of level._movingPlatforms) {
            renderer.drawMovingPlatform(mp, cx, cy);
        }
    }

    // Spikes
    for (const spike of level.spikes) {
        renderer.drawSpike(spike, cx, cy);
    }

    // Buttons
    for (const btn of level.buttons) {
        renderer.drawButton(btn, !!gameState.buttonStates[btn.id], cx, cy);
    }

    // Doors
    for (const door of level.doors) {
        renderer.drawDoor(door, door.isOpen, cx, cy);
    }

    // Checkpoints
    for (const cp of level.checkpoints) {
        renderer.drawCheckpoint(cp, cp.id <= gameState.activeCheckpoint, cx, cy);
    }

    // Finish
    if (level.finish) {
        renderer.drawFinish(level.finish, cx, cy);
    }

    // Players (draw remote first, local last)
    const sortedPlayers = Object.values(gameState.players).sort((a, b) => {
        if (a.isLocal) return 1;
        if (b.isLocal) return -1;
        return 0;
    });
    for (const player of sortedPlayers) {
        player.draw(ctx, cx, cy);
    }
}

// ========== MULTIPLAYER EVENTS ==========
if (socket) {
    socket.on('playerMoved', (data) => {
        const player = gameState.players[data.id];
        if (player && !player.isLocal) {
            player.targetX = data.x;
            player.targetY = data.y;
            player.vx = data.vx || 0;
            player.vy = data.vy || 0;
            player.facingRight = data.facingRight;
            player.isGrounded = data.isGrounded;
            player.isJumping = data.isJumping;
        }
    });

    socket.on('playerJumped', (data) => {
        const player = gameState.players[data.id];
        if (player) {
            player.isJumping = true;
        }
    });

    socket.on('playerDied', (data) => {
        const player = gameState.players[data.id];
        if (player) {
            player.die();
            gameState.totalDeaths++;
            showToast(`💀 ${data.username} đã chết!`);

            const messages = [
                "FRUSTRATED?",
                "TRY AGAIN!",
                "ALMOST!",
                "WHO DID THAT?!",
                "DON'T GIVE UP!",
                "TEAMWORK!",
                "WAIT FOR YOUR TEAM!",
                "YOU LEFT YOUR FRIEND BEHIND!"
            ];
            if (Math.random() < 0.4) {
                setTimeout(() => {
                    showToast(messages[Math.floor(Math.random() * messages.length)], true);
                }, 800);
            }
        }
    });

    socket.on('playerRespawned', (data) => {
        const player = gameState.players[data.id];
        if (player) {
            const cpId = data.checkpoint || gameState.activeCheckpoint;
            const level = gameState.currentLevel;
            let spawnX = level.spawnX;
            let spawnY = level.spawnY;

            if (cpId > 0 && level.checkpoints) {
                const cp = level.checkpoints.find(c => c.id === cpId);
                if (cp) {
                    spawnX = cp.x;
                    spawnY = cp.y;
                }
            }
            player.respawn(spawnX, spawnY);
        }
    });

    socket.on('checkpointReached', (data) => {
        if (data.checkpointId > gameState.activeCheckpoint) {
            gameState.activeCheckpoint = data.checkpointId;
        }
    });

    socket.on('buttonStateChanged', (data) => {
        gameState.buttonStates[data.buttonId] = data.activated;
        updateDoorStates();
    });

    socket.on('playerFinished', (data) => {
        const player = gameState.players[data.id];
        if (player) {
            player.isFinished = true;
            if (!player.isLocal) {
                showToast(`🏁 ${data.username} đến đích!`);
            }
        }
    });

    socket.on('teamDefeated', (data) => {
        document.getElementById('goDeaths').textContent = data.deaths || gameState.totalDeaths;
        document.getElementById('goScore').textContent = data.score || 0;
        showOverlay('teamDefeatedOverlay');
        showToast('GAME OVER - CẢ ĐỘI THẤT BẠI!', true);
    });

    socket.on('levelComplete', (data) => {
        document.getElementById('lcScore').textContent = data.score || 0;
        document.getElementById('lcTime').textContent = data.time || '00:00';
        document.getElementById('lcDeaths').textContent = data.deaths || 0;

        if (gameState.level >= 5) {
            document.getElementById('nextLevelBtn').classList.add('hidden');
        }

        showOverlay('levelCompleteOverlay');
        showToast('🏆 LEVEL COMPLETE!', true);
    });

    socket.on('gameComplete', (data) => {
        showOverlay('gameCompleteOverlay');
    });

    socket.on('gameStart', (data) => {
        initGame(data.level, data.players);
    });

    socket.on('playerLeft', (data) => {
        delete gameState.players[data.id];
        showToast(`${data.username} đã rời phòng`);
    });

    socket.on('chatMessage', (data) => {
        addChatMessage(data.username, data.message);
    });
}

// ========== GAME ACTIONS ==========
function respawn() {
    const lp = gameState.localPlayer;
    if (!lp || lp.isAlive) return;

    if (socket) socket.emit('playerRespawn');
    const level = gameState.currentLevel;
    let spawnX = level.spawnX;
    let spawnY = level.spawnY;

    if (gameState.activeCheckpoint > 0) {
        const cp = level.checkpoints.find(c => c.id === gameState.activeCheckpoint);
        if (cp) {
            spawnX = cp.x;
            spawnY = cp.y;
        }
    }
    lp.respawn(spawnX, spawnY);
    hideOverlay('deathOverlay');
}

function retryLevel() {
    if (socket) {
        socket.emit('retryLevel');
    } else {
        initGame(gameState.level, []);
    }
}

function nextLevel() {
    if (socket) {
        socket.emit('nextLevel');
    } else {
        const next = Math.min(5, gameState.level + 1);
        initGame(next, []);
    }
}

function backToMenu() {
    if (socket) socket.emit('leaveRoom');
    sessionStorage.removeItem('roomCode');
    sessionStorage.removeItem('gameData');
    window.location.href = './index.html';
}

// ========== LOCAL DEATH ==========
const originalPlayerUpdate = Player.prototype.update;
Player.prototype.update = function(level, keys, allPlayers) {
    const wasAlive = this.isAlive;
    originalPlayerUpdate.call(this, level, keys, allPlayers);
    if (wasAlive && !this.isAlive && this.isLocal) {
        if (socket) socket.emit('playerDeath', {});
        gameState.totalDeaths++;
        setTimeout(() => {
            if (!gameState.localPlayer.isAlive) {
                showOverlay('deathOverlay');
            }
        }, 500);
    }
};

// ========== UI HELPERS ==========
function showOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function hideOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

function showToast(text, isRage = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast' + (isRage ? ' toast-rage' : '');
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ========== CHAT ==========
function toggleChat() {
    const container = document.getElementById('chatContainer');
    if (!container) return;
    container.classList.toggle('minimized');
    const toggle = document.getElementById('chatToggle');
    if (toggle) toggle.textContent = container.classList.contains('minimized') ? '+' : '−';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    if (socket) {
        socket.emit('chatMessage', { message: msg });
    } else {
        addChatMessage(username, msg);
    }
    input.value = '';
}

const gameChatInput = document.getElementById('chatInput');
if (gameChatInput) {
    gameChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            sendChat();
        }
        e.stopPropagation();
    });
}

function addChatMessage(user, text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-message';
    const player = Object.values(gameState.players).find(p => p.username === user);
    const color = player ? player.color : 'var(--accent)';
    div.innerHTML = `<span class="msg-user" style="color: ${color};">${user}:</span> <span class="msg-text">${escapeHtml(text)}</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
