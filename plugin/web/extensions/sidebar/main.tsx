import Sidebar from "@web/extensions/sidebar";
import ReactDOM from "react-dom/client";

(async () => {
  const element = document.getElementById("root");
  if (element) {
    const root = ReactDOM.createRoot(element);
    root.render(<Sidebar isInsideEditor={false} />);
  }
})();

export {};
