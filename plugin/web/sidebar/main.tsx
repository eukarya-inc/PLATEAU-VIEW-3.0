import ReactDOM from "react-dom/client";

import startMock from "../mock";

startMock().then(async () => {
  const element = document.getElementById("root");
  if (element) {
    const root = ReactDOM.createRoot(element);
    root.render(<h1>hello</h1>);
  }

  console.log(await fetch("https://example.com/user/aaa").then(r => r.json()));
});

export {};
