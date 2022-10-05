import { Icon, Footer as FooterComponent, Typography } from "@web/extensions/sharedComponents";
import { styled } from "@web/theme";
import { memo } from "react";

export type Props = {
  datasets?: number;
};

const Footer: React.FC<Props> = ({ datasets }) => {
  const { Text } = Typography;
  return (
    <FooterBan>
      <RemoveBtn onClick={() => alert("Are you sure you want to remove all?")}>
        <Icon icon="trash" />
        Remove All
      </RemoveBtn>
      <Text>Dataset x {datasets ?? 0}</Text>
    </FooterBan>
  );
};
export default memo(Footer);

const FooterBan = styled(FooterComponent)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8 16;
  width: 100%;
  height: 40px;
  border-top: 1px solid #cfcfcf;
  background-color: #f4f4f4;
`;

const RemoveBtn = styled.button`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 131px;
  height: 32px;
  border: 1px solid #c7c5c5;
  border-radius: 4px;
  background-color: inherit;
  padding: 4px 10px;
  cursor: pointer;
`;
