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

function Canvas({
  width,
  height,
  fns,
}: {
  width: number;
  height: number;
  fns: FuncPlot[];
}): JSX.Element {
  useEffect(() => {
    makeGraphCanvas('canvas', fns);
  }, []);

  return <canvas id="canvas" width={width} height={height}></canvas>;
}

function initDrawCanvas(id: string): CanvasSpace {
  const space = new CanvasSpace(id);
  space.setup({ bgcolor: '#fafafa' });
  space.bindMouse();

  let pointsInCurve: PtLike[] = [];
  let isMousePressed = false;
  space.bindCanvas('mousedown', () => {
    isMousePressed = true;
    space.clear();
  });

  space.bindCanvas('mouseup', () => {
    isMousePressed = false;
    pointsInCurve = [];
  });

  let prevTime = -Infinity;
  const captureIntervalMs = 25;
  const captureMousePosition = (time: number | undefined) => {
    if (!time || !isMousePressed) return;
    const dt = time - prevTime;
    if (dt >= captureIntervalMs) {
      prevTime = time;
      const { pointer } = space;
      pointsInCurve.push(pointer);
    }
  };

  const form = space.getForm();
  const renderCurve = () => {
    form.stroke('#40739e', 2);
    for (let i = 1; i < pointsInCurve.length; ++i) {
      const pt = pointsInCurve[i];
      const prevPt = pointsInCurve[i - 1];
      form.line([prevPt, pt]);
    }
  };

  space.add(captureMousePosition);
  space.add(renderCurve);
  return space;
}

function DrawCanvas(props: { width: number; height: number }): JSX.Element {
  const [space, setSpace] = useState<CanvasSpace>();

  // When the component mounts on the DOM, instantiate the space.
  useEffect(() => setSpace(initDrawCanvas('draw-canvas')), []);

  // Once the space is instantiated, stat playing
  useEffect(() => {
    space?.play();
    space?.pause();
  }, [space]);

  const playCanvas = useCallback(() => space?.resume(), [space]);
  const pauseCanvas = useCallback(() => space?.pause(), [space]);

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
  const plots = [
    {
      fun: actual,
      color: '#e84118',
    },
    {
      fun: periodicApprox,
      color: '#40739e',
    },
  ];

  return (
    <div id="root">
      {/* <Canvas width={400} height={400} fns={plots} /> */}
      {/* Drawing canvas */}

      <p>
        <DrawCanvas width={400} height={500} />
        <br />
        <button>Animate</button>
      </p>

      {/* Recreation canvas */}
    </div>
  );
}

render(<App />, document.body);
