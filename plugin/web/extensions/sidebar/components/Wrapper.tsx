import { Content } from "@web/extensions/sharedComponents";
import Info from "@web/extensions/sidebar/components/content/Info";
import MapSettings from "@web/extensions/sidebar/components/content/MapSettings";
import Selection from "@web/extensions/sidebar/components/content/Selection";
import Share from "@web/extensions/sidebar/components/content/Share";
import type { Pages } from "@web/extensions/sidebar/components/Header";
import { styled, commonStyles } from "@web/theme";
import { memo, ReactNode } from "react";

type Props = {
  className?: string;
  current: Pages;
  minimized?: boolean;
  header?: ReactNode;
};

const SidebarWrapper: React.FC<Props> = ({ className, current, minimized, header }) => {
  return (
    <Wrapper minimized={minimized}>
      {header}
      {!minimized && (
        <ContentWrapper className={className}>
          {
            {
              mapData: <Selection />,
              shareNprint: <Share />,
              about: <Info />,
              mapSetting: <MapSettings />,
              template: <div>Templates</div>, // To Do
            }[current]
          }
        </ContentWrapper>
      )}
    </Wrapper>
  );
};

export default memo(SidebarWrapper);

const ContentWrapper = styled(Content)`
  flex: 1;
  background: #dcdcdc;
  box-sizing: border-box;
  overflow: scroll;
`;

const Wrapper = styled.div<{ minimized?: boolean }>`
  display: flex;
  flex-direction: column;
  ${commonStyles.mainWrapper}
  transition: height 0.5s, width 0.5s, border-radius 0.5s;
  ${({ minimized }) => minimized && commonStyles.minimizedWrapper}
`;
