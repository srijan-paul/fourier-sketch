import { CanvasSpace, PtLike, CanvasForm } from 'pts';

export type GraphConfig = {
  // Width of the graph inside the canvas space.
  width: number;

  // Height of the graph inside the canvas space.
  height: number;

  xScale?: number;
  yScale?: number;

  // size of each 'step' in the X direction.
  dx?: number;

  // X bounds of the graph.
  // A domain of 'x' is assumed to be [0, x], both inclusive
  domain?: number | [number, number];

  // Y bounds of the graph.
  // A range of 'x' is assumed to be [0, x], both inclusive
  range?: number | [number, number];

  // Location of (0, 0) on the graph, as seen on the canvas
  center?: [number, number];

  // Renders the grid if 'true'
  showGrid?: boolean;

  // Renders the coordinate axes if 'true'
  showCoordinateAxes?: boolean;
};

/**
 * Renders a graph onto a give HTML canvas
 */
export default class Graph {
  private xScale: number = 10;
  private yScale: number = 10;

  private func: (x: number) => number;

  // min-x, max-x
  private domain: [number, number] = [0, 1];
  // min-y, max-y
  private range: [number, number] = [0, 1];

  // This knob controls ow "granular" the graph is.
  private dx: number = 0.01;

  readonly center: [number, number];

  // A cache of points in the graph
  private readonly pts: PtLike[] = [];

  private readonly width: number;
  private readonly height: number;

  // `true` if the points in this graph have been calculated and cached
  private isConstructed = false;

  showGrid: boolean;
  showCoordinateAxes: boolean;

  constructor(func: (x: number) => number, config: GraphConfig) {
    this.func = func;
    this.width = config.width;
    this.height = config.height;
    const { domain, range } = config;

    if (typeof domain !== 'undefined') {
      this.domain = typeof domain == 'number' ? [0, domain] : domain;
    }

    if (typeof range !== 'undefined') {
      this.range = typeof range == 'number' ? [0, range] : range;
    }

    const domainInterval = this.domain[1] - this.domain[0];
    const rangeInterval = this.range[1] - this.range[0];

    this.dx = config.dx || (this.domain[1] - this.domain[0]) / this.width;

    this.xScale = config.xScale || this.width / domainInterval;
    this.yScale = config.yScale || this.height / rangeInterval;

    this.center = config.center || [this.width / 2, (2 * this.height) / 3];

    this.showGrid = !!config.showGrid;
    this.showCoordinateAxes = !!config.showCoordinateAxes;
  }

  /**
   * Reset the scale of the graph.
   * @param xScale scale on the x-axis
   * @param yScale scale on the y-axis
   */
  public setScale(xScale: number, yScale: number) {
    this.xScale = xScale;
    this.yScale = yScale;
    this.isConstructed = false;
  }

  /**
   * Fill the `pts` array by calculating all points that lie on the curve of `func`.
   */
  private construct() {
    const { domain, func, dx, xScale, yScale, center } = this;

    for (let x = domain[0]; x < domain[1]; x += dx) {
      const y = func(x);

      // We scale the (x, y) point to the space's dimensions, then
      // offset it by (center[0], center[1]) to make it lie on the accurate
      // position in our graph.
      // Note: (center[0], center[1]) is our origin whereas (0, 0) is the canvas's origin.
      const px = center[0] + x * xScale;

      // "-" instead of "+" because the Y axis is upside down in most
      // graphics libraries, including pts.js
      const py = center[1] - y * yScale;
      this.pts.push([px, py]);
    }

    this.isConstructed = true;
  }

  /**
   * Renders the X-Y axes.
   * @param form The canvas form to draw with.
   */
  private renderXYAxes(form: CanvasForm): void {
    form.stroke('#ddd');
    const [ox, oy] = this.center;
    form.line([
      [ox, 0],
      [ox, this.height],
    ]);

    form.line([
      [0, oy],
      [this.width, oy],
    ]);
  }

  /**
   * Render the graph on a ptsjs space.
   * @param form The form to draw with.
   */
  public plot(form: CanvasForm): void {
    if (!this.isConstructed) {
      this.construct();
    }

    if (!this.showCoordinateAxes) {
      this.renderXYAxes(form);
    }

    form.stroke('#fd79a8', 2);
    for (let i = 1; i < this.pts.length; ++i) {
      form.line([this.pts[i - 1], this.pts[i]]);
    }
  }
}
