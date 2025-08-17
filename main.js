// Main entry point: orchestrates game initialization and restart

// --- Powerup entity definition ---
class Powerup {
    constructor(pos, type, value) {
        this.type = type; // "heal", "rapid", "shield", "currency"
        this.position = { x: pos.x, y: pos.y };
        this.radius = type === "currency" ? 10 : 13;
        this.isDead = false;
        this.value = value || 1;
        this._vy = 70 + Math.random() * 30;
        this._vx = (Math.random() - 0.5) * 30;
        this._float = Math.random() * Math.PI * 2;
    }
    update(dt, entities) {
        this.position.y += this._vy * dt;
        this.position.x += this._vx * dt;
        this._vx *= 0.98;
        this._vy += Math.sin(performance.now() / 300 + this._float) * 2 * dt;
        // Remove if off screen
        if (this.position.y > 830 || this.position.x < -30 || this.position.x > 1130) {
            this.isDead = true;
        }
    }
}
window.Powerup = Powerup;

window.addEventListener('DOMContentLoaded', () => {
    if (!window.GameStateManager) {
        // Defensive: reload if not ready
        setTimeout(() => window.location.reload(), 100);
        return;
    }
    window.gameStateManager = new window.GameStateManager();
    window.gameStateManager.startGame();
});