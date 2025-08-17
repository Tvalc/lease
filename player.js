// Player entity

class Player {
    constructor(gsm) {
        this.gsm = gsm;
        this.position = { x: 550, y: 720 };
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
        this.radius = 18;
        this.health = 100;
        this.lives = 3;
        this.shootCooldown = 0;
        this._thrustAnim = 0;
        this.invulnTimer = 0;
        // --- Powerup states ---
        this.rapidFireTimer = 0;
        this.shieldTimer = 0;
    }

    update(dt, input, entities) {
        // Movement: WASD/arrows
        let dx = 0, dy = 0;
        if (input.isPressed("ArrowLeft") || input.isPressed("KeyA")) dx -= 1;
        if (input.isPressed("ArrowRight") || input.isPressed("KeyD")) dx += 1;
        if (input.isPressed("ArrowUp") || input.isPressed("KeyW")) dy -= 1;
        if (input.isPressed("ArrowDown") || input.isPressed("KeyS")) dy += 1;
        let mag = Math.sqrt(dx*dx + dy*dy);
        if (mag > 0) {
            dx /= mag; dy /= mag;
            this.position.x += dx * 320 * dt;
            this.position.y += dy * 320 * dt;
            this.rotation = Math.atan2(dx, -dy);
            this._thrustAnim += dt;
        } else {
            this._thrustAnim = 0;
        }
        // Clamp to area
        this.position.x = Math.max(28, Math.min(1072, this.position.x));
        this.position.y = Math.max(22, Math.min(780, this.position.y));

        // Powerup timers
        if (this.rapidFireTimer > 0) this.rapidFireTimer -= dt;
        if (this.shieldTimer > 0) this.shieldTimer -= dt;

        // Shooting
        this.shootCooldown -= dt;
        let shootDelay = this.rapidFireTimer > 0 ? 0.09 : 0.21;
        if ((input.isPressed("Space") || input.isPressed("KeyZ")) && this.shootCooldown <= 0) {
            this.shoot(entities);
            this.shootCooldown = shootDelay;
        }

        // Invulnerability after hit
        if (this.invulnTimer > 0) {
            this.invulnTimer -= dt;
        }
    }

    shoot(entities) {
        let p = new window.Projectile(
            { x: this.position.x, y: this.position.y - 22 },
            { x: 0, y: -1 },
            "player"
        );
        entities.spawnProjectile(p);
        this.gsm.audio.playLaser();
    }

    takeDamage(amount) {
        if (this.invulnTimer > 0) return;
        if (this.shieldTimer > 0) {
            // Shield absorbs all damage
            return;
        }
        this.health -= amount;
        this.invulnTimer = 1.0;
        if (this.health <= 0) {
            this.lives -= 1;
            this.health = 100;
            if (this.lives < 0) {
                this.gsm.entityManager.player = null;
            }
        }
    }

    applyRapidFire() {
        this.rapidFireTimer = 7.0; // 7 seconds rapid fire
    }

    applyShield() {
        this.shieldTimer = 6.0; // 6 seconds invulnerability
    }
}

window.Player = Player;