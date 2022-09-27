import MainLayout from "./Layout/MainLayout";
import "antd/dist/antd.less";
import "./global.less";

const Sidebar: React.FC = () => {
  return <MainLayout isInsideEditor={false} />;
};

export default Sidebar;
