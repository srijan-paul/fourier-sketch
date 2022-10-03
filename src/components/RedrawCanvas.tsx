// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { zip } from 'lodash';
import { h, JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { CanvasSpace, PtLike } from 'pts';
import { approximateFunc, FourierCoeffs } from '../math/fourier';
import { evaluatePolarFunc, PolarFun, toPolarFuncs } from '../math/util';

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

    const updateCircles = (vectors: PolarFun[], t: number, center: PtLike, offset: number[]) => {
      const cumSum: PtLike = [0, 0];
      for (const v of vectors) {
        const [oldx, oldy] = cumSum;
        const [x, y] = evaluatePolarFunc(cumSum, v, t);
        [cumSum[0], cumSum[1]] = [x, y];

        if (!(offset[0] && offset[1])) {
          offset[0] = center[0] - x;
          offset[1] = center[1] - y;
        }

        if (oldx === 0 && oldy === 0) continue;

        form.stroke('#0984e3', 1);
        form.fill(false);
        const linePts = [
          [oldx + offset[0], oldy + offset[1]],
          [x + offset[0], y + offset[1]],
        ];
        form.circle([[oldx + offset[0], oldy + offset[1]], [v.radius]]);
        form.line(linePts);
        form.stroke('green');
        form.circle([linePts[1], [2]]);
      }
      return cumSum;
    };

    let points: PtLike[] = [];
    const xEpicycles = toPolarFuncs(xCoeffs).sort((a, b) => (b.radius - a.radius));
    const yEpicycles = toPolarFuncs(yCoeffs).sort((a, b) => (b.radius - a.radius));
    const xEpicycleCenter = [width / 5, (5 * height) / 6];
    const yEpicycleCenter = [(4 * width) / 5, height / 6];

    const xOffset: number[] = [];
    const yOffset: number[] = [];

    const updateTrace = (t: number) => {
      if (t === 0) points = [];

      const xVec = updateCircles(xEpicycles, t, xEpicycleCenter, xOffset);
      const yVec = updateCircles(yEpicycles, t, yEpicycleCenter, yOffset);
      const currentPoint = [xVec[0], yVec[0]];
      form.line([[xVec[0] + xOffset[0], xVec[1] + xOffset[1]], currentPoint]);
      form.line([[yVec[0] + yOffset[0], yVec[1] + yOffset[1]], currentPoint]);

      points.push([xVec[0], yVec[0]]);
    };

    const dt = 0.003;
    let t = 0;
    const update = () => {
      updateTrace(t);
      t += dt;
      if (t > 1) t = 0;
    };

    space.add(update);

    space.add(() => {
      form.stroke('purple', 2);
      for (let i = 1; i < points.length; ++i) {
        form.line([points[i - 1], points[i]]);
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
