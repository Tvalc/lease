// Enemy entity and wave manager

class Enemy {
    constructor(type, pos, gsm, waveLevel = 1) {
        this.type = type; // "normal", "shooter", "elite"
        this.gsm = gsm;
        this.waveLevel = waveLevel;
        this.position = { x: pos.x, y: pos.y };
        this.velocity = { x: 0, y: 0 };
        this.rotation = Math.PI/2;
        this.radius = type === "elite" ? 24 : 16;
        this.health = (type === "elite" ? 240 : type === "shooter" ? 70 : 35) + waveLevel * 6;
        this.maxHealth = this.health;
        this.shootCooldown = Math.random() * 1.7 + 0.6;
        this.isDead = false;
        this.scoreValue = type === "elite" ? 3200 + 180 * waveLevel : type === "shooter" ? 340 + 25 * waveLevel : 120 + 10 * waveLevel;
    }

    update(dt, entities) {
        // Movement pattern
        if (this.type === "normal") {
            this.position.y += (66 + this.waveLevel * 6) * dt;
            this.position.x += Math.sin(this.position.y * 0.07) * 32 * dt;
        } else if (this.type === "shooter") {
            this.position.y += (52 + this.waveLevel * 5) * dt;
            this.position.x += Math.sin(this.position.y * 0.09) * 44 * dt;
            // Shooting at player
            this.shootCooldown -= dt;
            if (this.shootCooldown < 0 && entities.player) {
                let dx = entities.player.position.x - this.position.x;
                let dy = entities.player.position.y - this.position.y;
                let angle = Math.atan2(dy, dx);
                let v = { x: Math.cos(angle), y: Math.sin(angle) };
                let proj = new window.Projectile(
                    { x: this.position.x, y: this.position.y + 14 },
                    v,
                    "enemy"
                );
                proj.speed = 210 + Math.random()*30;
                proj.damage = 22;
                entities.spawnProjectile(proj);
                this.shootCooldown = 1.8 + Math.random();
                this.gsm.audio.playLaser();
            }
        } else if (this.type === "elite") {
            // Boss: moves horizontally, occasionally fires a fan of shots
            this.position.x += Math.sin(performance.now()/800) * 92 * dt;
            this.position.y += 38 * dt;
            this.shootCooldown -= dt;
            if (this.shootCooldown < 0 && entities.player) {
                let angle = Math.PI/2;
                for (let i = -2; i <= 2; ++i) {
                    let theta = angle + i*0.18;
                    let v = { x: Math.cos(theta), y: Math.sin(theta) };
                    let proj = new window.Projectile(
                        { x: this.position.x, y: this.position.y + 18 },
                        v,
                        "enemy"
                    );
                    proj.speed = 170 + Math.random() * 22;
                    proj.damage = 25;
                    entities.spawnProjectile(proj);
                }
                this.shootCooldown = 1.1 + Math.random()*0.7;
                this.gsm.audio.playLaser();
            }
        }
        // Remove if off screen
        if (this.position.y > 810) this.isDead = true;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) this.isDead = true;
    }
}

// --- Wave Manager ---

class WaveManager {
    constructor(gsm, entityManager) {
        this.gsm = gsm;
        this.entityManager = entityManager;
        this.wave = 1;
        this.spawned = 0;
        this.waveTimer = 0;
        this.completed = false;
        this.maxWaves = 6;
    }

    update(dt) {
        if (this.completed) return;
        // If all enemies are dead, spawn next wave after delay
        if (this.entityManager.enemies.length === 0 && this.spawned > 0) {
            this.waveTimer += dt;
            if (this.wave < this.maxWaves && this.waveTimer > 1.4) {
                this.wave += 1;
                this.spawned = 0;
                this.waveTimer = 0;
            } else if (this.wave >= this.maxWaves && this.waveTimer > 2.0) {
                // Boss win
                this.completed = true;
            }
        }
        // Spawn enemies for current wave
        if (this.wave <= this.maxWaves && this.spawned < this.enemiesPerWave()) {
            this.spawnTimer = (this.spawnTimer || 0) - dt;
            if (this.spawnTimer <= 0) {
                let type = this.getEnemyType();
                let pos = {
                    x: 80 + Math.random() * 940,
                    y: -24 - Math.random() * 60
                };
                let enemy = new window.Enemy(type, pos, this.gsm, this.wave);
                this.entityManager.spawnEnemy(enemy);
                this.spawned += 1;
                this.spawnTimer = 0.42 + Math.random() * 0.22;
            }
        }
        // Boss
        if (this.wave === this.maxWaves && this.spawned === this.enemiesPerWave()) {
            if (!this.bossSpawned) {
                let boss = new window.Enemy("elite", { x: 550, y: -70 }, this.gsm, this.wave);
                boss.health *= 2.3; boss.maxHealth = boss.health;
                this.entityManager.spawnEnemy(boss);
                this.bossSpawned = true;
            }
        }
    }

    enemiesPerWave() {
        if (this.wave === this.maxWaves) return 0;
        return 4 + this.wave * 3;
    }

    getEnemyType() {
        if (this.wave < 2) return "normal";
        if (this.wave < 4) return Math.random() > 0.33 ? "normal" : "shooter";
        return Math.random() > 0.55 ? "shooter" : "normal";
    }
}

window.Enemy = Enemy;
window.WaveManager = WaveManager;