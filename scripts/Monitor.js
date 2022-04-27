const columns = 64; // x
const rows = 32; // y
const scale = 15;

export default class Monitor {
  constructor(canvas) {
    this.columns = columns;
    this.rows = rows;
    this.scale = scale;
    this.display = new Array(this.columns * this.rows);

    // Canvas
    this.canvas = canvas;
    this.canvas.width = this.columns * this.scale;
    this.canvas.height = this.rows * this.scale;
    this.canvasContext = this.canvas.getContext("2d");
  }

  setPixel(x, y) {
    // If column/row values are out of bound we need to wrap around them
    if (x > this.cols) x -= this.cols;
    else if (x < 0) x += this.cols;
    if (y > this.rows) y -= this.rows;
    else if (y < 0) y += this.rows;

    this.display[x + y * this.columns] ^= 1;
    return this.display[x + y * this.columns] != 1;
  }

  clear() {
    this.display = new Array(this.columns * this.rows);
  }

  paint() {
    // Paint all canvas to #000
    this.canvasContext.fillStyle = "#000";
    this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let index = 0; index < this.columns * this.rows; index++) {
      let x = (index % this.columns) * this.scale;
      let y = Math.floor(index / this.columns) * this.scale;

      if (this.display[index] === 1) {
        // Paint on N if value is 1 and we multiply by scale to paint x15 to represent a pixel
        this.canvasContext.fillStyle = "#FFF";
        this.canvasContext.fillRect(x, y, this.scale, this.scale);
      }
    }
  }

  testRender() {
    // Testing Max values
    this.setPixel(0, 0);
    this.setPixel(63, 0);
    this.setPixel(0, 31);
    this.setPixel(63, 31);

    // Testing out of bonds
    // this.setPixel(-64, 33);
    // this.setPixel(-1, 33);
    // this.setPixel(-1, 62);
    // this.setPixel(64, 62);
    this.paint();
    this.clear();
  }
}
