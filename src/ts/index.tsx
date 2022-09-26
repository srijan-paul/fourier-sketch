import { CanvasSpace, PtLike } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h } from 'preact';

const space = new CanvasSpace('#canvas');
space.setup({ bgcolor: '#fafafa' });

const form = space.getForm();

function getSineWave(spaceWidth: number, spaceHeight: number, time: number): PtLike[] {
  const origin = [spaceWidth / 40, (2 * spaceHeight) / 3];
  const pts: PtLike[] = [origin];

  const scale = 30;
  for (let x = 0; x < (7 * Math.PI) / 2; x += 0.1) {
    const y = Math.sin(x + time * 0.002);
    const px = origin[0] + x * scale;
    const py = origin[1] + y * scale;
    pts.push([px, py]);
  }

  return pts;
}

space.add(time => {
  space.clear();
  form.stroke('#fd79a8', 3);
  const { width, height } = space;
  const points = getSineWave(width, height, time || 0);
  for (let i = 1; i < points.length; ++i) {
    form.line([points[i - 1], points[i]]);
  }
});

space.play();

render(
  <div>
    <canvas id="canvas" width={400} height={400}></canvas>
  </div>,
  document.body
);
