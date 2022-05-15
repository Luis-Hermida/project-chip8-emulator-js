import Keyboard from "./keyboard.js";
import Renderer from "./renderer.js";
import Speaker from "./speaker.js";
import CPU from "./cpu.js";

const renderer = new Renderer(15);
const keyboard = new Keyboard();
const speaker = new Speaker();
const cpu = new CPU(renderer, keyboard, speaker);

let fps = 60;
let fpsInterval, startTime, now, then, elapsed;

const startAnimating = (fps, romName) => {
  fpsInterval = 1000 / fps;
  then = window.performance.now();
  startTime = then;

  cpu.loadSpritesIntoMemory();
  cpu.loadRom(romName);

  animate();
};

const animate = (newtime) => {
  // Calculate elapsed time since last loop
  now = newtime;
  elapsed = now - then;

  // if enough time has elapsed, draw the next frame
  if (elapsed > fpsInterval) {
    cpu.cycle();
    // Get ready for next frame by setting then=now, but
    // also adjust for fpsInterval
    then = now - (elapsed % fpsInterval);

    // Report seconds since start and achieved fps.
    // let sinceStart = now - startTime;
    // let currentFps =
    //   Math.round((1000 / (sinceStart / ++frameCount)) * 100) / 100;
    // document.getElementById("fps").textContent = currentFps + " FPS";
  }

  // Request another frame
  requestAnimationFrame(animate);
};

// Controls
// Volume
const volumeControlElement = document.getElementById("volumeControl");

volumeControlElement.addEventListener("change", (event) => {
  speaker.onChangeVolume(parseInt(event.target.value));
});

// Scale
const scaleControlElement = document.getElementById("scaleControl");

scaleControlElement.addEventListener("change", (event) => {
  renderer.onChangeScale(parseInt(event.target.value));
});

// Speed
const speedControlElement = document.getElementById("speedControl");

speedControlElement.addEventListener("change", (event) => {
  cpu.onChangeSpeed(parseInt(event.target.value));
});

// Rom selector
const romControlElement = document.getElementById("romControl");

romControlElement.addEventListener("change", (event) => {
  cpu.onClearCPU();
  startAnimating(fps, event.target.value);
});

startAnimating(fps, "BLITZ");
