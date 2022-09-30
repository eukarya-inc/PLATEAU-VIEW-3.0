import InfoTab from "@web/components/sidebar/tabs/InfoTab";
import ShareTab from "@web/components/sidebar/tabs/ShareTab";
import { styled } from "@web/theme";
import { Content } from "antd/lib/layout/layout";
import { memo, ReactNode } from "react";

import MapSettingTab from "../tabs/MapSettingTab";

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
          mapSetting: <MapSettingTab />,
        }[current]
      }
      {children}
    </ContentWrapper>
  );
};
export default memo(LayoutContent);

const ContentWrapper = styled(Content)`
  background: #dcdcdc;
  flex: 1;
  padding: 20px 42px 20px 12px;
  box-sizing: border-box;
  width: 100%;
  overflow: scroll;
`;
