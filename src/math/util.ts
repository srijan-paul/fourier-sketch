import { zip } from 'lodash';
import { FourierCoeffs } from './fourier';

/**
 * [x, y] coordinates in a Cartesian plane.
 * We use number[] as the alias instead of [number, number] to make it easy for us to
 * cast back and forth from `pts.PtLike`.
 */
type Point = number[];

/**
 * An R -> R function that takes and returns a real number
 */
export type Fun = (x: number) => number;

/**
 * A polar representation of one fourier series term.
 * Each `PolarFun` corresponds to a single `n` (freq = n).
 */
export type PolarFun = {
  radius: number;
  phase: number;
  freq: number;
};

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
  for (let x = from; x < to; x += dx) {
    const y = f(x);
    const yNext = f(x + dx);
    areaUnderF += dx * ((yNext + y) / 2);
  }
  return areaUnderF;
}

/**
 * @param f A list of Y-coordinates. The indices are assumed to be X-coordinates.
 * @returns A function that estimates the curve described by the vector f.
 * NOTE: This only works for functions with a domain of [0, 1].
 */
export function vectorToFunc(f: number[]): Fun {
  return (t: number) => f[Math.floor(t * (f.length - 1))];
}

/**
 * Evaluate a polar vector rotating about a point at a given time.
 * @param center The point about which the vector rotates.
 * @param vector A polar vector rotating about [center].
 * @param t The argument at which to evaluate [vector].
 * @returns The (x, y) coordinates of the tip of the vector at time [t].
 */
export function evaluatePolarFunc(center: Point, vector: PolarFun, t: number): Point {
  const { radius, freq, phase } = vector;
  const x = center[0] + radius * Math.cos(freq * t - phase);
  const y = center[1] + radius * Math.sin(freq * t - phase);
  return [x, y];
}

/**
 * @param sineCoeff The sine coefficient for the fourier series term.
 * @param cosineCoeff The cosine coefficinet for the fourier series term.
 * @param i The index of the term in the fourier series (0-indexed).
 * @param T The fundamental frequency of the original signal.
 * @returns a vector rotating in the Polar coordinate space that corresponds to the `i`th signal in the fourier series.
 */
export function toPolarFunc(sineCoeff: number, cosineCoeff: number, i: number, T = 1): PolarFun {
  const radius = Math.sqrt(sineCoeff ** 2 + cosineCoeff ** 2);
  const phase = Math.atan2(sineCoeff, cosineCoeff);
  return { radius, phase, freq: (i * (2 * Math.PI)) / T };
}

/**
 * Convert the (sine + cosine) terms in the Fourier series to polar vectors.
 * @param coeffs The fourier coefficients for a signal.
 */
export function toPolarFuncs(coeffs: FourierCoeffs, T = 1): PolarFun[] {
  return zip(coeffs.sine, coeffs.cosine).map(([sinCoeff, cosineCoeff], i) => {
    if (!(typeof sinCoeff === 'number' && typeof cosineCoeff === 'number')) {
      throw new Error('toPolarFuncs: Impossible code point reached');
    }
    if (i === 0) return { radius: cosineCoeff / 2, freq: 0, phase: 0 };
    return toPolarFunc(sinCoeff, cosineCoeff, i, T);
  });
}
