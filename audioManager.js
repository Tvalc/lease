// Generates synthetic sound effects and music (no external assets)

class AudioManager {
    constructor() {
        this.ctx = null;
        this.musicOsc = null;
        this.musicGain = null;
        this.musicPlaying = false;
        this.musicTimer = null;
    }

    getCtx() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        return this.ctx;
    }

    playLaser() {
        let ctx = this.getCtx();
        let o = ctx.createOscillator();
        let g = ctx.createGain();
        o.type = "triangle";
        o.frequency.value = 1000;
        g.gain.value = 0.16;
        o.connect(g).connect(ctx.destination);
        o.frequency.linearRampToValueAtTime(1800, ctx.currentTime+0.08);
        o.frequency.linearRampToValueAtTime(800, ctx.currentTime+0.19);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime+0.21);
        o.start();
        o.stop(ctx.currentTime+0.22);
    }

    playExplosion() {
        let ctx = this.getCtx();
        let dur = 0.37, now = ctx.currentTime;
        let buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random()-0.5) * Math.pow(1-i/data.length, 2.3);
        }
        let source = ctx.createBufferSource();
        source.buffer = buffer;
        let gain = ctx.createGain();
        gain.gain.value = 0.43;
        source.connect(gain).connect(ctx.destination);
        gain.gain.linearRampToValueAtTime(0, now+dur);
        source.start(now);
        source.stop(now+dur);
    }

    playMusic() {
        if (this.musicPlaying) return;
        let ctx = this.getCtx();
        let gain = ctx.createGain();
        gain.gain.value = 0.08;
        gain.connect(ctx.destination);
        let osc = ctx.createOscillator();
        osc.type = "triangle";
        let base = [293.66, 349.23, 392.00, 440.00, 523.25, 392.00, 293.66];
        let idx = 0, step = 0;
        osc.connect(gain);
        osc.frequency.value = base[0];
        osc.start();
        this.musicOsc = osc;
        this.musicGain = gain;
        this.musicPlaying = true;
        // Arpeggiated loop
        this.musicTimer = setInterval(() => {
            osc.frequency.value = base[idx];
            idx = (idx + 1) % base.length;
            step++;
            if (step % 14 === 0) {
                osc.frequency.value += Math.random() > 0.6 ? 60 : 0;
            }
        }, 370);
    }

    stopMusic() {
        if (this.musicOsc) {
            this.musicOsc.stop();
            this.musicOsc.disconnect();
            this.musicOsc = null;
        }
        if (this.musicGain) {
            this.musicGain.disconnect();
            this.musicGain = null;
        }
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
        this.musicPlaying = false;
    }
}

window.AudioManager = AudioManager;