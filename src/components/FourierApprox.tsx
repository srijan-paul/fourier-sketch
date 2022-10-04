// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
// import { useCallback, useEffect, useState } from 'preact/hooks';
import DrawCanvas2D, { Sketch } from './DrawCanvas';
import decompose, { FourierCoeffs } from '../math/fourier';
import RedrawCanvas from './RedrawCanvas';
import { vectorToFunc } from '../math/util';
import { useCallback, useState } from 'preact/hooks';

/**
 * A pair of two canvases, the first is for the user to draw in.
 * The second is where the drawing is retraced using fourier series.
 */
export default function FourierApprox(): JSX.Element {
  const sketch: Sketch = { points: [] };

  // When `startTrace` is set to true, we start tracing the curve.
  const [startTrace, setTrace] = useState(false);
  const [coeffs, setCoeffs] = useState<
    { x: FourierCoeffs; y: FourierCoeffs } | undefined
  >();

  const N = 50; // number of terms to take from the fourier series.
  const startSketch = useCallback(() => {
    const points = sketch.points; /*.map(([x, y]) => [x + 100, y + 100])*/
    const xs = points.map(pt => pt[0]);
    const ys = points.map(pt => pt[1]);

    const xFunc = vectorToFunc(xs);
    const yFunc = vectorToFunc(ys);

    const xFourierCoeffs = decompose(xFunc, N, 1);
    const yFourierCoeffs = decompose(yFunc, N, 1);

    setCoeffs({ x: xFourierCoeffs, y: yFourierCoeffs });
    setTrace(true);
  }, []);

  const [drawCanvasWidth, drawCanvasHeight] = [400, 400];
  const [fourierCanvasWidth, fourierCanvasHeight] = [400, 400];

  return (
    <div className="fourier-approx">
      <div
        className="fourier-canvases"
        style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}
      >
        <DrawCanvas2D
          width={drawCanvasWidth}
          height={drawCanvasHeight}
          sketch={sketch}
          startSketchFun={startSketch}
        />

        <RedrawCanvas
          width={fourierCanvasWidth}
          height={fourierCanvasHeight}
          startTrace={startTrace}
          coeffs={coeffs}
        />
      </div>
    </div>
  );
}
