import { CloseOutlined } from "@ant-design/icons";
import { Button, Menu, MenuProps, Row } from "antd";
import { Header } from "antd/lib/layout/layout";
import { MenuInfo } from "rc-menu/lib/interface";
import React, { memo } from "react";

import { styled } from "../../../theme";
import { PlateauLogo } from "../../common/Icon/icons";

type Props = {
  className?: string;
  items: MenuProps["items"];
  onClick: (e: MenuInfo) => void;
  current: string;
};

const LayoutHeader: React.FC<Props> = ({ className, items, current, onClick }) => {
  return (
    <HeaderWrapper className={className}>
      <TopHeader>
        <CloseWidgetBtn type="primary" icon={<CloseOutlined />} />
      </TopHeader>
      <BottomHeader>
        <PlateauLogo height={114.25} width={100} />
        <NavHeader
          selectable={true}
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={items}
        />
      </BottomHeader>
    </HeaderWrapper>
  );
};
export default memo(LayoutHeader);

const HeaderWrapper = styled(Header)`
  background-color: #ffff;
  width: 100%;
  height: 184px;
  padding-left: 0px;
  padding-right: 0px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const TopHeader = styled(Row)`
  direction: rtl;
  align-items: flex-start;
  height: 32px;
  width: 100%;
`;

const BottomHeader = styled(Row)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 0px 10px 10px;
  height: 50px;
`;

const NavHeader = styled(Menu)`
  height: 40px;
  width: 100%;
  .ant-menu-item-icon {
    margin-left: 10px;
  }
  .ant-menu-overflow {
    justify-content: center;
  }
  .ant-menu-item-icon {
    margin-left: 10px;
  }
  .ant-menu-overflow {
    justify-content: center;
  }

  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item,
  .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu {
    padding: 0px 15px;
  }
`;

const CloseWidgetBtn = styled(Button)`
  border-radius: 0%;
  height: 32px;
  width: 32px;
`;
