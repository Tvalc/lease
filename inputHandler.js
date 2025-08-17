// Handles keyboard input: movement, shooting

class InputHandler {
    constructor() {
        this.active = true;
        this.keys = {};

        this._keydown = (e) => {
            if (!this.active) return;
            this.keys[e.code] = true;
            if (e.code === "Space" || e.code === "ArrowUp" || e.code === "ArrowDown" ||
                e.code === "ArrowLeft" || e.code === "ArrowRight" ||
                e.code === "KeyW" || e.code === "KeyA" || e.code === "KeyS" || e.code === "KeyD")
                e.preventDefault();
        };
        this._keyup = (e) => {
            this.keys[e.code] = false;
        };
        window.addEventListener("keydown", this._keydown, { passive: false });
        window.addEventListener("keyup", this._keyup);
    }
    isPressed(code) { return !!this.keys[code]; }
    clear() { this.keys = {}; }
    deactivate() { this.active = false; this.clear(); }
    activate() { this.active = true; }
}

window.InputHandler = InputHandler;