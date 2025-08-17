// Handles collision detection and resolves consequences

class CollisionSystem {
    constructor(gsm) {
        this.gsm = gsm;
    }

    // Circle-circle collision
    intersect(e1, e2, r1 = 14, r2 = 14) {
        let dx = e1.position.x - e2.position.x;
        let dy = e1.position.y - e2.position.y;
        let dist = dx*dx + dy*dy;
        return dist < (r1 + r2) * (r1 + r2);
    }

    handleCollisions() {
        const em = this.gsm.entityManager;
        // Projectiles vs Enemies
        for (let i = em.projectiles.length - 1; i >= 0; --i) {
            const proj = em.projectiles[i];
            if (proj.owner !== "player") continue;
            for (let j = em.enemies.length - 1; j >= 0; --j) {
                const enemy = em.enemies[j];
                if (this.intersect(proj, enemy, 8, enemy.type === "elite" ? 24 : 16)) {
                    enemy.takeDamage(proj.damage);
                    proj.isDead = true;
                    em.spawnExplosion(proj.position.x, proj.position.y, 7);
                    break;
                }
            }
        }
        // Enemy projectiles vs player
        for (let i = em.projectiles.length - 1; i >= 0; --i) {
            const proj = em.projectiles[i];
            if (proj.owner !== "enemy") continue;
            if (em.player && this.intersect(proj, em.player, 8, 17)) {
                em.player.takeDamage(proj.damage);
                proj.isDead = true;
                em.spawnExplosion(proj.position.x, proj.position.y, 8);
            }
        }
        // Enemies vs Player (ramming)
        for (const enemy of em.enemies) {
            if (em.player && this.intersect(enemy, em.player, enemy.type === "elite" ? 24 : 15, 18)) {
                em.player.takeDamage(20);
                enemy.takeDamage(999);
                em.spawnExplosion(enemy.position.x, enemy.position.y, 18);
            }
        }
        // Powerups/currency vs Player
        for (let i = em.powerups.length - 1; i >= 0; --i) {
            const p = em.powerups[i];
            if (em.player && this.intersect(p, em.player, p.radius || 15, 18)) {
                // Powerup effect
                if (p.type === "heal") {
                    em.player.health = Math.min(100, em.player.health + 35);
                    this.gsm.audio.playLaser();
                } else if (p.type === "rapid") {
                    em.player.applyRapidFire();
                    this.gsm.audio.playLaser();
                } else if (p.type === "shield") {
                    em.player.applyShield();
                    this.gsm.audio.playLaser();
                } else if (p.type === "currency") {
                    this.gsm.scoring.addCurrency(p.value || 1);
                    this.gsm.audio.playLaser();
                }
                p.isDead = true;
            }
        }
    }
}

window.CollisionSystem = CollisionSystem;