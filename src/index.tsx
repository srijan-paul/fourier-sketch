import { CanvasSpace } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h, JSX } from 'preact';
import { useEffect } from 'preact/hooks';
import Graph, { FuncPlot } from './graphics/graph';
import decompose, { approximateFunc } from './math/fourier';

/**
 * Renders a graph of [funcsToPlot] on a regular HTML canvas with id [id].
 */
function makeGraphCanvas(id: string, funcsToPlot: FuncPlot[]) {
  const space = new CanvasSpace(`#${id}`);
  space.setup({ bgcolor: '#fafafa' });

  const form = space.getForm();

  /**
   * @param funcs List of functions to plot.
   * @returns A `Graph` object.
   */
  const makeGraph = (funcs: FuncPlot[] | FuncPlot): Graph => {
    return new Graph(funcs, {
      width: space.width,
      height: space.height,
      domain: [-2, 2],
      range: [-2, 2],
    });
  };

  let graph: Graph | undefined;

  space.add(() => {
    space.clear();
    if (!graph) graph = makeGraph(funcsToPlot);
    graph.plot(form);
  });

  space.play();
}

function Canvas({ width, height }: { width: number; height: number }): JSX.Element {
  return <canvas id="canvas" width={width} height={height}></canvas>;
}

// Some functions to try:
// Math.sin(2 * Math.PI * x)
// Math.sign(Math.sin(2 * Math.PI * x))
// Math.sin(2 * Math.PI * x)  + Math.sign(Math.cos(2 * Math.PI * x))

const actual = (x: number) => Math.sign(Math.cos(2 * Math.PI * x));
const fourierCoeffs = decompose(actual, 10);
const approx = approximateFunc(fourierCoeffs);

const periodicApprox = (x: number) => {
  if (!(x >= 0 && x <= 1)) {
    x = x - Math.floor(x);
  }
  return approx(x);
};

function App() {
  useEffect(() => {
    makeGraphCanvas('canvas', [
      {
        fun: actual,
        color: 'red',
      },
      {
        fun: periodicApprox,
        color: 'blue',
      },
    ]);
  });

  return (
    <div id="root">
      <Canvas width={400} height={400} />
      {/* Drawing canvas */}

      {/* Recreation canvas */}
    </div>
  );
}

render(<App />, document.body);
