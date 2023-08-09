import { useState } from "react";

export const Widget = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ background: "pink" }}>
      <button onClick={() => setCount(n => n + 1)}>Hello: {count}</button>
    </div>
  );
};
