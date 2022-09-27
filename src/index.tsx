import { CanvasSpace, PtLike } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h } from 'preact';
import Graph from './graphics/graph';

const space = new CanvasSpace('#canvas');
space.setup({ bgcolor: '#fafafa' });

const form = space.getForm();

let graph: Graph | undefined;
space.add(() => {
  space.clear();

  if (!graph) {
    graph = new Graph(Math.sin, {
      width: space.width,
      height: space.height,
      domain: [-10, 10],
      range: [-2, 2],
    });
  }

  graph.plot(form);
});

space.play();

render(
  <div>
    <canvas id="canvas" width={400} height={400}></canvas>
  </div>,
  document.body
);
