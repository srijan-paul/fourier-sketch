export type Point = [number, number];

/**
 * @param ptA First point in the line
 * @param ptB Second point in the line
 * @return Slope of the line defined by the two points
 */
export function slope(ptA: Point, ptB: Point): number {
  if (ptB[0] === ptA[0]) return Infinity;
  return (ptB[1] - ptA[1]) / (ptB[0] - ptA[0]);
}

/**
 * @param f A time domain function to integrate (W -> R).
 * @return Area under the curve of `f` between range[0] and range[1].
 */
export function integrate(f: number[]): number {
  let area = 0;
  for (let x = 1; x < f.length; x++) {
    const y = f[x];
    const xPrev = x - 1;
    const yPrev = f[x - 1];

    // find a trapezoid corresponding to [x, f[x]] and [x + 1, f[x + 1]]
    const edgeA = yPrev;
    const edgeB = y;
    const trapHeight = x - xPrev;
    const trapArea = trapHeight * ((edgeA + edgeB) / 2);
    area += trapArea;
  }

  return area;
}
