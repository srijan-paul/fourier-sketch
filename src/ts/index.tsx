import { CanvasSpace } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h } from 'preact';

const space = new CanvasSpace('#canvas');
space.setup({ bgcolor: '#fafafa' });

const form = space.getForm();
space.add(() => {
  space.bindMouse(true);
  form.point(space.pointer, 10);
});

space.play();

render(
  <div>
    <canvas id="canvas" width={400} height={400}></canvas>
  </div>,
  document.body
);
