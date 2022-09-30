import decompose, { approximateCurve } from './fourier';
import assert from 'assert';
import { sum } from 'lodash/fp';
import { range, zipWith } from 'lodash';

/**
 * @param f The function to approximate using fourier series.
 * @param T The time period of the function.
 * @param n The number of terms to take from the fourier series.
 * @returns An object containing members: Two arrays, each containing the Y-values
 * on the curve between 0 and T, and the total error in fourier approximation.
 */
function getActualAndApproximateCurves(f: (x: number) => number, T: number, n = 4) {
  const { sine, cosine } = decompose(f, n, T);
  const approximation = approximateCurve({ sine, cosine }, T);
  const actual = range(0, T, 0.1).map(f);

  const totalError = sum(zipWith(approximation, actual, (a, b) => Math.abs(a - b)));
  return {
    actual,
    approximation,
    totalError,
  };
}

describe('decompose', () => {
  it('can decompose 4sinx', () => {
    const func = (x: number) => 4 * Math.sin(x);
    const T = 2 * Math.PI;
    const { actual, approximation, totalError } = getActualAndApproximateCurves(func, T);

    assert(approximation.every(x => !isNaN(x)));
    assert(actual.every(x => !isNaN(x)));
    assert(!isNaN(totalError));
    assert(totalError < 0.01);
  });

  it('can decompose the square wave', () => {
    const func = (x: number) => 4 * Math.sign(Math.sin(x));
    const T = 2 * Math.PI;
    const { actual, approximation, totalError } = getActualAndApproximateCurves(func, T, 164);

    assert(approximation.every(x => !isNaN(x)));
    assert(actual.every(x => !isNaN(x)));
    assert(!isNaN(totalError));

    // total error is ~2.6 with 164 curves.
    // Not a great number but oh well - we're approximating an infinite sum :)
    assert(totalError < 4);
  });
});
