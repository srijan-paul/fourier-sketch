// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { zip } from 'lodash';
import { h, JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { CanvasSpace, PtLike } from 'pts';
import { approximateFunc, FourierCoeffs } from '../math/fourier';

export default function RedrawCanvas({
  width,
  height,
  startTrace,
  coeffs,
}: {
  width: number;
  height: number;
  startTrace: boolean;
  coeffs?: { x: FourierCoeffs; y: FourierCoeffs };
}): JSX.Element {
  const canvasRef = useRef(null);

  const initTrace = () => {
    if (!(startTrace && coeffs)) return;
    if (!canvasRef.current) throw new Error('Redraw canvas not initialized.');
    const space = new CanvasSpace(canvasRef.current);
    const form = space.getForm();

    const { x: xCoeffs, y: yCoeffs } = coeffs;
    const xFunc = approximateFunc(xCoeffs);
    const yFunc = approximateFunc(yCoeffs);

    const pts: PtLike[] = [];
    for (let t = 0; t < 1; t += 0.01) {
      pts.push([xFunc(t), yFunc(t)]);
    }

    /**
     * A `PolarVector` describes a circles radius, phase and index (frequency).
     */
    type PolarVector = { radius: number; phase: number; freq: number };

    /**
     * Converts a fourier series coefficient and frequency (a, b, n) to a vector
     * that traces out an epicycle.
     * @param coeffs The fourier cosine and sine coefficients.
     * @param i Frequency of the wave.
     * @returns A vector describing an epicyle corresponding to the `n`th term in the fourier series.
     */
    const toCircleVector = (
      [a, b]: [number | undefined, number | undefined],
      i: number
    ): PolarVector => {
      if (typeof a !== 'number' || typeof b !== 'number')
        throw new Error('Impossible code point reached.');
      const radius = Math.sqrt(a ** 2 + b ** 2);
      const phase = Math.atan2(b, a);
      return { radius, phase, freq: i };
    };

    // Vectors that trace the X-coordinate of the sketch.
    const xVectors = zip(coeffs.x.cosine, coeffs.x.sine).map(toCircleVector);
    // Vectors that trace the Y-coordinate of the sketch.
    const yVectors = zip(coeffs.y.cosine, coeffs.y.sine).map(toCircleVector);

    const updateCircles = (vectors: PolarVector[], offset: PtLike = [0, 0]) => {
      const vectorSum: PtLike = [0, 0];
      for (const { radius, phase, freq } of vectors) {
        const [oldx, oldy] = vectorSum;
        const x = oldx + radius * Math.cos(freq * t + phase);
        const y = oldy + radius * Math.sin(freq * t + phase);

        vectorSum[0] = x;
        vectorSum[1] = y;

        // if (oldx === 0 && oldy === 0) continue;

        form.stroke('#0984e3', 1);
        form.fill(false);
        form.line([
          [oldx + offset[0], oldy + offset[1]],
          [x + offset[0], y + offset[1]],
        ]);
        form.circle([[oldx + offset[0], oldy + offset[1]], [radius]]);
      }
      return vectorSum;
    };

    let points: PtLike[] = [];
    const updateTrace = (t: number) => {
      if (t % 1 === 0) points = [];

      const xVectorTip = updateCircles(xVectors);
      const yVectorTip = updateCircles(yVectors);
      points.push([xVectorTip[0], yVectorTip[1]]);

      form.stroke('purple', 2);
      for (let i = 1; i < points.length; ++i) {
        form.line([points[i - 1], points[i]]);
      }
    };

    const dt = 0.01;
    let t = 0;
    const update = () => {
      updateTrace(t);
      t += dt;
      // if (t > 1) t = 0;
    };

    space.add(update);

    space.add(() => {
      form.stroke('red', 2);
      for (let i = 1; i < pts.length; ++i) {
        form.line([pts[i - 1], pts[i]]);
      }
    });

    space.play();
  };

  useEffect(initTrace, [coeffs, startTrace]);

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </div>
  );
}
