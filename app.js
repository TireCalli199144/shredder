const canvasSketch = require("canvas-sketch");

let SimplexNoise = require("simplex-noise");
simplex = new SimplexNoise(Math.random);

const settings = {
  animate: true,
  duration: 10,
  dimensions: [1080, 1920],
  fps: 36,
};

const sketch = ({ width, height }) => {
  let rows = 150;
  let cols = 100;
  let size = width / cols;
  let period = 100;
  let floor = 700;

  let image = Array.from(Array(100), () => new Array(100));
  let randoms = Array.from(Array(cols), () => new Array(rows));
  let img = new Image();
  let grid = [];

  img.onload = function () {
    let canv = document.createElement("canvas");
    let ctx = canv.getContext("2d");
    canv.width = 100;
    canv.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);
    let data = ctx.getImageData(0, 0, 100, 100);
    for (let i = 0; i < data.data.length; i = i + 4) {
      let x = (i / 4) % 100;
      let y = Math.floor(i / 4 / 100);
      image[x][y] = data.data[i];
    }
    // image loading here
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < period; j++) {
        randoms[i][j] = Math.random() * 0.3 + 0.7 * (1 - image[i][j] / 255);
      }
    }
    class Dot {
      constructor(x, y, row, col, random) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.col = col;
        this.random = random;
        this.max =
          floor +
          100 * simplex.noise2D(this.x / 150, 0) +
          20 * Math.sin(this.y);
        this.actualSize = size * this.random;
        this.angle = Math.PI * Math.random();
      }
      draw(context, progress) {
        if (progress < 0) {
          context.fillStyle = "white";
          context.save();
          context.translate(this.x + size / 2, this.y + size / 2);
          context.fillRect(
            -this.actualSize / 2,
            -this.actualSize / 2,
            this.actualSize,
            this.actualSize
          );
          context.restore();
        } else {
          let shift = 500 * this.random * progress;
          let shitfX = shift * Math.sin(this.angle);
          let shitfY = shift * Math.cos(this.angle);
          context.fillStyle = "rgba(255,255,255," + (1 - progress) + ")";
          context.save();
          context.translate(this.x + size / 2, this.y + size / 2 + shift);
          context.fillRect(
            -this.actualSize / 2 + shitfX,
            -this.actualSize / 2 + shitfY,
            this.actualSize * 0.5,
            this.actualSize * 0.5
          );
          context.fillRect(
            -this.actualSize / 2 - shitfX,
            -this.actualSize / 2 + shitfY,
            this.actualSize * 0.5,
            this.actualSize * 0.5
          );
          context.restore();
        }
      }
    }

    //end of class declaration

    for (let i = 10; i < cols - 10; i++) {
      for (let j = -period; j < rows; j++) {
        let rowPositive = (j + period * 2) % period;
        grid.push(new Dot(size * i, size * j, i, j, randoms[i][rowPositive]));
      }
    }
  };
  img.src = "./img.png";

  return ({ context, width, height, playhead }) => {
    let fromTheTop = period * size * playhead;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);

    // context.fillStyle = "red";
    // context.fillRect(0, floor, width, 10);

    context.fillStyle = "white";
    context.save();
    context.translate(0, fromTheTop);
    grid.forEach((d) => {
      if (fromTheTop + d.y > d.max) {
        let progress = (fromTheTop + d.y - d.max) / 200;
        d.draw(context, progress);
      } else {
        d.draw(context, -1);
      }
    });
    context.restore();
  };
};
canvasSketch(sketch, settings);
