// main.js - Homepage logic
const socket = io();

// Particle effect
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 8 + 's';
        p.style.animationDuration = (6 + Math.random() * 6) + 's';
        const colors = ['#ff4757', '#3742fa', '#ffa502', '#a855f7', '#2ed573'];
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.width = (2 + Math.random() * 3) + 'px';
        p.style.height = p.style.width;
        container.appendChild(p);
    }
}
createParticles();

// View management
function hideAll() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('quickPlayView').classList.add('hidden');
    document.getElementById('createRoomView').classList.add('hidden');
    document.getElementById('joinRoomView').classList.add('hidden');
}

function showMainMenu() {
    hideAll();
    document.getElementById('mainMenu').classList.remove('hidden');
}

function showQuickPlay() {
    hideAll();
    document.getElementById('quickPlayView').classList.remove('hidden');
    document.getElementById('qpUsername').focus();
}

function showCreateRoom() {
    hideAll();
    document.getElementById('createRoomView').classList.remove('hidden');
    document.getElementById('crUsername').focus();
}

function showJoinRoom() {
    hideAll();
    document.getElementById('joinRoomView').classList.remove('hidden');
    document.getElementById('jrUsername').focus();
}

// Quick Play
function quickPlay() {
    const username = document.getElementById('qpUsername').value.trim();
    if (!username) {
        alert('Vui lòng nhập tên!');
        return;
    }
    socket.emit('quickPlay', { username }, (response) => {
        if (response.success) {
            sessionStorage.setItem('roomCode', response.room.code);
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('playerId', socket.id);
            window.location.href = '/lobby';
        } else {
            alert(response.message || 'Không thể tham gia!');
        }
    });
}

// Create Room
function createRoom() {
    const username = document.getElementById('crUsername').value.trim();
    const roomName = document.getElementById('crRoomName').value.trim();
    const password = document.getElementById('crPassword').value.trim();

    if (!username) {
        alert('Vui lòng nhập tên!');
        return;
    }

    socket.emit('createRoom', {
        username,
        roomName: roomName || `${username}'s Room`,
        password: password || null,
        maxPlayers: 6
    }, (response) => {
        if (response.success) {
            sessionStorage.setItem('roomCode', response.room.code);
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('playerId', socket.id);
            window.location.href = '/lobby';
        } else {
            alert(response.message || 'Không thể tạo phòng!');
        }
    });
}

// Join Room
function joinRoom() {
    const username = document.getElementById('jrUsername').value.trim();
    const roomCode = document.getElementById('jrRoomCode').value.trim().toUpperCase();
    const password = document.getElementById('jrPassword').value.trim();

    if (!username) { alert('Vui lòng nhập tên!'); return; }
    if (!roomCode || roomCode.length < 4) { alert('Vui lòng nhập mã phòng hợp lệ!'); return; }

    socket.emit('joinRoom', {
        username,
        roomCode,
        password: password || null
    }, (response) => {
        if (response.success) {
            sessionStorage.setItem('roomCode', response.room.code);
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('playerId', socket.id);
            window.location.href = '/lobby';
        } else {
            alert(response.message || 'Không thể tham gia phòng!');
        }
    });
}

// Enter key support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const qp = document.getElementById('quickPlayView');
        const cr = document.getElementById('createRoomView');
        const jr = document.getElementById('joinRoomView');
        if (!qp.classList.contains('hidden')) quickPlay();
        else if (!cr.classList.contains('hidden')) createRoom();
        else if (!jr.classList.contains('hidden')) joinRoom();
    }
});
