import { Content } from "antd/lib/layout/layout";
import React, { memo, ReactNode } from "react";

import { styled } from "../../../theme";

type Props = {
  className?: string;
  children?: ReactNode;
  current: string;
};

const LayoutContent: React.FC<Props> = ({ className, children }) => {
  return (
    <ContentWrapper className={className}>
      {/* {
        {
          mapSetting: <MapSettingTab />,
          shareNprint: <ShareTab />,
          about: <InfoTab />,
        }[current]
      } */}
      {children}
    </ContentWrapper>
  );
};
export default memo(LayoutContent);

const ContentWrapper = styled(Content)`
  width: 100%;
  height: 861px;
  background: #dcdcdc;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  flex: 0 0 861;
  padding: 20px 42px 20px 12px;
`;
