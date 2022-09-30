import { Fun, integrate, vectorToFunc } from './util';
import { range } from 'lodash';

export type FourierCoeffs = {
  sine: number[];
  cosine: number[];
};

/**
 * Returns the Fourier sine and cosine coefficients for a time domain curve.
 * @param f The function to estimate with Fourier analysis.
 * @param numHarmonics Number of terms to take from the fourier series. (4 by default)
 * @param T The time period of the signal. Assumed to be `1` if not provided.
 * @returns A list of fourier sine and cosine coefficents.
 */
export default function decompose(f: Fun, numHarmonics = 4, T = 1): FourierCoeffs {
  // f(t) = a0+∞∑n=1(ancos(nω0t)+bnsin(nω0t)
  // It is assumed that the poinst in `pts` all belong to 1 complete oscillation of the input wave
  const freq = (2 * Math.PI) / T;

  /**
   * @param fun Either `Math.cos` or `Math.sin`.
   * @param n Serial number of the fourier coefficient to calculate.
   * @return The `n`th fourier sine/cosine coefficient.
   */
  function fourierCoefficient(fun: (x: number) => number, n: number): number {
    const integralTerm = (t: number) => f(t) * fun(n * freq * t);
    return (2 / T) * integrate(integralTerm, [0, T]);
  }

  const harmonicRange = range(numHarmonics);
  const as = harmonicRange.map(i => fourierCoefficient(Math.cos, i));
  const bs = harmonicRange.map(i => fourierCoefficient(Math.sin, i));
  return { sine: bs, cosine: as };
}

/**
 * @param coeffs Fourier sine and cosine coefficients of a curve.
 * @param T Time period of the original function represented by the coefficients.
 * @param dt Time step
 * @returns A list of points where each point corresponds to each value of `t`.
 */
export function approximateCurve({ sine, cosine }: FourierCoeffs, T = 1, dt = 0.1): number[] {
  const f = (2 * Math.PI) / T;
  const approximation = [];

  for (let t = 0; t < T; t += dt) {
    const sineTerm = sine.reduce((acc, coeff, i) => acc + coeff * Math.sin(i * f * t), 0);
    const cosineTerm = cosine.reduce((acc, coeff, i) => acc + coeff * Math.cos(i * f * t), 0);
    approximation.push(sineTerm + cosineTerm);
  }

  return approximation;
}

export function approximateFunc(coeffs: FourierCoeffs): Fun {
  return vectorToFunc(approximateCurve(coeffs));
}
