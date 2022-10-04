// preact imports need to exist in the source for the build to work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, h, JSX } from 'preact';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import content from './content/content.md';
import Fourier1DGraph from './components/FourierCanvas1D';
import FourierApprox from './components/FourierApprox';
import { Fun } from './math/util';
import { useState } from 'preact/hooks';

const funcs = new Map<string, Fun>([
  ['square', x => Math.sign(Math.sin(x * 2 * Math.PI))],
  ['sawtooth', x => x - Math.floor(x)],
]);

function App() {
  // const selectorRef = useRef<HTMLSelectElement>(null);
  const [func] = useState(() => funcs.get('square') || Math.sin);

  // const changeFunction = useCallback(() => {
  //   const fnName = selectorRef.current?.value;
  //   if (!fnName) return;
  //   const fn = funcs.get(fnName);
  //   if (!fn) return;
  //   setFunc(fn);
  // }, [selectorRef.current]);

  return (
    <div id="root">
      <div className="container main">
        <div dangerouslySetInnerHTML={{ __html: content.body }}></div>
        <Fourier1DGraph width={400} height={400} func={func} />
        <FourierApprox />
      </div>
    </div>
  );
}

render(<App />, document.body);
