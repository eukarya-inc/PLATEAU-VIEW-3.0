import Icon from "@web/components/common/Icon";
import { styled } from "@web/theme";

const plateauWebsiteUrl = "https://www.mlit.go.jp/plateau/";

export type Props = {
  onExpand: () => void;
};

const MinimizedSidebar: React.FC<Props> = ({ onExpand }) => {
  return (
    <Wrapper>
      <StyledIcon
        icon="plateauLogo"
        size={114}
        wide
        onClick={() => window.open(plateauWebsiteUrl, "_blank", "noopener")}
      />
      <MenuIcon icon="menu" size={24} onClick={onExpand} />
    </Wrapper>
  );
};

export default MinimizedSidebar;

const Wrapper = styled.div`
  width: 226px;
  height: 80px;
  border-radius: 0 8px 8px 0;
  display: flex;
  justify-content: space-between;
  padding: 24px;
  background: #fff;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;

const MenuIcon = styled(StyledIcon)`
  background: #00bebe;
  padding: 4px;
`;
