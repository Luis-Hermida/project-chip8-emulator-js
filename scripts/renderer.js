export default class Renderer {
  constructor(scale) {
    this.columns = 64;
    this.rows = 32;
    this.scale = scale;

    // Canvas
    this.canvas = document.querySelector("canvas");
    this.canvasContext = this.canvas.getContext("2d");
    this.canvas.width = this.columns * this.scale;
    this.canvas.height = this.rows * this.scale;

    this.display = new Array(this.columns * this.rows);
  }

  setPixel(x, y) {
    // If column/row values are out of bound we need to wrap around them
    if (x > this.columns) x -= this.columns;
    else if (x < 0) x += this.columns;
    if (y > this.rows) y -= this.rows;
    else if (y < 0) y += this.rows;

    console.log(x);

    let pixelLocation = x + y * this.columns;

    console.log(pixelLocation);
    console.log(this.display);
    // XOR - Toggle between 1 and 0
    this.display[pixelLocation] ^= 1;
    // Return true if a pixel was erased and false if not
    return this.display[pixelLocation] != 1;
  }

  clear() {
    this.display = new Array(this.columns * this.rows);
  }

  render() {
    // Paint all canvas to #000 (Default fillStyle)
    this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let index = 0; index < this.columns * this.rows; index++) {
      // Grabs the x position of the pixel based off of `i`
      let x = (index % this.columns) * this.scale;
      // Grabs the y position of the pixel based off of `i`
      let y = Math.floor(index / this.columns) * this.scale;

      if (this.display[index] === 1) {
        // Place a pixel at position (x, y) with a width and height of scale if this.display[i] === 1
        this.canvasContext.fillStyle = "#9bbc0f";
        this.canvasContext.fillRect(x, y, this.scale, this.scale);
      }
    }
  }

  testRender() {
    // Testing Max values
    // this.setPixel(0, 0);
    // this.setPixel(63, 0);

    // this.setPixel(0, 31);
    // this.setPixel(63, 31);
    this.setPixel(63, 31);

    // Testing out of bonds
    // this.setPixel(-64, 33);
    // this.setPixel(-1, 33);
    // this.setPixel(-1, 62);
    // this.setPixel(64, 62);
    this.render();
    this.clear();
  }
}
