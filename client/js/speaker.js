// Try to connect it without using gain - Gain is for volume control
// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createOscillator

export default class Speaker {
  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();

    // Create a gain to control the volume
    this.gain = this.audioContext.createGain();

    // Connect the oscillator to the context
    this.gain.connect(this.audioContext.destination);
    this.gain.gain.value = 0.5;

    // Mute the audio (Example)
    // this.gain.setValueAtTime(0, this.audioContext.currentTime);

    // Unmute the audio (Example)
    // this.gain.setValueAtTime(1, this.audioContext.currentTime);
  }

  // Plays a sound at the desired frequency
  playSound(frecuency) {
    if (this.audioContext && !this.oscillatorNode) {
      this.oscillatorNode = this.audioContext.createOscillator();

      // Using a square wave
      this.oscillatorNode.type = "square";
      // Set the frecuency - value in hertz
      this.oscillatorNode.frequency.setValueAtTime(
        frecuency || 440,
        this.audioContext.currentTime
      );

      // Connect the gain and start the sound
      this.oscillatorNode.connect(this.gain);
      this.oscillatorNode.start();
    }
  }

  stop() {
    if (this.oscillatorNode) {
      this.oscillatorNode.stop();
      this.oscillatorNode.disconnect();
      this.oscillatorNode = null;
    }
  }

  onChangeVolume(volume) {
    this.gain.gain.value = volume / 100;
  }
}
