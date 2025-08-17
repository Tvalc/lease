// Simple scoring: add, reset, track high score if desired

class ScoringSystem {
    constructor() { this.reset(); }
    reset() { this.score = 0; this.currency = 0; }
    addScore(amount) { this.score += amount; }
    addCurrency(amount) { this.currency += amount; }
}

window.ScoringSystem = ScoringSystem;