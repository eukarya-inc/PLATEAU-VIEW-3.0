import { styled } from "@web/theme";
import { useCallback } from "react";

import { postMsg } from "../../core/utils";
import CommonModalWrapper from "../commonModalWrapper";

const Terrain: React.FC = () => {
  const handleClose = useCallback(() => {
    postMsg({ action: "modal-close" });
  }, []);

  return (
    <CommonModalWrapper title="地形データ" onModalClose={handleClose}>
      <Paragraph>基盤地図標高モデルから作成</Paragraph>
      <Paragraph> （測量法に基づく国土地理院長承認（使用） R 3JHs 778）</Paragraph>
    </CommonModalWrapper>
  );
};
export default Terrain;

const Paragraph = styled.p`
  font-size: 12px;
`;
