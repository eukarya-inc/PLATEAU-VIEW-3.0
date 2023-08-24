import { useAtom } from "jotai";
import { useState } from "react";

import { countAtom } from "../shared/states/count";

export const Widget = () => {
  const [count, setCount] = useState(0);
  const [{ value: globalCount }, setGlobalCount] = useAtom(countAtom);

  return (
    <div style={{ background: "blue" }}>
      <button onClick={() => setCount(n => n + 1)}>Local: {count}</button>
      <br />
      <button onClick={() => setGlobalCount(c => c + 1)}>Global: {globalCount}</button>
    </div>
  );
};