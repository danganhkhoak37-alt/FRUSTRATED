const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RoomManager = require('./roomManager');
const GameServer = require('./gameServer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'client')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.get('/lobby', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'lobby.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'game.html'));
});

app.get('/guide', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'guide.html'));
});

// Initialize managers
const roomManager = new RoomManager();
const gameServer = new GameServer(io, roomManager);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`[CONNECT] Player connected: ${socket.id}`);

    // --- ROOM MANAGEMENT ---
    socket.on('createRoom', (data, callback) => {
        const { username, roomName, password, maxPlayers } = data;
        const room = roomManager.createRoom(socket.id, username, roomName, password, maxPlayers);
        if (room) {
            socket.join(room.code);
            socket.roomCode = room.code;
            socket.username = username;
            console.log(`[ROOM] ${username} created room ${room.code}`);
            callback({ success: true, room: roomManager.getRoomPublicData(room.code) });
        } else {
            callback({ success: false, message: 'Failed to create room' });
        }
    });

    socket.on('joinRoom', (data, callback) => {
        const { username, roomCode, password } = data;
        const result = roomManager.joinRoom(socket.id, username, roomCode, password);
        if (result.success) {
            socket.join(roomCode);
            socket.roomCode = roomCode;
            socket.username = username;
            console.log(`[ROOM] ${username} joined room ${roomCode}`);
            io.to(roomCode).emit('roomUpdate', roomManager.getRoomPublicData(roomCode));
            callback({ success: true, room: roomManager.getRoomPublicData(roomCode) });
        } else {
            callback({ success: false, message: result.message });
        }
    });

    socket.on('quickPlay', (data, callback) => {
        const { username } = data;
        // Find an available room or create one
        let room = roomManager.findAvailableRoom();
        if (room) {
            const result = roomManager.joinRoom(socket.id, username, room.code);
            if (result.success) {
                socket.join(room.code);
                socket.roomCode = room.code;
                socket.username = username;
                io.to(room.code).emit('roomUpdate', roomManager.getRoomPublicData(room.code));
                callback({ success: true, room: roomManager.getRoomPublicData(room.code) });
                return;
            }
        }
        // Create new room
        room = roomManager.createRoom(socket.id, username, `${username}'s Room`, null, 6);
        if (room) {
            socket.join(room.code);
            socket.roomCode = room.code;
            socket.username = username;
            callback({ success: true, room: roomManager.getRoomPublicData(room.code) });
        } else {
            callback({ success: false, message: 'Failed to find or create room' });
        }
    });

    socket.on('playerReady', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        roomManager.setPlayerReady(roomCode, socket.id, data.ready);
        io.to(roomCode).emit('roomUpdate', roomManager.getRoomPublicData(roomCode));
    });

    socket.on('startGame', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        const room = roomManager.getRoom(roomCode);
        if (!room) return;
        if (room.hostId !== socket.id) {
            socket.emit('error', { message: 'Only the host can start the game' });
            return;
        }
        // Check if all players are ready
        const allReady = room.players.every(p => p.isReady);
        if (!allReady && room.players.length > 1) {
            socket.emit('error', { message: 'Not all players are ready' });
            return;
        }
        console.log(`[GAME] Starting game in room ${roomCode}`);
        gameServer.startGame(roomCode);
        io.to(roomCode).emit('gameStart', {
            level: room.currentLevel || 1,
            players: room.players.map(p => ({
                id: p.id,
                username: p.username,
                color: p.color,
                colorIndex: p.colorIndex
            }))
        });
    });

    // --- GAME EVENTS ---
    socket.on('playerMove', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        gameServer.handlePlayerMove(roomCode, socket.id, data);
        socket.to(roomCode).emit('playerMoved', {
            id: socket.id,
            ...data
        });
    });

    socket.on('playerJump', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        socket.to(roomCode).emit('playerJumped', { id: socket.id });
    });

    socket.on('playerDeath', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        gameServer.handlePlayerDeath(roomCode, socket.id);
        io.to(roomCode).emit('playerDied', {
            id: socket.id,
            username: socket.username
        });
        // Check if all players are dead
        const room = roomManager.getRoom(roomCode);
        if (room && gameServer.isTeamDead(roomCode)) {
            io.to(roomCode).emit('teamDefeated', {
                deaths: room.totalDeaths || 0,
                score: room.score || 0
            });
        }
    });

    socket.on('playerRespawn', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        const checkpoint = gameServer.handlePlayerRespawn(roomCode, socket.id);
        io.to(roomCode).emit('playerRespawned', {
            id: socket.id,
            checkpoint: checkpoint
        });
    });

    socket.on('reachCheckpoint', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        gameServer.handleCheckpoint(roomCode, socket.id, data.checkpointId);
        io.to(roomCode).emit('checkpointReached', {
            id: socket.id,
            checkpointId: data.checkpointId,
            username: socket.username
        });
    });

    socket.on('buttonActivated', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        const result = gameServer.handleButton(roomCode, socket.id, data.buttonId, data.activated);
        io.to(roomCode).emit('buttonStateChanged', {
            buttonId: data.buttonId,
            activated: data.activated,
            playerId: socket.id,
            doorStates: result ? result.doorStates : {}
        });
    });

    socket.on('reachFinish', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        gameServer.handlePlayerFinish(roomCode, socket.id);
        io.to(roomCode).emit('playerFinished', {
            id: socket.id,
            username: socket.username
        });
        // Check if all alive players finished
        if (gameServer.isLevelComplete(roomCode)) {
            const room = roomManager.getRoom(roomCode);
            const stats = gameServer.getLevelStats(roomCode);
            io.to(roomCode).emit('levelComplete', stats);
        }
    });

    socket.on('nextLevel', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        const room = roomManager.getRoom(roomCode);
        if (!room || room.hostId !== socket.id) return;
        const nextLevel = (room.currentLevel || 1) + 1;
        if (nextLevel > 5) {
            io.to(roomCode).emit('gameComplete', gameServer.getGameStats(roomCode));
            return;
        }
        room.currentLevel = nextLevel;
        gameServer.startGame(roomCode);
        io.to(roomCode).emit('gameStart', {
            level: nextLevel,
            players: room.players.map(p => ({
                id: p.id,
                username: p.username,
                color: p.color,
                colorIndex: p.colorIndex
            }))
        });
    });

    socket.on('retryLevel', () => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        const room = roomManager.getRoom(roomCode);
        if (!room || room.hostId !== socket.id) return;
        gameServer.startGame(roomCode);
        io.to(roomCode).emit('gameStart', {
            level: room.currentLevel || 1,
            players: room.players.map(p => ({
                id: p.id,
                username: p.username,
                color: p.color,
                colorIndex: p.colorIndex
            }))
        });
    });

    // --- CHAT ---
    socket.on('chatMessage', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;
        io.to(roomCode).emit('chatMessage', {
            username: socket.username,
            message: data.message,
            timestamp: Date.now()
        });
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
        const roomCode = socket.roomCode;
        if (roomCode) {
            const room = roomManager.getRoom(roomCode);
            const wasHost = room && room.hostId === socket.id;
            roomManager.removePlayer(roomCode, socket.id);
            const updatedRoom = roomManager.getRoom(roomCode);
            if (updatedRoom) {
                io.to(roomCode).emit('playerLeft', {
                    id: socket.id,
                    username: socket.username,
                    newHost: wasHost ? updatedRoom.hostId : null
                });
                io.to(roomCode).emit('roomUpdate', roomManager.getRoomPublicData(roomCode));
            }
        }
        console.log(`[DISCONNECT] Player disconnected: ${socket.id}`);
    });

    socket.on('leaveRoom', () => {
        const roomCode = socket.roomCode;
        if (roomCode) {
            const room = roomManager.getRoom(roomCode);
            const wasHost = room && room.hostId === socket.id;
            roomManager.removePlayer(roomCode, socket.id);
            socket.leave(roomCode);
            const updatedRoom = roomManager.getRoom(roomCode);
            if (updatedRoom) {
                io.to(roomCode).emit('playerLeft', {
                    id: socket.id,
                    username: socket.username,
                    newHost: wasHost ? updatedRoom.hostId : null
                });
                io.to(roomCode).emit('roomUpdate', roomManager.getRoomPublicData(roomCode));
            }
            socket.roomCode = null;
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║            F R U S T R A T E D           ║
║                                          ║
║    "Can You Keep Your Team Together?"    ║
║                                          ║
║    Server running on port ${PORT}           ║
║    http://localhost:${PORT}                  ║
║                                          ║
╚══════════════════════════════════════════╝
    `);
});
