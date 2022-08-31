import ReactDOM from "react-dom/client";

import Sidebar from "../components/sidebar";
// import startMock from "../mock";

(async () => {
  const element = document.getElementById("root");
  if (element) {
    const root = ReactDOM.createRoot(element);
    root.render(<Sidebar />);
  }
})();

// startMock().then(async () => {
//   const element = document.getElementById("root");
//   if (element) {
//     const root = ReactDOM.createRoot(element);
//     root.render(
//       <Wrapper>
//         <Button type="primary">Primary Button</Button>
//       </Wrapper>,
//     );
//   }

//   console.log(await fetch("https://example.com/user/aaa").then(r => r.json()));
// });

export {};
