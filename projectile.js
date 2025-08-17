// Projectile entity

class Projectile {
    constructor(position, direction, owner) {
        this.position = { x: position.x, y: position.y };
        this.direction = { x: direction.x, y: direction.y };
        this.owner = owner; // "player" or "enemy"
        this.speed = owner === "player" ? 590 : 220;
        this.damage = owner === "player" ? 38 : 18;
        this.isDead = false;
        this.rotation = Math.atan2(direction.x, -direction.y);
    }

    update(dt, entities) {
        this.position.x += this.direction.x * this.speed * dt;
        this.position.y += this.direction.y * this.speed * dt;
        if (this.position.x < -24 || this.position.x > 1124 ||
            this.position.y < -34 || this.position.y > 824) {
            this.isDead = true;
        }
    }
}

window.Projectile = Projectile;