import { CloseOutlined } from "@ant-design/icons";
import Icon from "@web/components/common/Icon";
import { styled } from "@web/theme";
import { Button, Col } from "antd";
import { memo, ReactNode } from "react";

export type Pages = "mapData" | "mapSetting" | "shareNprint" | "about" | "template";

export type TabProps = {
  key: Pages;
  icon: ReactNode;
};

type Props = {
  className?: string;
  items: TabProps[];
  current: string;
  onMinimize: () => void;
  onClick: (p: Pages) => void;
};

const plateauWebsiteUrl = "https://www.mlit.go.jp/plateau/";

const LayoutHeader: React.FC<Props> = ({ className, items, current, onMinimize, onClick }) => {
  return (
    <HeaderWrapper className={className}>
      <TopSection>
        <MinimizeButton icon={<CloseOutlined onClick={onMinimize} />} />
        <PlateauIcon
          icon="plateauLogo"
          size={100}
          wide
          onClick={() => window.open(plateauWebsiteUrl, "_blank", "noopener")}
        />
      </TopSection>
      <Nav>
        {items?.map((i, idx) => (
          <IconWrapper key={idx} current={current === i.key} onClick={() => onClick(i.key)}>
            {i.icon}
          </IconWrapper>
        ))}
      </Nav>
    </HeaderWrapper>
  );
};

export default memo(LayoutHeader);

const HeaderWrapper = styled(Col)`
  height: 164px;
  width: 347px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: #ffff;
`;

const Nav = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 0 53px;
`;

const TopSection = styled.div``;

const MinimizeButton = styled(Button)`
  position: absolute;
  right: 0;
  border: none;
  border-radius: 0;
  height: 32px;
  width: 32px;
  background: #00bebe;
  color: white;

  :hover {
    background: #c7c5c5;
    color: white;
  }
`;

const PlateauIcon = styled(Icon)`
  cursor: pointer;
  margin-top: 40px;
`;

const IconWrapper = styled.div<{ current?: boolean }>`
  cursor: pointer;
  padding: 6px;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: ${({ current }) => (current ? "#00bebe" : "transparent")};
  color: ${({ current }) => (current ? "#00bebe" : "#C7C5C5")};
  transition: border-bottom-color 0.5s, color 0.5s;

  :hover {
    border-bottom-color: #00bebe;
    color: #00bebe;
  }
`;
