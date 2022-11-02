import Info from "@web/extensions/sidebar/core/components/content/Info";
import MapSettings from "@web/extensions/sidebar/core/components/content/MapSettings";
import Selection from "@web/extensions/sidebar/core/components/content/Selection";
import Share from "@web/extensions/sidebar/core/components/content/Share";
import Header, { Pages } from "@web/extensions/sidebar/core/components/Header";
import useGlobalHooks from "@web/extensions/sidebar/core/globalHooks";
import { Content } from "@web/sharedComponents";
import { styled, commonStyles } from "@web/theme";
import { memo, useCallback, useState } from "react";

export type Props = {
  className?: string;
  isInsideEditor: boolean;
};

const Sidebar: React.FC<Props> = ({ className, isInsideEditor }) => {
  const { overrides, minimized, setMinimize, handleOverridesUpdate, handleModalChange } =
    useGlobalHooks();

  const [current, setCurrent] = useState<Pages>("data");

  const handleClick = useCallback((p: Pages) => {
    setCurrent(p);
  }, []);

  // handleResize <- extending in WAS

  const handleMinimize = useCallback(() => {
    const html = document.querySelector("html");
    const body = document.querySelector("body");
    const root = document.getElementById("root");
    if (!minimized) {
      html?.classList.add("minimized");
      body?.classList.add("minimized");
      root?.classList.add("minimized");
    } else {
      html?.classList.remove("minimized");
      body?.classList.remove("minimized");
      root?.classList.remove("minimized");
    }
    setMinimize(!minimized);
  }, [minimized, setMinimize]);

  return (
    <Wrapper className={className} minimized={minimized}>
      <Header
        current={current}
        isInsideEditor={isInsideEditor}
        minimized={minimized}
        onMinimize={handleMinimize}
        onClick={handleClick}
      />
      {!minimized && (
        <ContentWrapper className={className}>
          {
            {
              data: <Selection onModalChange={handleModalChange} />,
              map: <MapSettings overrides={overrides} onOverridesUpdate={handleOverridesUpdate} />,
              share: <Share />,
              about: <Info />,
              template: <div>Templates</div>, // To Do
            }[current]
          }
        </ContentWrapper>
      )}
    </Wrapper>
  );
};

export default memo(Sidebar);

const Wrapper = styled.div<{ minimized?: boolean }>`
  display: flex;
  flex-direction: column;
  ${commonStyles.mainWrapper}
  transition: height 0.5s, width 0.5s, border-radius 0.5s;
  ${({ minimized }) => minimized && commonStyles.minimizedWrapper}
`;

const ContentWrapper = styled(Content)`
  flex: 1;
  background: #dcdcdc;
  box-sizing: border-box;
  overflow: auto;
`;
