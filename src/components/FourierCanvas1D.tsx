import { useEffect, useRef, useState } from 'preact/hooks';
import { Bound, CanvasSpace, Pt } from 'pts';
import Graph, { FuncPlot } from '../graphics/graph';
// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h, JSX } from 'preact';
import { Fun } from '../math/util';
import decompose, { approximateFunc } from '../math/fourier';

/**
 * @param funcs List of functions to plot.
 * @returns A `Graph` object.
 */
function makeGraph(
  funcs: FuncPlot[] | FuncPlot,
  width: number,
  height: number
): Graph {
  return new Graph(funcs, {
    width: width,
    height: height,
    domain: [-1, 1],
    range: [-2, 2],
  });
}

export function FourierCanvas1D(props: {
  width: number;
  height: number;
  func: Fun;
  approxFunc: Fun;
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [space, setSpace] = useState<CanvasSpace>();

  useEffect(() => {
    if (!canvasRef.current) throw new Error('1D fourier canvas not found.');

    const newSpace = new CanvasSpace(canvasRef.current);
    newSpace.resize(new Bound(new Pt([props.width, props.height])));
    newSpace.setup({ bgcolor: '#fafafa' });

    const funcPlots = [
      { fun: props.func, color: '#e84118' },
      { fun: props.approxFunc, color: '#40739e' },
    ];
    const newGraph = makeGraph(funcPlots, props.width, props.height);
    const form = newSpace.getForm();

    newSpace.add(() => newGraph.plot(form));
    newSpace.playOnce();

    setSpace(oldSpace => {
      oldSpace?.dispose();
      oldSpace?.removeAll();
      return newSpace;
    });

    return () => space?.dispose();
  }, [props.func, props.approxFunc]);

  return <canvas ref={canvasRef} width={props.width} height={props.height}></canvas>;
}

export default function Fourier1DGraph(props: {
  width: number;
  height: number;
  func: Fun;
}): JSX.Element {
  const sliderRef = useRef<HTMLInputElement>(null);

  // number of terms to take from the fourier series.
  const [n, setN] = useState(6);

  const computeFunction = (n: number) => {
    const approx = approximateFunc(decompose(props.func, n));
    const periodicApprox = (x: number) => {
      if (!(x >= 0 && x <= 1)) {
        x = x - Math.floor(x);
      }
      return approx(x);
    };
    return periodicApprox;
  };

  const [approxFn, setApprox] = useState<Fun>(() => computeFunction(n));

  // when the slider changes it's value, we recompute the fourier series
  // using the new value of N.
  const handleSliderChange = (e: Event) => {
    e.preventDefault();
    const value = sliderRef.current?.value;
    if (typeof value === 'undefined') return;
    const newN = parseInt(value);
    if (isNaN(newN)) throw new Error('Bad slider value.');
    setN(newN);
    const newApproxFun = computeFunction(newN);
    setApprox(() => newApproxFun);
  };

  return (
    <p className="fourier-1d-graph">
      <FourierCanvas1D
        width={props.width}
        height={props.height}
        func={props.func}
        approxFunc={approxFn}
      />
      <br />
      <div className="controls" style={{ display: 'flex', gap: '2rem' }}>
        <input
          type="range"
          min="1"
          max="50"
          value={n}
          class="slider"
          id="myRange"
          ref={sliderRef}
          onInput={handleSliderChange}
          style={{width: '400px'}}
        ></input>
      </div>
      Using <b>{n}</b> {n <= 1 ? 'term' : 'terms'} from the Fourier series.
    </p>
  );
}
