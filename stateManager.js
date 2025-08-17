// Handles global game state, transitions, and orchestrates systems

class GameStateManager {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.input = new window.InputHandler();
        this.renderer = new window.Renderer(this);
        this.audio = new window.AudioManager();
        this.ui = new window.UIManager(this);
        this.scoring = new window.ScoringSystem();
        this.entityManager = new window.EntityManager(this);
        this.gameLoop = new window.GameLoop(this);
        this.collisionSystem = new window.CollisionSystem(this);

        this.state = "menu"; // "playing", "gameover", "win"
        this._overlayTimeout = null;
    }

    startGame() {
        this.state = "playing";
        this.entityManager.reset();
        this.scoring.reset();
        this.input.activate();
        this.ui.clearOverlay();
        this.gameLoop.start();
        this.audio.playMusic();
    }

    gameOver() {
        this.state = "gameover";
        this.input.deactivate();
        this.audio.stopMusic();
        this.audio.playExplosion();
        this.ui.showGameOver(this.scoring.score, () => this.restart());
        this.gameLoop.stop();
    }

    winGame() {
        this.state = "win";
        this.input.deactivate();
        this.audio.stopMusic();
        this.ui.showWin(this.scoring.score, () => this.restart());
        this.gameLoop.stop();
    }

    restart() {
        this.state = "playing";
        this.entityManager.reset();
        this.scoring.reset();
        this.input.activate();
        this.ui.clearOverlay();
        this.gameLoop.start();
        this.audio.playMusic();
    }

    update(dt) {
        if (this.state !== "playing") return;
        this.entityManager.update(dt, this.input);
        this.collisionSystem.handleCollisions();
        if (this.entityManager.player && this.entityManager.player.lives <= 0) {
            this.gameOver();
        } else if (this.entityManager.waveManager.completed && this.entityManager.enemies.length === 0) {
            this.winGame();
        }
    }

    render() {
        this.renderer.render();
        this.ui.renderHUD(
            this.scoring.score,
            this.entityManager.player ? this.entityManager.player.health : 0,
            this.entityManager.player ? this.entityManager.player.lives : 0
        );
    }
}

window.GameStateManager = GameStateManager;