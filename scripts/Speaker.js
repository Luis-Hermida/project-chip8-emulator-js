// Try to connect it without using gain - Gain is for volume control
// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createOscillator

export default class Speaker {
  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();

    // Create a gain to control the volume
    this.gain = this.audioContext.createGain();
    this.oscillatorNode = audioCtx.createOscillator();
    this.gainNode = audioCtx.createGain();
    this.finish = audioCtx.destination;

    // Connect the oscillator to the context
    this.oscillatorNode.connect(this.finish);

    // Mute the audio (Example)
    // this.gain.setValueAtTime(0, this.audioCtx.currentTime);

    // Unmute the audio (Example)
    // this.gain.setValueAtTime(1, this.audioCtx.currentTime);
  }
}
