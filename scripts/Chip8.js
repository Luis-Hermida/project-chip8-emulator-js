import Keyboard from "./Keyboard";
import Renderer from "./renderer";

const renderer = new Renderer(15);
const keyboard = new Keyboard();

let fps = 60;
let frameCount = 0;
let fpsInterval, startTime, now, then, elapsed;

const startAnimating = (fps) => {
  fpsInterval = 1000 / fps;
  then = window.performance.now();
  startTime = then;

  // TESTING CODE. REMOVE WHEN DONE TESTING.
  renderer.testRender();
  renderer.render();
  // END TESTING CODE

  animate();
};

const animate = (newtime) => {
  // Calculate elapsed time since last loop
  now = newtime;
  elapsed = now - then;

  // if enough time has elapsed, draw the next frame
  if (elapsed > fpsInterval) {
    // Get ready for next frame by setting then=now, but
    // also adjust for fpsInterval
    then = now - (elapsed % fpsInterval);

    // Report seconds since start and achieved fps.
    let sinceStart = now - startTime;
    let currentFps =
      Math.round((1000 / (sinceStart / ++frameCount)) * 100) / 100;
    document.getElementById("fps").textContent = currentFps + " fps.";
  }

  // Request another frame
  requestAnimationFrame(animate);
};

startAnimating(fps);
