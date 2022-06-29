import ReactDOM from "react-dom";

import startMock from "../mock";

startMock().then(async () => {
  console.log(
    await fetch("https://example.com/user/aaa").then((r) => r.json())
  );
});

ReactDOM.render(<h1>Hoge</h1>, document.body);

export {};
