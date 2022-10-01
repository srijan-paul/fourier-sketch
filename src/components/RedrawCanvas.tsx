// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { Sketch } from './DrawCanvas';
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
  sketch: Sketch;
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
