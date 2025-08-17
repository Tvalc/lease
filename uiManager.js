// Handles UI overlays, HUD, and gameover/win displays

class UIManager {
    constructor(gsm) {
        this.gsm = gsm;
        this.overlay = document.getElementById('ui-overlay');
        this.bar = null;
    }
    clearOverlay() {
        this.overlay.innerHTML = '';
        this.bar = null;
    }
    renderHUD(score, health, lives) {
        // Top bar
        if (!this.bar) {
            this.bar = document.createElement('div');
            this.bar.className = "ui-bar";
            this.overlay.appendChild(this.bar);
        }
        let currency = (this.gsm.scoring && typeof this.gsm.scoring.currency !== "undefined") ? this.gsm.scoring.currency : 0;
        this.bar.innerHTML =
            `<span class="ui-score">SCORE: ${score.toLocaleString()}</span>
             <span class="ui-health">HP: ${health}</span>
             <span class="ui-lives">LIVES: ${lives}</span>
             <span class="ui-currency" style="color:gold;font-weight:bold;margin-left:14px;">
                <span style="font-size:1.2em;vertical-align:middle;">&#36;</span> ${currency}
             </span>`;
    }
    showGameOver(score, onRestart) {
        this.clearOverlay();
        const d = document.createElement('div');
        d.className = "ui-gameover";
        let currency = (this.gsm.scoring && typeof this.gsm.scoring.currency !== "undefined") ? this.gsm.scoring.currency : 0;
        d.innerHTML = `
            GAME OVER<br>
            <span style="font-size:1.1rem;color:#eee;">Final Score: <b>${score.toLocaleString()}</b></span>
            <br>
            <span style="font-size:1.1rem;color:gold;">Currency Collected: <b>${currency}</b></span>
            <br><button class="ui-btn" id="btn-restart">RESTART</button>
        `;
        this.overlay.appendChild(d);
        setTimeout(() => {
            document.getElementById('btn-restart').onclick = onRestart;
            document.getElementById('btn-restart').focus();
        }, 120);
    }
    showWin(score, onRestart) {
        this.clearOverlay();
        const d = document.createElement('div');
        d.className = "ui-win";
        let currency = (this.gsm.scoring && typeof this.gsm.scoring.currency !== "undefined") ? this.gsm.scoring.currency : 0;
        d.innerHTML = `
            VICTORY!<br>
            <span style="font-size:1.1rem;color:#eee;">Final Score: <b>${score.toLocaleString()}</b></span>
            <br>
            <span style="font-size:1.1rem;color:gold;">Currency Collected: <b>${currency}</b></span>
            <br><button class="ui-btn" id="btn-restart">PLAY AGAIN</button>
        `;
        this.overlay.appendChild(d);
        setTimeout(() => {
            document.getElementById('btn-restart').onclick = onRestart;
            document.getElementById('btn-restart').focus();
        }, 120);
    }
}

window.UIManager = UIManager;