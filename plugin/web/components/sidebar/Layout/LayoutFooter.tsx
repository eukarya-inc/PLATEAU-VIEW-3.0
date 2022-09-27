import Icon from "@web/components/common/Icon";
import { styled } from "@web/theme";
import { Button, Typography } from "antd";
import { Footer } from "antd/lib/layout/layout";
import React, { memo } from "react";

const LayoutFooter: React.FC = () => {
  const { Text } = Typography;
  return (
    <FooterBan>
      <RemoveBtn type="default" icon={<Icon icon="trash" size={24} />} color={"#4A4A4A"}>
        Remove All
      </RemoveBtn>
      <Text>DataSet x 0</Text>
    </FooterBan>
  );
};
export default memo(LayoutFooter);

const FooterBan = styled(Footer)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8 16;
  align-items: center;
  width: 100%;
  height: 40px;
  border-top: 1px solid #cfcfcf;
  background-color: #f4f4f4;
`;

const RemoveBtn = styled(Button)`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 4px 10px;
  gap: 10px;
  width: 131px;
  height: 32px;
  border: 1px solid #c7c5c5;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #f4f4f4;
`;
