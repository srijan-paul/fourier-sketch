import { Fun, integrate, vectorToFunc } from './util';
import { range } from 'lodash/fp';

export type FourierCoeffs = {
  sine: number[];
  cosine: number[];
};

/**
 * Returns the Fourier sine and cosine coefficients for a time domain curve.
 * @param f The function to estimate with Fourier analysis.
 * @param numHarmonics Number of terms to take from the fourier series. (4 by default)
 * @returns A list of fourier sine and cosine coefficents.
 */
export default function decompose(f: Fun, numHarmonics = 4): FourierCoeffs {
  // f(t) = a0+∞∑n=1(ancos(nω0t)+bnsin(nω0t)
  // It is assumed that the poinst in `pts` all belong to 1 complete oscillation of the input wave
  const freq = 2 * Math.PI;

  /**
   * @param fun Either `Math.cos` or `Math.sin`.
   * @param n Serial number of the fourier coefficient to calculate.
   * @return The `n`th fourier sine/cosine coefficient.
   */
  function fourierCoefficient(fun: (x: number) => number, n: number): number {
    const integralTerm = (t: number) => f(t) * fun(n * freq * t);
    return integrate(integralTerm, [0, 1]);
  }

  const as = range(0, numHarmonics).map(i => fourierCoefficient(Math.cos, i));
  const bs = range(0, numHarmonics).map(i => fourierCoefficient(Math.sin, i));
  return { sine: bs, cosine: as };
}

export function approximateCurve({ sine, cosine }: FourierCoeffs): number[] {
  const f = 2 * Math.PI;
  const approximation = [];

  for (let t = 0; t < 1; t += 0.1) {
    const sineTerm = sine.reduce((acc, coeff, i) => acc + coeff * Math.sin(i * f * t), 0);
    const cosineTerm = cosine.reduce((acc, coeff, i) => acc + coeff * Math.cos(i * f * t), 0);
    approximation.push(sineTerm + cosineTerm);
  }

  return approximation;
}

export function approximateFunc(coeffs: FourierCoeffs): Fun {
  return vectorToFunc(approximateCurve(coeffs));
}
