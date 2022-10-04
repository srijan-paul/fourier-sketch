// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { CanvasSpace, PtLike } from 'pts';
import { FourierCoeffs } from '../math/fourier';
import { evaluatePolarFunc, PolarFun, toPolarFuncs } from '../math/util';

const enum Axis {
  X = 0,
  Y = 1,
}

/**
 * Initialiaze the canvas on which a 2D sketch is going to be retraced.
 * @param width Width of the CanvasSpace
 * @param height Height of the CanvasSpace
 * @param space The CanvasSpace to draw on
 * @param coeffs The fourier sine and cosine coefficients for the X and Y traces.
 */
function initTrace(
  width: number,
  height: number,
  space: CanvasSpace,
  coeffs: {
    x: FourierCoeffs;
    y: FourierCoeffs;
  }
) {
  space.setup({ bgcolor: '#fafafa' });
  const form = space.getForm();

  const { x: xCoeffs, y: yCoeffs } = coeffs;

  const updateCircles = (
    vectors: PolarFun[],
    t: number,
    positionOnShiftAxis: number,
    offset: number[],
    axis: Axis
  ) => {
    // The epicycles that trace the Y-coordinate are offset on the X-axis
    // and vice versa. If I offset an epicycle set in both axes, the lines
    // connecting the tip of the vector-sum to the current coordinate in the
    // curve won't be aligned with one of the coordinate axes.
    // Just a small visual difference.
    const shiftAxis = axis === Axis.X ? Axis.Y : Axis.X;

    const runningSum: PtLike = [0, 0];
    for (const v of vectors) {
      const [oldx, oldy] = runningSum;
      const [x, y] = evaluatePolarFunc(runningSum, v, t);

      [runningSum[0], runningSum[1]] = [x, y];

      if (typeof offset[shiftAxis] !== 'number') {
        offset[shiftAxis] = positionOnShiftAxis - runningSum[shiftAxis];

        // Unlike pen-paper math, the Y axis runs top-to-bottom in
        // most graphics libraries, so we multiply the offset by -1
        // since we want to shift it down.
        if (shiftAxis === Axis.X) offset[shiftAxis] *= -1;
      }

      if (oldx === 0 && oldy === 0) continue;

      form.stroke('gray', 1);
      form.fill(false);

      const linePts = [
        [oldx, oldy],
        [x, y],
      ];

      if (axis == 1) {
        linePts[0] = [oldy, oldx];
        linePts[1] = [y, x];
      }

      const circleCenter = axis === 0 ? [oldx, oldy] : [oldy, oldx];

      linePts[0][shiftAxis] += offset[shiftAxis];
      linePts[1][shiftAxis] += offset[shiftAxis];
      circleCenter[shiftAxis] += offset[shiftAxis];

      form.circle([circleCenter, [v.radius]]);
      form.stroke('black', 1.5);

      form.line(linePts);
      form.circle([linePts[1], [2]]);
    }
    return runningSum;
  };

  let points: PtLike[] = [];
  const xEpicycles = toPolarFuncs(xCoeffs).sort((a, b) => b.radius - a.radius);
  const yEpicycles = toPolarFuncs(yCoeffs).sort((a, b) => b.radius - a.radius);

  const xEpicycleOffset: number[] = [];
  const yEpicycleOffset: number[] = [];

  const xEpicycleCenter = height / 6;
  const yEpicycleCenter = 0.25 * width;
  const updateTrace = (t: number) => {
    if (t === 0) points = [];

    const xVec = updateCircles(
      xEpicycles,
      t,
      xEpicycleCenter,
      xEpicycleOffset,
      Axis.X
    );
    const yVec = updateCircles(
      yEpicycles,
      t,
      yEpicycleCenter,
      yEpicycleOffset,
      Axis.Y
    ).reverse();
    const currentPoint = [xVec[0], yVec[1]];

    // Draw 2 lines joining the tip of each epicycle vector sum to the current point
    // in the trace.
    form.dash();
    form.line([[xVec[0], xVec[1] + xEpicycleOffset[1]], currentPoint]);
    form.line([[yVec[0] + yEpicycleOffset[0], yVec[1]], currentPoint]);
    form.dash(false);

    points.push(currentPoint);
  };

  const dt = 0.002;
  let t = 0;
  const update = () => {
    updateTrace(t);
    t += dt;
    if (t > 1) t = 0;
  };

  space.add(update);

  space.add(() => {
    form.stroke('#eb3b5a', 2);
    for (let i = 1; i < points.length; ++i) {
      form.line([points[i - 1], points[i]]);
    }
  });

  space.play();
}

/**
 * A canvas that traces a curve, the fourier series of which is
 * defined by the [coeffs] prop.
 */
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

  const [space, setSpace] = useState<CanvasSpace>();

  useEffect(() => {
    if (startTrace && coeffs && canvasRef.current) {
      const space = new CanvasSpace(canvasRef.current);
      space.setup({ bgcolor: '#fafafa' });
      initTrace(width, height, space, coeffs);
      setSpace(space);
    }
  }, [coeffs, startTrace, canvasRef]);

  // When the component is unmounted, dispose of the space.
  useEffect(() => () => {
    space?.pause();
    space?.dispose();
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </div>
  );
}
