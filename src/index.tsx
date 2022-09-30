import { CanvasSpace } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h, JSX } from 'preact';
import Graph, { FuncPlot } from './graphics/graph';
import decompose, { approximateFunc } from './math/fourier';

const space = new CanvasSpace('#canvas');
space.setup({ bgcolor: '#fafafa' });

const form = space.getForm();

function makeGraph(func: FuncPlot[] | FuncPlot): Graph {
  return new Graph(func, {
    width: space.width,
    height: space.height,
    domain: [-2, 2],
    range: [-2, 2],
  });
}

let graph: Graph | undefined;

const actual = (x: number) => Math.sign(Math.sin(2 * Math.PI * x));
const fourierCoeffs = decompose(actual, 50);
const approx = approximateFunc(fourierCoeffs);

const periodicApprox = (x: number) => {
  if (!(x >= 0 && x <= 1)) {
    x = x - Math.floor(x);
  }
  return approx(x);
};

space.add(() => {
  space.clear();
  if (!graph)
    graph = makeGraph([
      {
        fun: actual,
        color: 'red',
      },
      {
        fun: periodicApprox,
        color: 'blue',
      },
    ]);
  graph.plot(form);
});

space.play();

function Canvas({ width, height }: { width: number; height: number }): JSX.Element {
  return <canvas id="canvas" width={width} height={height}></canvas>;
}

render(
  <div class="root">
    <Canvas width={400} height={400} />
  </div>,
  document.body
);
