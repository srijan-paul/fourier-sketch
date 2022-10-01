import { CanvasSpace, PtLike } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h, JSX } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
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

  space.bindCanvas('mousedown', () => {
    console.log('foo');
  });

  space.play();
}

function Canvas({ width, height }: { width: number; height: number }): JSX.Element {
  return <canvas id="canvas" width={width} height={height}></canvas>;
}

function initDrawCanvas(id: string): CanvasSpace {
  const space = new CanvasSpace(id);
  space.setup({ bgcolor: '#fafafa' });
  space.bindMouse();

  let isMousePressed = false;
  space.bindCanvas('mousedown', () => (isMousePressed = true));
  space.bindCanvas('mouseup', () => (isMousePressed = false));

  const pointsInCurve: PtLike[] = [];
  let prevTime = -Infinity;
  const captureIntervalMs = 150;
  const captureMousePosition = (time: number | undefined) => {
    if (!time || !isMousePressed) return;
    const dt = time - prevTime;
    if (dt >= captureIntervalMs) {
      prevTime = time;
      const { pointer } = space;
      pointsInCurve.push(pointer);
    }
  };

  space.add(captureMousePosition);
  return space;
}

function DrawCanvas(props: { width: number; height: number }): JSX.Element {
  const [space, setSpace] = useState<CanvasSpace>();

  // When the component mounts on the DOM, instantiate the space.
  useEffect(() => {
    setSpace(initDrawCanvas('draw-canvas'));
    space?.play();
  }, []);

  // Once the space is instantiated, stat playing
  useEffect(() => {
    space?.play();
  }, [space]);

  const pauseCanvas = useCallback(() => space?.pause(), []);
  const playCanvas = useCallback(() => space?.play(), []);

  return (
    <canvas
      id="draw-canvas"
      width={props.width}
      height={props.height}
      onMouseOut={pauseCanvas}
      onMouseUp={pauseCanvas}
      onMouseDown={playCanvas}
    ></canvas>
  );
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

      <DrawCanvas width={400} height={500} />

      {/* Recreation canvas */}
    </div>
  );
}

render(<App />, document.body);
