const { v4: uuidv4 } = require('uuid');

const PLAYER_COLORS = [
    { name: 'Red', hex: '#FF4757', light: '#FF6B81' },
    { name: 'Blue', hex: '#3742FA', light: '#5352ED' },
    { name: 'Yellow', hex: '#FFA502', light: '#ECCC68' },
    { name: 'Purple', hex: '#A855F7', light: '#C084FC' },
    { name: 'Orange', hex: '#FF6348', light: '#FF7F50' },
    { name: 'Green', hex: '#2ED573', light: '#7BED9F' }
];

class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code;
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));
        return code;
    }

    createRoom(hostId, username, roomName, password, maxPlayers) {
        const code = this.generateRoomCode();
        const colorIndex = 0;
        const room = {
            code,
            name: roomName || 'Unnamed Room',
            password: password || null,
            hostId,
            maxPlayers: Math.min(maxPlayers || 6, 6),
            currentLevel: 1,
            state: 'lobby', // lobby, playing, finished
            players: [{
                id: hostId,
                username,
                isReady: false,
                isAlive: true,
                isFinished: false,
                color: PLAYER_COLORS[colorIndex].hex,
                colorLight: PLAYER_COLORS[colorIndex].light,
                colorName: PLAYER_COLORS[colorIndex].name,
                colorIndex,
                x: 0,
                y: 0,
                score: 0
            }],
            totalDeaths: 0,
            score: 0,
            startTime: null,
            checkpoints: {},
            activeButtons: {},
            createdAt: Date.now()
        };
        this.rooms.set(code, room);
        return room;
    }

    joinRoom(playerId, username, roomCode, password) {
        const room = this.rooms.get(roomCode);
        if (!room) {
            return { success: false, message: 'Room not found' };
        }
        if (room.state === 'playing') {
            return { success: false, message: 'Game already in progress' };
        }
        if (room.players.length >= room.maxPlayers) {
            return { success: false, message: 'Room is full (6/6)' };
        }
        if (room.password && room.password !== password) {
            return { success: false, message: 'Wrong password' };
        }
        if (room.players.find(p => p.id === playerId)) {
            return { success: false, message: 'Already in this room' };
        }

        const colorIndex = room.players.length;
        room.players.push({
            id: playerId,
            username,
            isReady: false,
            isAlive: true,
            isFinished: false,
            color: PLAYER_COLORS[colorIndex].hex,
            colorLight: PLAYER_COLORS[colorIndex].light,
            colorName: PLAYER_COLORS[colorIndex].name,
            colorIndex,
            x: 0,
            y: 0,
            score: 0
        });

        return { success: true };
    }

    findAvailableRoom() {
        for (const [code, room] of this.rooms) {
            if (room.state === 'lobby' && room.players.length < room.maxPlayers && !room.password) {
                return room;
            }
        }
        return null;
    }

    setPlayerReady(roomCode, playerId, ready) {
        const room = this.rooms.get(roomCode);
        if (!room) return;
        const player = room.players.find(p => p.id === playerId);
        if (player) {
            player.isReady = ready;
        }
    }

    removePlayer(roomCode, playerId) {
        const room = this.rooms.get(roomCode);
        if (!room) return;
        room.players = room.players.filter(p => p.id !== playerId);
        if (room.players.length === 0) {
            this.rooms.delete(roomCode);
            return;
        }
        // Transfer host if needed
        if (room.hostId === playerId) {
            room.hostId = room.players[0].id;
        }
    }

    getRoom(roomCode) {
        return this.rooms.get(roomCode);
    }

    getRoomPublicData(roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room) return null;
        return {
            code: room.code,
            name: room.name,
            hostId: room.hostId,
            maxPlayers: room.maxPlayers,
            state: room.state,
            currentLevel: room.currentLevel,
            hasPassword: !!room.password,
            players: room.players.map(p => ({
                id: p.id,
                username: p.username,
                isReady: p.isReady,
                isAlive: p.isAlive,
                isFinished: p.isFinished,
                color: p.color,
                colorLight: p.colorLight,
                colorName: p.colorName,
                colorIndex: p.colorIndex
            }))
        };
    }
}

module.exports = RoomManager;
