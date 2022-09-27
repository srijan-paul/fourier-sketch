import { Point, integrate } from './util';

export type FourierCoeffs = {
  sine: number[];
  cosine: number[];
};


/**
 * @param curve Points in the original curve.
 * @param numHarmonics Number of terms to take from the fourier series.
 * @returns A list of sine and cosine waves that approximates the curves.
 */
export default function decompose(curve: Point[], numHarmonics = curve.length - 1): FourierCoeffs {
  // f(t) = a0+∞∑n=1(ancos(nω0t)+bnsin(nω0t)
  const coeffs = { sine: [], cosine: [] } as FourierCoeffs;

  // It is assumed that the poinst in `pts` all belong to 1 complete oscillation of the input wave
  const T = curve.length;
  const freq = (2 * Math.PI) / T;

  numHarmonics = Math.min(numHarmonics, curve.length - 1);

  // The first fourier coefficient of the cosine part (AKA a_0) is the average,
  coeffs.cosine.push(curve.map(pt => pt[1]).reduce((x, y) => x + y) / curve.length);

  // A list of curves. The integral of each curve over T is a fourier cofficient
  // for the cosinosudal part (a_n)
  const fourierCosineTerms = [];
  for (let n = 1; n <= numHarmonics; ++n) {
    // A vector containing the points in the Nth harmonic.
    const harmonicCurve = [];
    for (let t = 0; t < curve.length; ++t) {
      harmonicCurve.push(curve[t][1] * Math.cos((n + 1) * freq * t));
    }
    fourierCosineTerms.push(harmonicCurve);
  }

  const fourierCosineCoeffs = fourierCosineTerms.map(term => integrate(term));
  return { sine: [], cosine: fourierCosineCoeffs };
}
