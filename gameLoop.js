// The main game loop: updates, renders, handles state transitions

class GameLoop {
    constructor(gameStateManager) {
        this.gsm = gameStateManager;
        this.lastTime = performance.now();
        this.running = false;
        this._boundLoop = this.loop.bind(this);
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this._boundLoop);
    }

    stop() { this.running = false; }

    loop(now) {
        if (!this.running) return;
        const dt = Math.min((now - this.lastTime) / 1000, 0.045); // Clamp for perf spikes
        this.lastTime = now;
        this.gsm.update(dt);
        this.gsm.render();
        requestAnimationFrame(this._boundLoop);
    }
}

window.GameLoop = GameLoop;