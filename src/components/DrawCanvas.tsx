import { CanvasSpace, PtLike } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, JSX } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { signal } from '@preact/signals';

/**
 * A sketch drawn by the users.
 * Stores the points in the curve.
 */
export type Sketch = { points: PtLike[] };

export const sketchFinished = signal(false);

function initDrawCanvas(canvasElement: HTMLCanvasElement, sketchObj: Sketch): CanvasSpace {
  const space = new CanvasSpace(canvasElement);
  space.setup({ bgcolor: '#fafafa' });
  space.bindMouse();

  sketchObj.points = [];
  let isMousePressed = false;
  space.bindCanvas('mousedown', () => {
    isMousePressed = true;
    space.clear();
    sketchObj.points = [];
  });

  space.bindCanvas('mouseup', () => (isMousePressed = false));

  let prevTime = -Infinity;
  const captureIntervalMs = 25;
  const captureMousePosition = (time: number | undefined) => {
    if (!time || !isMousePressed) return;
    const dt = time - prevTime;
    if (dt >= captureIntervalMs) {
      prevTime = time;
      const { pointer } = space;
      sketchObj.points.push(pointer);
    }
  };

  const form = space.getForm();
  const renderCurve = () => {
    form.stroke('#40739e', 2);
    const pointsInCurve = sketchObj.points;
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

// export function DrawCanvas1D(props:{}): JSX.Element {
//   const canvasRef = useRef(null);
//   return <canvas ref={canvasRef}></canvas>;
// }

/**
 * @param props width and height of the canvas
 * @returns A canvas that can be used to draw a curve with the mouse pointer.
 */
export default function DrawCanvas2D(props: {
  width: number;
  height: number;
  sketch: Sketch;
}): JSX.Element {
  const [space, setSpace] = useState<CanvasSpace>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // When the component mounts on the DOM, instantiate the space.
  useEffect(() => {
    if (!canvasRef.current) throw new Error('canvas not initialized.');
    setSpace(initDrawCanvas(canvasRef.current, props.sketch));
  }, []);

  // Once the space is instantiated, start playing
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
      ref={canvasRef}
    ></canvas>
  );
}
