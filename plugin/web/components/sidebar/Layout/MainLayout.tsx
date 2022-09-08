// import " antd/dist/antd.less";
import { Layout, MenuProps } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import { memo, useMemo, useState } from "react";

import { styled } from "../../../theme";
import { DataBase, Info, Share, Sliders, Template } from "../../common/Icon/icons";

import LayoutContent from "./LayoutContent";
import LayoutFooter from "./LayoutFooter";
import LayoutHeader from "./LayoutHeader";

const items: MenuProps["items"] = [
  {
    key: "mapData",
    icon: <DataBase />,
  },
  {
    key: "mapSetting",
    icon: <Sliders />,
  },
  {
    key: "shareNprint",
    icon: <Share />,
  },
  {
    key: "about",
    icon: <Info />,
  },
  {
    key: "template",
    icon: <Template />,
  },
];
export type Props = {
  className?: string;
  isInsideEditor: boolean;
};

const MainLayout: React.FC<Props> = ({ className, isInsideEditor }) => {
  const [current, setCurrent] = useState("");

  const headerItems = useMemo(() => {
    return !isInsideEditor ? [...items.slice(0, -1)] : [...items];
  }, [isInsideEditor]);

  const handleClick: MenuProps["onClick"] = e => {
    setCurrent(e.key);
  };

  return (
    <LayoutWrapper className={className}>
      <LayoutHeader
        current={current}
        items={headerItems}
        onClick={(e: MenuInfo) => handleClick(e)}
      />
      <LayoutContent current={current} />
      <LayoutFooter />
    </LayoutWrapper>
  );
};
export default memo(MainLayout);

const LayoutWrapper = styled(Layout)`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f4f4f4;
`;
