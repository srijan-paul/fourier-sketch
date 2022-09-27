import { CanvasSpace } from 'pts';

// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h, JSX } from 'preact';
import Graph from './graphics/graph';

const space = new CanvasSpace('#canvas');
space.setup({ bgcolor: '#fafafa' });

const form = space.getForm();

function makeGraph(func: (x: number) => number): Graph {
  return new Graph(func, {
    width: space.width,
    height: space.height,
    domain: [-10, 10],
    range: [-2, 2],
  });
}

let graph: Graph | undefined;
space.add(() => {
  space.clear();
  if (!graph) graph = makeGraph(x => Math.sign(Math.sin(x)));
  graph.plot(form);
});

space.play();

function Canvas({ width, height }: { width: number; height: number }): JSX.Element {
  return <canvas id="canvas" width={width} height={height}></canvas>;
}

render(
  <div class="root">
    <Canvas width={400} height={400} />
  </div>,
  document.body
);
