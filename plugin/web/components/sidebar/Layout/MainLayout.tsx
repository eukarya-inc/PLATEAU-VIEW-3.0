// import " antd/dist/antd.less";
import { styled } from "@web/theme";
import { Layout, MenuProps } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import { memo, useMemo, useState } from "react";

import Icon from "../../common/Icon";

import LayoutContent from "./LayoutContent";
import LayoutFooter from "./LayoutFooter";
import LayoutHeader from "./LayoutHeader";

const items: MenuProps["items"] = [
  {
    key: "mapData",
    icon: <Icon icon="dataBase" />,
  },
  {
    key: "mapSetting",
    icon: <Icon icon="sliders" />,
  },
  {
    key: "shareNprint",
    icon: <Icon icon="share" />,
  },
  {
    key: "about",
    icon: <Icon icon="info" />,
  },
  {
    key: "template",
    icon: <Icon icon="template" />,
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
