import { useState } from "react";

export const Widget = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ background: "blue" }}>
      <button onClick={() => setCount(n => n + 1)}>Count: {count}</button>
    </div>
  );
};
