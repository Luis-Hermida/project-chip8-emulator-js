export default class Renderer {
  constructor(scale) {
    /*
    //////////////////////////////////////
    // (0,0)                     (63,3) //
    //                                  //
    // (0, 31)                 (63, 31) //
    //////////////////////////////////////
    */
    this.columns = 64; // x
    this.rows = 32; // y
    this.scale = scale; // For scaling the canvas - (x * y) * (n)

    // Canvas
    this.canvas = document.querySelector("canvas");
    this.canvasContext = this.canvas.getContext("2d");
    this.canvas.width = this.columns * this.scale;
    this.canvas.height = this.rows * this.scale;

    this.display = new Array(this.columns * this.rows);
  }

  setPixel(x, y) {
    // If column/row values are out of bound we need to wrap around them (Chip-8 specification).
    if (x > this.columns) x -= this.columns;
    else if (x < 0) x += this.columns;
    if (y > this.rows) y -= this.rows;
    else if (y < 0) y += this.rows;

    // Mimic our 1 dimensional array with the values of rows and columns
    let pixelLocation = x + y * this.columns;
    // XOR - Toggle between 1 and 0
    this.display[pixelLocation] ^= 1;
    // Return true if a pixel was erased and false if not - (0 is falsy)
    return !this.display[pixelLocation];
  }

  clear() {
    this.display = new Array(this.columns * this.rows);
  }

  render() {
    // Clears the display every render cycle. Typical for a render loop.
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let index = 0; index < this.columns * this.rows; index++) {
      // If the pixel is 1 we want to draw green
      if (this.display[index] === 1) {
        // We are getting each position on the canvas mathematically by
        // getting the fractions of x (0 to 63) % 64   (1, 2, 3, .... 63)
        // and y (0 to 31) % 32   (0, 0.015625 .... 32.9)
        // and multiplying each coordinate by the scale value
        let x = (index % this.columns) * this.scale;
        let y = Math.floor(index / this.columns) * this.scale;

        // Place a pixel at position (x, y) with a width and height of scale if this.display[i] === 1
        this.canvasContext.fillStyle = "#9bbc0f";
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
  }
}
