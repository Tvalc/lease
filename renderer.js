// Handles all Canvas drawing: background, entities, particles, UI overlays

class Renderer {
    constructor(gameStateManager) {
        this.gsm = gameStateManager;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this._starfield = this._genStarField();
        this._starOffset = 0;
    }

    _genStarField() {
        // Generate static stars with random positions and radii
        let stars = [];
        for (let i = 0; i < 180; ++i) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                r: Math.random() * 1.1 + 0.55,
                alpha: Math.random() * 0.6 + 0.4
            });
        }
        return stars;
    }

    drawBackground(dt) {
        // Animate a gradient nebula with moving stars
        const g = this.ctx.createLinearGradient(0, 0, 0, this.height);
        g.addColorStop(0, 'hsl(230,70%,22%)');
        g.addColorStop(0.45, 'hsl(220,60%,13%)');
        g.addColorStop(1, 'hsl(220,40%,8%)');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Animate starfield
        this._starOffset += dt * 20;
        for (const star of this._starfield) {
            this.ctx.save();
            this.ctx.globalAlpha = star.alpha;
            this.ctx.beginPath();
            let sy = (star.y + this._starOffset) % this.height;
            this.ctx.arc(star.x, sy, star.r, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.shadowColor = '#fff';
            this.ctx.shadowBlur = 8 * star.r;
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawEntities() {
        // Projectiles first
        for (const proj of this.gsm.entityManager.projectiles) {
            this.drawProjectile(proj);
        }
        // Enemies
        for (const enemy of this.gsm.entityManager.enemies) {
            this.drawEnemy(enemy);
        }
        // Powerups/currency
        for (const p of this.gsm.entityManager.powerups) {
            this.drawPowerup(p);
        }
        // Player
        if (this.gsm.entityManager.player) {
            this.drawPlayer(this.gsm.entityManager.player);
        }
        // Explosions/particles
        for (const part of this.gsm.entityManager.particles) {
            this.drawParticle(part);
        }
    }

    drawPlayer(player) {
        // Draw a sleek triangle ship with glow, animated thrust
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(player.position.x, player.position.y);
        ctx.rotate(player.rotation);

        // Glow
        ctx.shadowColor = "hsl(180,100%,70%)";
        ctx.shadowBlur = 34;

        // Ship Body
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(15, 18);
        ctx.lineTo(0, 10);
        ctx.lineTo(-15, 18);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, -22, 0, 18);
        grad.addColorStop(0, "hsl(185,80%,78%)");
        grad.addColorStop(1, "hsl(195,100%,45%)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Canopy
        ctx.beginPath();
        ctx.ellipse(0, -8, 5, 7, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(200,255,255,0.63)";
        ctx.shadowBlur = 8;
        ctx.fill();

        // Thruster
        if (player._thrustAnim > 0) {
            ctx.save();
            ctx.translate(0, 20);
            ctx.rotate(Math.random() * 0.14 - 0.07);
            let l = 18 + Math.sin(player._thrustAnim * 6) * 7;
            let grad2 = ctx.createLinearGradient(0, 0, 0, l);
            grad2.addColorStop(0, "rgba(0,255,255,0.8)");
            grad2.addColorStop(0.2, "rgba(0,140,255,0.5)");
            grad2.addColorStop(1, "rgba(0,60,180,0.0)");
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(0, l);
            ctx.lineTo(5, 0);
            ctx.closePath();
            ctx.fillStyle = grad2;
            ctx.shadowColor = "#0ff";
            ctx.shadowBlur = 18;
            ctx.globalAlpha = 0.9;
            ctx.fill();
            ctx.restore();
        }

        // --- Powerup visual effects ---
        // Rapid fire: blue ring
        if (player.rapidFireTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.33 + 0.13 * Math.sin(performance.now()/120);
            ctx.beginPath();
            ctx.arc(0, 0, 28, 0, 2 * Math.PI);
            ctx.strokeStyle = "hsl(190,100%,70%)";
            ctx.lineWidth = 3.5;
            ctx.shadowColor = "#0ff";
            ctx.shadowBlur = 14;
            ctx.stroke();
            ctx.restore();
        }
        // Shield: gold ring
        if (player.shieldTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.42 + 0.18 * Math.sin(performance.now()/200);
            ctx.beginPath();
            ctx.arc(0, 0, 34, 0, 2 * Math.PI);
            ctx.strokeStyle = "hsl(48,100%,70%)";
            ctx.lineWidth = 5.5;
            ctx.shadowColor = "hsl(48,100%,80%)";
            ctx.shadowBlur = 16;
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    drawEnemy(enemy) {
        // Draw a stylized enemy ship: polygon w/ glow, color by type
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(enemy.position.x, enemy.position.y);
        ctx.rotate(enemy.rotation);

        // Glow
        ctx.shadowColor = enemy.type === "elite" ? "hsl(40,100%,65%)" : "hsl(0,80%,56%)";
        ctx.shadowBlur = 22;

        // Enemy body
        ctx.beginPath();
        if (enemy.type === "elite") {
            // Hexagonal boss
            for (let i = 0; i < 6; ++i) {
                let angle = Math.PI / 3 * i - Math.PI/2;
                let r = i % 2 === 0 ? 24 : 19;
                ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
        } else {
            // Arrow/spiky
            ctx.moveTo(0, -18);
            ctx.lineTo(14, 16);
            ctx.lineTo(0, 8);
            ctx.lineTo(-14, 16);
        }
        ctx.closePath();
        let grad = ctx.createLinearGradient(0, -18, 0, 18);
        if (enemy.type === "elite") {
            grad.addColorStop(0, "hsl(40,100%,80%)");
            grad.addColorStop(1, "hsl(45,100%,54%)");
        } else {
            grad.addColorStop(0, "hsl(0,100%,80%)");
            grad.addColorStop(1, "hsl(0,80%,38%)");
        }
        ctx.fillStyle = grad;
        ctx.fill();

        // Eye
        ctx.beginPath();
        ctx.arc(0, 0, enemy.type === "elite" ? 6 : 4.2, 0, 2 * Math.PI);
        ctx.fillStyle = "hsl(0,90%,98%)";
        ctx.shadowBlur = 0;
        ctx.fill();

        ctx.restore();
    }

    drawProjectile(proj) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(proj.position.x, proj.position.y);
        ctx.rotate(proj.rotation);

        if (proj.owner === "player") {
            // Player laser: glowing blue
            ctx.shadowColor = "#0ff";
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(2.5, 8);
            ctx.lineTo(-2.5, 8);
            ctx.closePath();
            let grad = ctx.createLinearGradient(0, -8, 0, 8);
            grad.addColorStop(0, "#9ff");
            grad.addColorStop(1, "#0cf");
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.93;
            ctx.fill();
        } else {
            // Enemy: pulsing red
            ctx.shadowColor = "#f00";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, 4.8, 0, 2 * Math.PI);
            ctx.fillStyle = "hsl(0,90%,60%)";
            ctx.globalAlpha = 0.82;
            ctx.fill();
        }
        ctx.restore();
    }

    drawPowerup(powerup) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(powerup.position.x, powerup.position.y);

        if (powerup.type === "heal") {
            // Green cross
            ctx.save();
            ctx.shadowColor = "#0f6";
            ctx.shadowBlur = 12;
            ctx.globalAlpha = 0.88;
            ctx.fillStyle = "#0f6";
            ctx.beginPath();
            ctx.fillRect(-6, -2, 12, 4);
            ctx.fillRect(-2, -6, 4, 12);
            ctx.restore();
        } else if (powerup.type === "rapid") {
            // Blue lightning bolt
            ctx.save();
            ctx.shadowColor = "#0cf";
            ctx.shadowBlur = 12;
            ctx.globalAlpha = 0.88;
            ctx.beginPath();
            ctx.moveTo(-5, -7);
            ctx.lineTo(2, -2);
            ctx.lineTo(-1, 2);
            ctx.lineTo(6, 7);
            ctx.lineTo(-2, 2);
            ctx.lineTo(1, -2);
            ctx.closePath();
            ctx.fillStyle = "#0cf";
            ctx.fill();
            ctx.restore();
        } else if (powerup.type === "shield") {
            // Gold shield
            ctx.save();
            ctx.shadowColor = "#fc0";
            ctx.shadowBlur = 12;
            ctx.globalAlpha = 0.93;
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(7, -2);
            ctx.lineTo(4, 7);
            ctx.lineTo(0, 10);
            ctx.lineTo(-4, 7);
            ctx.lineTo(-7, -2);
            ctx.closePath();
            ctx.fillStyle = "#fc0";
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.2;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        } else if (powerup.type === "currency") {
            // Coin: yellow circle with $
            ctx.save();
            ctx.shadowColor = "#ff0";
            ctx.shadowBlur = 14;
            ctx.globalAlpha = 0.93;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, 2 * Math.PI);
            ctx.fillStyle = "gold";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#fff";
            ctx.stroke();
            // Draw $
            ctx.font = "bold 13px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fff";
            ctx.shadowBlur = 0;
            ctx.fillText("$", 0, 1);
            ctx.restore();
        }
        ctx.restore();
    }

    drawParticle(particle) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation || 0);
        ctx.beginPath();
        ctx.arc(0, 0, particle.radius, 0, 2 * Math.PI);
        ctx.closePath();
        var g = ctx.createRadialGradient(0,0,particle.radius*0.15,0,0,particle.radius);
        g.addColorStop(0, particle.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
    }

    render(dt = 1/60) {
        this.drawBackground(dt);
        this.drawEntities();
    }
}

window.Renderer = Renderer;