// obstacle.js - Obstacle rendering and drawing utilities

class ObstacleRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.time = 0;
    }

    update() {
        this.time++;
    }

    drawPlatform(plat, cameraX, cameraY) {
        const ctx = this.ctx;
        const x = plat.x - cameraX;
        const y = plat.y - cameraY;
        const w = plat.w;
        const h = plat.h;

        // Platform body
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, '#2a2a5a');
        gradient.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);

        // Top edge (grass-like)
        ctx.fillStyle = '#3a3a7a';
        ctx.fillRect(x, y, w, 3);

        // Grid lines on platform
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let gx = x; gx < x + w; gx += 40) {
            ctx.beginPath();
            ctx.moveTo(gx, y);
            ctx.lineTo(gx, y + h);
            ctx.stroke();
        }
        for (let gy = y; gy < y + h; gy += 40) {
            ctx.beginPath();
            ctx.moveTo(x, gy);
            ctx.lineTo(x + w, gy);
            ctx.stroke();
        }

        // Left/right edge highlight
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x, y, 2, h);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + w - 2, y, 2, h);
    }

    drawSpike(spike, cameraX, cameraY) {
        const ctx = this.ctx;
        const x = spike.x - cameraX;
        const y = spike.y - cameraY;
        const w = spike.w;
        const h = spike.h;
        const spikeCount = Math.floor(w / 16);
        const spikeW = w / spikeCount;

        for (let i = 0; i < spikeCount; i++) {
            const sx = x + i * spikeW;
            const pulse = Math.sin(this.time * 0.05 + i * 0.5) * 0.1 + 0.9;

            ctx.fillStyle = `rgba(255, 71, 87, ${pulse})`;
            ctx.beginPath();
            ctx.moveTo(sx, y + h);
            ctx.lineTo(sx + spikeW / 2, y);
            ctx.lineTo(sx + spikeW, y + h);
            ctx.closePath();
            ctx.fill();

            // Glow
            ctx.fillStyle = `rgba(255, 71, 87, ${pulse * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(sx - 2, y + h + 2);
            ctx.lineTo(sx + spikeW / 2, y - 4);
            ctx.lineTo(sx + spikeW + 2, y + h + 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawButton(btn, isActivated, cameraX, cameraY) {
        const ctx = this.ctx;
        const x = btn.x - cameraX;
        const y = btn.y - cameraY;
        const w = btn.w;
        const h = btn.h;

        // Base
        ctx.fillStyle = '#1a1a3e';
        ctx.fillRect(x - 4, y + h - 6, w + 8, 6);

        // Button
        const btnH = isActivated ? 6 : h;
        const color = btn.color || '#2ed573';
        ctx.fillStyle = isActivated ? color : this.darkenColor(color, 40);
        ctx.fillRect(x, y + h - btnH, w, btnH);

        // Button glow when activated
        if (isActivated) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = color;
            ctx.fillRect(x, y + h - btnH, w, btnH);
            ctx.shadowBlur = 0;
        }

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '8px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('BTN', x + w / 2, y - 4);
        ctx.textAlign = 'left';
    }

    drawDoor(door, isOpen, cameraX, cameraY) {
        const ctx = this.ctx;
        const x = door.x - cameraX;
        const y = door.y - cameraY;
        const w = door.w;
        const h = door.h;
        const color = door.color || '#ff4757';

        if (isOpen) {
            // Draw faded outline
            ctx.strokeStyle = `${color}44`;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x, y, w, h);
            ctx.setLineDash([]);

            // Open indicator
            ctx.fillStyle = '#2ed57388';
            ctx.font = '10px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('OPEN', x + w / 2, y + h / 2);
            ctx.textAlign = 'left';
        } else {
            // Solid door
            const gradient = ctx.createLinearGradient(x, y, x + w, y);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, this.darkenColor(color, 30));
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, w, h);

            // Door frame
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);

            // Lock icon
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.font = '14px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('🔒', x + w / 2, y + h / 2 + 5);
            ctx.textAlign = 'left';

            // Pulsing glow
            const pulse = Math.sin(this.time * 0.03) * 0.15 + 0.1;
            ctx.fillStyle = `rgba(255,255,255,${pulse})`;
            ctx.fillRect(x, y, w, h);

            // Required buttons label
            if (door.requiredButtons && door.requiredButtons > 1) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = 'bold 9px Outfit';
                ctx.textAlign = 'center';
                ctx.fillText(`${door.requiredButtons} BTN`, x + w / 2, y - 4);
                ctx.textAlign = 'left';
            }
        }
    }

    drawMovingPlatform(mp, cameraX, cameraY) {
        const ctx = this.ctx;
        const x = mp.currentX - cameraX;
        const y = mp.currentY - cameraY;

        // Trail
        ctx.fillStyle = 'rgba(55, 66, 250, 0.08)';
        const trailX = (mp.x || mp.startX) - cameraX;
        const trailY = (mp.y || mp.startY) - cameraY;
        ctx.fillRect(
            Math.min(x, trailX + (mp.moveX || 0)),
            Math.min(y, trailY + (mp.moveY || 0)),
            mp.w + Math.abs(mp.moveX || 0),
            mp.h + Math.abs(mp.moveY || 0)
        );

        // Platform
        ctx.fillStyle = '#3742fa';
        ctx.fillRect(x, y, mp.w, mp.h);

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x, y, mp.w, 3);

        // Arrows indicating movement direction
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '10px Outfit';
        ctx.textAlign = 'center';
        if (mp.moveX) {
            ctx.fillText('↔', x + mp.w / 2, y + mp.h / 2 + 4);
        } else {
            ctx.fillText('↕', x + mp.w / 2, y + mp.h / 2 + 4);
        }
        ctx.textAlign = 'left';
    }

    drawCheckpoint(cp, isActive, cameraX, cameraY) {
        const ctx = this.ctx;
        const x = cp.x - cameraX;
        const y = cp.y - cameraY;

        // Flag pole
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 8, y - 30, 3, 50);

        // Flag
        if (isActive) {
            ctx.fillStyle = '#2ed573';
            const wave = Math.sin(this.time * 0.08) * 3;
            ctx.beginPath();
            ctx.moveTo(x + 11, y - 30);
            ctx.lineTo(x + 30 + wave, y - 22);
            ctx.lineTo(x + 11, y - 14);
            ctx.closePath();
            ctx.fill();

            // Glow
            ctx.shadowColor = '#2ed573';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.moveTo(x + 11, y - 30);
            ctx.lineTo(x + 26, y - 22);
            ctx.lineTo(x + 11, y - 14);
            ctx.closePath();
            ctx.fill();
        }

        // Star
        ctx.fillStyle = isActive ? '#ffd700' : '#555';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', x + 10, y - 36);
        ctx.textAlign = 'left';
    }

    drawFinish(finish, cameraX, cameraY) {
        const ctx = this.ctx;
        const x = finish.x - cameraX;
        const y = finish.y - cameraY;
        const w = finish.w;
        const h = finish.h;

        // Checkerboard pattern
        const tileSize = 10;
        for (let r = 0; r < h / tileSize; r++) {
            for (let c = 0; c < w / tileSize; c++) {
                ctx.fillStyle = (r + c) % 2 === 0 ? '#fff' : '#111';
                ctx.globalAlpha = 0.3;
                ctx.fillRect(x + c * tileSize, y + r * tileSize, tileSize, tileSize);
            }
        }
        ctx.globalAlpha = 1;

        // Flag
        const wave = Math.sin(this.time * 0.06) * 4;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y - 10);
        ctx.lineTo(x + w / 2 + 25 + wave, y - 2);
        ctx.lineTo(x + w / 2, y + 6);
        ctx.closePath();
        ctx.fill();

        // Pole
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + w / 2 - 1, y - 10, 3, h + 10);

        // Label
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px "Press Start 2P"';
        ctx.textAlign = 'center';
        const labelPulse = Math.sin(this.time * 0.05) * 0.3 + 0.7;
        ctx.globalAlpha = labelPulse;
        ctx.fillText('🏁 FINISH', x + w / 2, y - 18);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
    }

    drawBackground(level, canvasW, canvasH, cameraX, cameraY) {
        const ctx = this.ctx;

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasH);
        skyGrad.addColorStop(0, '#0a0a2e');
        skyGrad.addColorStop(0.5, '#0d0d3a');
        skyGrad.addColorStop(1, '#12122a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Stars
        const starSeed = 42;
        for (let i = 0; i < 50; i++) {
            const sx = ((i * 137 + starSeed) % level.width) - cameraX * 0.3;
            const sy = ((i * 97 + starSeed) % (canvasH * 0.6));
            const twinkle = Math.sin(this.time * 0.02 + i) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.5})`;
            ctx.fillRect(sx, sy, 2, 2);
        }

        // Background mountains (parallax)
        ctx.fillStyle = '#0f0f2a';
        ctx.beginPath();
        ctx.moveTo(0, canvasH);
        for (let mx = 0; mx < canvasW + 200; mx += 100) {
            const mh = Math.sin((mx + cameraX * 0.1) * 0.005) * 80 + 
                       Math.sin((mx + cameraX * 0.1) * 0.01) * 40;
            ctx.lineTo(mx, canvasH - 150 - mh);
        }
        ctx.lineTo(canvasW + 200, canvasH);
        ctx.closePath();
        ctx.fill();

        // Closer mountains
        ctx.fillStyle = '#121235';
        ctx.beginPath();
        ctx.moveTo(0, canvasH);
        for (let mx = 0; mx < canvasW + 200; mx += 80) {
            const mh = Math.sin((mx + cameraX * 0.2) * 0.008) * 50 +
                       Math.sin((mx + cameraX * 0.2) * 0.015) * 30;
            ctx.lineTo(mx, canvasH - 80 - mh);
        }
        ctx.lineTo(canvasW + 200, canvasH);
        ctx.closePath();
        ctx.fill();
    }

    drawLevelMessages(level, levelNum, cameraX, cameraY, canvasW) {
        const ctx = this.ctx;
        const messages = LEVEL_MESSAGES[levelNum] || [];
        for (const msg of messages) {
            const x = msg.x - cameraX;
            if (x > -200 && x < canvasW + 200) {
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.font = '14px "Press Start 2P"';
                ctx.textAlign = 'center';
                const bob = Math.sin(this.time * 0.03 + msg.x * 0.01) * 5;
                ctx.fillText(msg.text, x, 80 + bob);
                ctx.textAlign = 'left';
            }
        }
    }

    darkenColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - amount);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
        const b = Math.max(0, (num & 0x0000FF) - amount);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }
}
