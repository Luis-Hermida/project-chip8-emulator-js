const columns = 64;
const rows = 32;
const scale = 15;

export default class Monitor {
  constructor(canvas) {
    this.columns = columns;
    this.rows = rows;
    this.scale = scale;
    this.display = new Array(this.cols * this.rows);

    // Canvas
    this.canvas = this.canvas.getContext("2d");
  }

  setPixel(x, y) {}
}
