import InfoTab from "@web/components/sidebar/tabs/InfoTab";
import ShareTab from "@web/components/sidebar/tabs/ShareTab";
import { styled } from "@web/theme";
import { Content } from "antd/lib/layout/layout";
import React, { memo, ReactNode } from "react";

type Props = {
  className?: string;
  children?: ReactNode;
  current: string;
};

const LayoutContent: React.FC<Props> = ({ className, children, current }) => {
  return (
    <ContentWrapper className={className}>
      {
        {
          shareNprint: <ShareTab />,
          about: <InfoTab />,
        }[current]
      }
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
