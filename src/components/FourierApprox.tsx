// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
// import { useCallback, useEffect, useState } from 'preact/hooks';
import DrawCanvas2D, { Sketch } from './DrawCanvas';
import decompose, { FourierCoeffs } from '../math/fourier';
import RedrawCanvas from './RedrawCanvas';
import { vectorToFunc } from '../math/util';
import { useCallback, useState } from 'preact/hooks';

export default function FourierApprox(): JSX.Element {
  const sketch: Sketch = { points: [] };
  // let fourierCoeffs: FourierCoeffs = { sine: [], cosine: [] };
  const [startTrace, setTrace] = useState(false);

  const [coeffs, setCoeffs] = useState<{ x: FourierCoeffs; y: FourierCoeffs } | undefined>();

  const handleClick = useCallback(() => {
    const { points } = sketch;
    const xs = points.map(pt => pt[0]);
    const ys = points.map(pt => pt[1]);

    const xFunc = vectorToFunc(xs);
    const yFunc = vectorToFunc(ys);

    const xFourierCoeffs = decompose(xFunc, 32, 1);
    const yFourierCoeffs = decompose(yFunc, 32, 1);

    setCoeffs({ x: xFourierCoeffs, y: yFourierCoeffs });
    setTrace(true);
  }, []);

  return (
    <div className="fourier-approx">
      <DrawCanvas2D width={400} height={400} sketch={sketch} />
      <button className="button-primary" onClick={handleClick}>
        Trace
      </button>
      <RedrawCanvas
        width={400}
        height={400}
        startTrace={startTrace}
        coeffs={coeffs}
      />
    </div>
  );
}
