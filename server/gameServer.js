class GameServer {
    constructor(io, roomManager) {
        this.io = io;
        this.roomManager = roomManager;
        this.gameStates = new Map();
    }

    startGame(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return;

        room.state = 'playing';
        room.startTime = Date.now();
        room.totalDeaths = 0;
        room.score = 0;

        // Reset all players
        room.players.forEach(p => {
            p.isAlive = true;
            p.isFinished = false;
            p.x = 100;
            p.y = 300;
        });

        // Initialize game state for this room
        this.gameStates.set(roomCode, {
            activeCheckpoint: 0,
            activeButtons: {},
            doorStates: {},
            playerFinished: new Set(),
            level: room.currentLevel || 1
        });
    }

    handlePlayerMove(roomCode, playerId, data) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return;
        const player = room.players.find(p => p.id === playerId);
        if (player) {
            player.x = data.x;
            player.y = data.y;
        }
    }

    handlePlayerDeath(roomCode, playerId) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return;
        const player = room.players.find(p => p.id === playerId);
        if (player) {
            player.isAlive = false;
            room.totalDeaths = (room.totalDeaths || 0) + 1;
        }
    }

    handlePlayerRespawn(roomCode, playerId) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return null;
        const player = room.players.find(p => p.id === playerId);
        const state = this.gameStates.get(roomCode);
        if (player) {
            player.isAlive = true;
            player.isFinished = false;
        }
        return state ? state.activeCheckpoint : 0;
    }

    handleCheckpoint(roomCode, playerId, checkpointId) {
        const state = this.gameStates.get(roomCode);
        if (!state) return;
        if (checkpointId > state.activeCheckpoint) {
            state.activeCheckpoint = checkpointId;
        }
    }

    handleButton(roomCode, playerId, buttonId, activated) {
        const state = this.gameStates.get(roomCode);
        if (!state) return null;

        if (activated) {
            if (!state.activeButtons[buttonId]) {
                state.activeButtons[buttonId] = new Set();
            }
            state.activeButtons[buttonId].add(playerId);
        } else {
            if (state.activeButtons[buttonId]) {
                state.activeButtons[buttonId].delete(playerId);
            }
        }

        // Calculate door states
        const doorStates = {};
        // This will be computed client-side based on level data
        return { doorStates };
    }

    handlePlayerFinish(roomCode, playerId) {
        const room = this.roomManager.getRoom(roomCode);
        const state = this.gameStates.get(roomCode);
        if (!room || !state) return;
        const player = room.players.find(p => p.id === playerId);
        if (player) {
            player.isFinished = true;
            state.playerFinished.add(playerId);
        }
    }

    isTeamDead(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return false;
        return room.players.every(p => !p.isAlive);
    }

    isLevelComplete(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return false;
        // All alive players must be finished
        const alivePlayers = room.players.filter(p => p.isAlive);
        return alivePlayers.length > 0 && alivePlayers.every(p => p.isFinished);
    }

    getLevelStats(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return {};
        const elapsed = Date.now() - (room.startTime || Date.now());
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return {
            level: room.currentLevel || 1,
            deaths: room.totalDeaths || 0,
            time: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            timeMs: elapsed,
            score: Math.max(0, 10000 - (room.totalDeaths * 200) - Math.floor(elapsed / 1000) * 10),
            playersFinished: room.players.filter(p => p.isFinished).length,
            totalPlayers: room.players.length
        };
    }

    getGameStats(roomCode) {
        const room = this.roomManager.getRoom(roomCode);
        if (!room) return {};
        return {
            totalDeaths: room.totalDeaths || 0,
            totalScore: room.score || 0,
            levelsCompleted: room.currentLevel || 1
        };
    }
}

module.exports = GameServer;
