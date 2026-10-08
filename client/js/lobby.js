// lobby.js - Lobby page logic
const socket = io();
let roomCode = sessionStorage.getItem('roomCode');
let username = sessionStorage.getItem('username');
let isReady = false;
let isHost = false;
let currentRoom = null;

if (!roomCode || !username) {
    window.location.href = '/';
}

// Re-join room after page navigation
socket.emit('joinRoom', {
    username,
    roomCode,
    password: null
}, (response) => {
    if (response.success) {
        sessionStorage.setItem('playerId', socket.id);
        updateLobby(response.room);
    } else {
        // Might already be in room, try creating
        alert('Không thể kết nối lại phòng. Quay về trang chủ.');
        window.location.href = '/';
    }
});

function updateLobby(room) {
    currentRoom = room;
    document.getElementById('roomCode').textContent = room.code;
    document.getElementById('roomName').textContent = room.name;
    document.getElementById('playerCount').textContent = room.players.length;
    document.getElementById('maxPlayers').textContent = room.maxPlayers;

    isHost = room.hostId === socket.id;

    // Player list
    const list = document.getElementById('playerList');
    list.innerHTML = '';
    room.players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'player-item';
        const isMe = player.id === socket.id;
        li.innerHTML = `
            <div class="player-avatar" style="background: ${player.color};">${player.username.charAt(0).toUpperCase()}</div>
            <span class="player-name">${player.username}${isMe ? ' (Bạn)' : ''}</span>
            ${player.id === room.hostId ? '<span class="player-host-badge">HOST</span>' : ''}
            <span class="player-status ${player.isReady ? 'status-ready' : 'status-not-ready'}">
                ${player.isReady ? '✓ READY' : '⏳ NOT READY'}
            </span>
        `;
        list.appendChild(li);
    });

    // Show/hide start button
    const startBtn = document.getElementById('startBtn');
    if (isHost) {
        startBtn.classList.remove('hidden');
    } else {
        startBtn.classList.add('hidden');
    }

    // Update status
    const status = document.getElementById('lobbyStatus');
    const allReady = room.players.every(p => p.isReady);
    if (isHost) {
        if (room.players.length < 1) {
            status.textContent = 'Chờ thêm người chơi...';
        } else if (!allReady && room.players.length > 1) {
            status.textContent = 'Chờ tất cả người chơi sẵn sàng...';
        } else {
            status.textContent = 'Bạn là chủ phòng. Nhấn BẮT ĐẦU khi sẵn sàng!';
        }
    } else {
        status.textContent = 'Chờ chủ phòng bắt đầu game...';
    }
}

function toggleReady() {
    isReady = !isReady;
    const btn = document.getElementById('readyBtn');
    if (isReady) {
        btn.textContent = '❌ HỦY SẴN SÀNG';
        btn.className = 'btn btn-danger btn-lg';
    } else {
        btn.textContent = '✋ SẴN SÀNG';
        btn.className = 'btn btn-success btn-lg';
    }
    socket.emit('playerReady', { ready: isReady });
}

function startGame() {
    socket.emit('startGame');
}

function leaveRoom() {
    socket.emit('leaveRoom');
    sessionStorage.removeItem('roomCode');
    window.location.href = '/';
}

function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
        const el = document.getElementById('roomCodeDisplay');
        const hint = el.querySelector('.copy-hint');
        hint.textContent = '✓ Đã sao chép!';
        hint.style.color = '#2ed573';
        setTimeout(() => {
            hint.textContent = 'Click để sao chép mã phòng';
            hint.style.color = '';
        }, 2000);
    }).catch(() => {});
}

// Chat
function sendLobbyChat() {
    const input = document.getElementById('lobbyChatInput');
    const msg = input.value.trim();
    if (!msg) return;
    socket.emit('chatMessage', { message: msg });
    input.value = '';
}

document.getElementById('lobbyChatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendLobbyChat();
});

// Socket events
socket.on('roomUpdate', (room) => {
    updateLobby(room);
});

socket.on('gameStart', (data) => {
    sessionStorage.setItem('gameData', JSON.stringify(data));
    sessionStorage.setItem('playerId', socket.id);
    window.location.href = '/game';
});

socket.on('playerLeft', (data) => {
    addChatMessage(null, `${data.username} đã rời phòng`, true);
});

socket.on('chatMessage', (data) => {
    addChatMessage(data.username, data.message);
});

socket.on('error', (data) => {
    alert(data.message);
});

function addChatMessage(user, text, isSystem = false) {
    const container = document.getElementById('lobbyChatMessages');
    const div = document.createElement('div');
    div.className = 'chat-message' + (isSystem ? ' system-msg' : '');
    if (isSystem) {
        div.textContent = text;
    } else {
        div.innerHTML = `<span class="msg-user" style="color: var(--accent);">${user}:</span> <span class="msg-text">${escapeHtml(text)}</span>`;
    }
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
