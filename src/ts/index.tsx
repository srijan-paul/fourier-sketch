import { CanvasSpace, PtLike } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h } from 'preact';

const space = new CanvasSpace('#canvas');
space.setup({ bgcolor: '#fafafa' });

const form = space.getForm();

class Graph {
  xScale: number = 10;
  yScale: number = 10;
  func: (x: number) => number;

  // min-x, max-x
  domain: [number, number] = [0, 1];
  // min-y, max-y
  range: [number, number] = [0, 1];

  // This knob controls ow "granular" the graph is.
  dx: number = 0.01

  // A cache of points in the graph
  private readonly pts: PtLike[] = []

  constructor(func: (x: number) => number) {
    this.func = func;
  }

  construct() {

  }

  plot(space: CanvasSpace) {
    
  }
}

function plotGraph(
  fun: (x: number) => number,
  range: [number, number] | [number, number, number | undefined]
): PtLike[] {
  const pts: PtLike[] = [];
  const incr = range[2] || 0.1;

  const origin = [space.width / 40, (2 * space.height) / 3];

  const scale = 30;
  for (let x = range[0]; x < range[1]; x += incr) {
    const y = fun(x);
    const px = origin[0] + x * scale;

    // "-" instead of "+" because the Y axis is upside down in most
    // graphics libraries, including pts.js
    const py = origin[1] - y * scale;
    pts.push([px, py]);
  }

  return pts;
}

let cachedWave: PtLike[] | undefined;
function getPeriodicWave(fn: (x: number) => number): PtLike[] {
  cachedWave = cachedWave || plotGraph(fn, [0, (7 * Math.PI) / 2]);
  return cachedWave;
}

space.add(time => {
  space.clear();
  form.stroke('#fd79a8', 3);

  const points = getPeriodicWave(x => x - Math.ceil(x));
  for (let i = 1; i < points.length; ++i) {
    form.line([points[i - 1], points[i]]);
  }
});

space.play();

render(
  <div>
    <canvas id="canvas" width={400} height={400}></canvas>
  </div>,
  document.body
);
