// Manages player, enemies, projectiles, and particles

class EntityManager {
    constructor(gsm) {
        this.gsm = gsm;
        this.reset();
    }

    reset() {
        this.player = new window.Player(this.gsm);
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.powerups = [];
        this.waveManager = new window.WaveManager(this.gsm, this);
        this.spawnTimer = 0;
        this._currencyToAdd = 0;
    }

    update(dt, input) {
        // Player
        if (this.player) this.player.update(dt, input, this);

        // Enemies
        for (let i = this.enemies.length - 1; i >= 0; --i) {
            const enemy = this.enemies[i];
            enemy.update(dt, this);
            if (enemy.isDead) {
                this.gsm.scoring.addScore(enemy.scoreValue);
                this.gsm.audio.playExplosion();
                this.spawnExplosion(enemy.position.x, enemy.position.y, enemy.type === "elite" ? 32 : 16);

                // --- Currency drop ---
                let currencyValue = enemy.type === "elite" ? 10 : enemy.type === "shooter" ? 3 : 1;
                this.spawnCurrency(enemy.position.x, enemy.position.y, currencyValue);

                // --- Powerup drop ---
                if (Math.random() < 0.18 || enemy.type === "elite") { // 18% chance, always for elite
                    let types = ["heal", "rapid", "shield"];
                    let type = types[Math.floor(Math.random() * types.length)];
                    // Elite always drops random, but weighted toward shield
                    if (enemy.type === "elite" && Math.random() < 0.5) type = "shield";
                    this.spawnPowerup(enemy.position.x, enemy.position.y, type);
                }

                this.enemies.splice(i, 1);
            }
        }

        // Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; --i) {
            const proj = this.projectiles[i];
            proj.update(dt, this);
            if (proj.isDead) {
                this.projectiles.splice(i, 1);
            }
        }

        // Powerups
        for (let i = this.powerups.length - 1; i >= 0; --i) {
            const p = this.powerups[i];
            p.update(dt, this);
            if (p.isDead) {
                this.powerups.splice(i, 1);
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; --i) {
            const part = this.particles[i];
            part.life -= dt;
            part.alpha = Math.max(0, part.alpha - dt * 2.5);
            part.x += part.vx * dt;
            part.y += part.vy * dt;
            part.radius *= (0.97 - 0.02 * Math.random());
            part.rotation += part.vr * dt;
            if (part.life <= 0 || part.radius < 0.5) {
                this.particles.splice(i, 1);
            }
        }

        // Spawn enemies via wave manager
        this.waveManager.update(dt);
    }

    spawnProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    spawnEnemy(enemy) {
        this.enemies.push(enemy);
    }

    spawnExplosion(x, y, size) {
        for (let i = 0; i < size; ++i) {
            let angle = Math.random() * 2 * Math.PI;
            let speed = Math.random() * 80 + 40;
            this.particles.push({
                x: x + Math.cos(angle) * 4,
                y: y + Math.sin(angle) * 4,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 2.5 + 1 + size * 0.06,
                alpha: 1.0,
                color: `hsla(${Math.random()*60+10},70%,65%,1)`,
                life: Math.random() * 0.6 + 0.24,
                rotation: Math.random() * Math.PI * 2,
                vr: Math.random() * 2 - 1
            });
        }
    }

    spawnPowerup(x, y, type) {
        this.powerups.push(new window.Powerup({ x, y }, type));
    }

    spawnCurrency(x, y, value) {
        this.powerups.push(new window.Powerup({ x, y }, "currency", value));
    }
}

window.EntityManager = EntityManager;