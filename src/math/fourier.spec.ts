import decompose, { approximateCurve } from './fourier';
import assert from 'assert';
import { difference, sum } from 'lodash/fp';
import { range } from 'lodash';

describe('decompose', () => {
  it('can decompose', () => {
    const { sine, cosine } = decompose(x => 4 * Math.sin(x), 100);
    const approximation = approximateCurve({ sine, cosine });
    const actualCurve = range(0, 1, 0.1).map(Math.sin);
    console.log(approximation, actualCurve);
    const totalError = sum(difference(approximation, actualCurve));
    assert(totalError < 0.01);
  });
});
