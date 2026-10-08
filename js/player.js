// player.js - Player class for rendering and physics
class Player {
    constructor(id, username, color, colorIndex, isLocal = false) {
        this.id = id;
        this.username = username;
        this.color = color;
        this.colorIndex = colorIndex;
        this.isLocal = isLocal;

        // Position
        this.x = 80;
        this.y = 400;
        this.width = 28;
        this.height = 36;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.speed = 4.5;
        this.jumpForce = -11;
        this.gravity = 0.55;
        this.friction = 0.82;
        this.maxFallSpeed = 12;

        // State
        this.isJumping = false;
        this.isGrounded = false;
        this.isAlive = true;
        this.isFinished = false;
        this.facingRight = true;
        this.onButton = null;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.walkCycle = 0;
        this.deathTimer = 0;
        this.respawnFlash = 0;

        // Network interpolation (for remote players)
        this.targetX = this.x;
        this.targetY = this.y;
        this.interpSpeed = 0.25;

        // Particle effects
        this.particles = [];
    }

    update(level, keys, allPlayers) {
        if (!this.isAlive) {
            this.deathTimer++;
            this.updateParticles();
            return;
        }

        if (this.isFinished) return;

        if (this.respawnFlash > 0) this.respawnFlash--;

        if (this.isLocal) {
            this.handleInput(keys);
            this.applyPhysics(level);
            this.checkCollisions(level);
            this.checkSpikes(level);
            this.checkPit(level);
            this.checkButtons(level);
            this.checkMovingPlatforms(level);
        } else {
            // Interpolate remote players
            this.x += (this.targetX - this.x) * this.interpSpeed;
            this.y += (this.targetY - this.y) * this.interpSpeed;
        }

        // Animation
        this.animTimer++;
        if (Math.abs(this.vx) > 0.5) {
            this.walkCycle += 0.15;
        } else {
            this.walkCycle = 0;
        }

        this.updateParticles();
    }

    handleInput(keys) {
        if (keys.left) {
            this.vx = -this.speed;
            this.facingRight = false;
        } else if (keys.right) {
            this.vx = this.speed;
            this.facingRight = true;
        } else {
            this.vx *= this.friction;
        }

        if (keys.jump && this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
            // Jump particles
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: this.x + this.width / 2,
                    y: this.y + this.height,
                    vx: (Math.random() - 0.5) * 3,
                    vy: Math.random() * -2,
                    life: 20 + Math.random() * 10,
                    maxLife: 30,
                    color: this.color
                });
            }
        }
    }

    applyPhysics(level) {
        // Gravity
        this.vy += this.gravity;
        if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;

        // Move X
        this.x += this.vx;

        // Clamp to level bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > level.width) this.x = level.width - this.width;

        // Check horizontal collisions with platforms
        this.isGrounded = false;
        for (const plat of level.platforms) {
            if (this.collidesWith(plat)) {
                if (this.vx > 0) {
                    this.x = plat.x - this.width;
                } else if (this.vx < 0) {
                    this.x = plat.x + plat.w;
                }
                this.vx = 0;
            }
        }

        // Check horizontal collision with closed doors
        for (const door of level.doors) {
            if (!door.isOpen && this.collidesWith(door)) {
                if (this.vx > 0) {
                    this.x = door.x - this.width;
                } else if (this.vx < 0) {
                    this.x = door.x + door.w;
                }
                this.vx = 0;
            }
        }

        // Move Y
        this.y += this.vy;

        // Check vertical collisions with platforms
        for (const plat of level.platforms) {
            if (this.collidesWith(plat)) {
                if (this.vy > 0) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                    this.isJumping = false;
                } else if (this.vy < 0) {
                    this.y = plat.y + plat.h;
                    this.vy = 0;
                }
            }
        }

        // Check vertical collision with closed doors
        for (const door of level.doors) {
            if (!door.isOpen && this.collidesWith(door)) {
                if (this.vy > 0) {
                    this.y = door.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                    this.isJumping = false;
                } else if (this.vy < 0) {
                    this.y = door.y + door.h;
                    this.vy = 0;
                }
            }
        }
    }

    checkCollisions(level) {
        // Already handled in applyPhysics
    }

    checkSpikes(level) {
        for (const spike of level.spikes) {
            if (this.collidesWithRect(spike.x, spike.y, spike.w, spike.h)) {
                this.die();
                return;
            }
        }
    }

    checkPit(level) {
        if (this.y > level.height + 50) {
            this.die();
        }
    }

    checkButtons(level) {
        this.onButton = null;
        for (const btn of level.buttons) {
            const onBtn = this.collidesWithRect(btn.x - 5, btn.y - 5, btn.w + 10, btn.h + 10) && this.isGrounded;
            if (onBtn) {
                this.onButton = btn.id;
            }
        }
    }

    checkMovingPlatforms(level) {
        if (!level._movingPlatforms) return;
        for (const mp of level._movingPlatforms) {
            if (this.collidesWithRect(mp.currentX, mp.currentY, mp.w, mp.h)) {
                if (this.vy >= 0 && this.y + this.height - this.vy <= mp.currentY + 5) {
                    this.y = mp.currentY - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                    this.isJumping = false;
                    // Move with platform
                    this.x += mp.dx || 0;
                    this.y += mp.dy || 0;
                }
            }
        }
    }

    collidesWith(rect) {
        return this.x < rect.x + rect.w &&
               this.x + this.width > rect.x &&
               this.y < rect.y + rect.h &&
               this.y + this.height > rect.y;
    }

    collidesWithRect(rx, ry, rw, rh) {
        return this.x < rx + rw &&
               this.x + this.width > rx &&
               this.y < ry + rh &&
               this.y + this.height > ry;
    }

    die() {
        if (!this.isAlive) return;
        this.isAlive = false;
        this.deathTimer = 0;
        // Death particles
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                life: 40 + Math.random() * 20,
                maxLife: 60,
                color: this.color,
                size: 3 + Math.random() * 4
            });
        }
    }

    respawn(checkpointX, checkpointY) {
        this.isAlive = true;
        this.isFinished = false;
        this.x = checkpointX;
        this.y = checkpointY - this.height;
        this.vx = 0;
        this.vy = 0;
        this.targetX = this.x;
        this.targetY = this.y;
        this.respawnFlash = 60;
        this.deathTimer = 0;
        this.onButton = null;
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, cameraX, cameraY) {
        const sx = this.x - cameraX;
        const sy = this.y - cameraY;

        // Draw particles
        for (const p of this.particles) {
            const px = p.x - cameraX;
            const py = p.y - cameraY;
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            const size = p.size || 3;
            ctx.fillRect(px - size / 2, py - size / 2, size, size);
        }
        ctx.globalAlpha = 1;

        if (!this.isAlive) return;

        // Respawn flash
        if (this.respawnFlash > 0 && Math.floor(this.respawnFlash / 4) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        // Draw character body
        this.drawCharacter(ctx, sx, sy);

        ctx.globalAlpha = 1;

        // Draw username above
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '600 10px Outfit';
        const nameWidth = ctx.measureText(this.username).width;
        ctx.fillRect(sx + this.width / 2 - nameWidth / 2 - 4, sy - 18, nameWidth + 8, 14);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(this.username, sx + this.width / 2, sy - 8);
        ctx.textAlign = 'left';

        // Finished indicator
        if (this.isFinished) {
            ctx.fillStyle = '#2ed573';
            ctx.font = '14px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('🏁', sx + this.width / 2, sy - 24);
            ctx.textAlign = 'left';
        }
    }

    drawCharacter(ctx, sx, sy) {
        const w = this.width;
        const h = this.height;
        const cx = sx + w / 2;

        // Body
        ctx.fillStyle = this.color;
        const bodyRadius = 5;
        this.roundRect(ctx, sx + 2, sy + 8, w - 4, h - 14, bodyRadius);
        ctx.fill();

        // Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(cx, sy + 8, 9, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        const eyeOffsetX = this.facingRight ? 2 : -2;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX - 3, sy + 6, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + eyeOffsetX + 3, sy + 6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX - 2.5 + (this.facingRight ? 0.5 : -0.5), sy + 6.5, 1.2, 0, Math.PI * 2);
        ctx.arc(cx + eyeOffsetX + 3.5 + (this.facingRight ? 0.5 : -0.5), sy + 6.5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Legs animation
        const legY = sy + h - 6;
        const legSpread = Math.sin(this.walkCycle) * 4;
        ctx.fillStyle = this.color;
        ctx.fillRect(cx - 6, legY, 5, 6 + (this.isJumping ? -2 : 0));
        ctx.fillRect(cx + 1, legY, 5, 6 + (this.isJumping ? -2 : 0));

        // Feet
        const footColor = this.lightenColor(this.color, -30);
        ctx.fillStyle = footColor;
        ctx.fillRect(cx - 7 + (this.isGrounded ? legSpread : 0), legY + 4, 6, 3);
        ctx.fillRect(cx + (this.isGrounded ? -legSpread : 0), legY + 4, 6, 3);

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        this.roundRect(ctx, sx + 4, sy + 10, (w - 4) / 2 - 2, h - 20, 3);
        ctx.fill();
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    lightenColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `rgb(${r},${g},${b})`;
    }
}
