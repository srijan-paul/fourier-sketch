type Point = [number, number];
export type Fun = (x: number) => number;

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
 * Calculate the integral using [Trapezoidal rule](https://en.wikipedia.org/wiki/Trapezoidal_rule).
 * @param f A time domain function to integrate (W -> R).
 * @param interval Interval of integration ([to, from]).
 * @return Area under the curve of `f` between interval[0] and interval[1].
 */
export function integrate(f: Fun, interval: [number, number] = [0, 1], dx = 0.01): number {
  const [from, to] = interval;
  let areaUnderF = 0;
  for (let x  = from; x < to; x+= dx) {
    const y = f(x);
    const yNext = f(x + dx);
    areaUnderF += dx * ((yNext + y) / 2);
  }
  return areaUnderF;
}

/**
 * @param f A list of Y-coordinates. The indices are assumed to be X-coordinates.
 * @returns A function that estimates the curve described by the vector f.
 * NOTE: This only wors for functions with a domain of [0, 1].
 */
export function vectorToFunc(f: number[]): Fun {
  return (t: number) => f[Math.floor(t * (f.length - 1))];
}
