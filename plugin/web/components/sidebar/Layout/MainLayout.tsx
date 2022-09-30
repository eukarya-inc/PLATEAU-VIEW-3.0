import { styled } from "@web/theme";
import { memo, useCallback, useMemo, useState } from "react";

import Icon from "../../common/Icon";

import LayoutContent from "./LayoutContent";
import LayoutFooter from "./LayoutFooter";
import LayoutHeader, { TabProps, Pages } from "./LayoutHeader";
import MinimizedSidebar from "./MinimizedSidebar";

export type Props = {
  className?: string;
  isInsideEditor: boolean;
};

const MainLayout: React.FC<Props> = ({ className, isInsideEditor }) => {
  const [minimized, setMinimized] = useState(false);
  const [current, setCurrent] = useState<Pages>("mapData");

  const handleClick = useCallback((p: Pages) => {
    setCurrent(p);
  }, []);

  const handleResize = useCallback(() => {
    const html = document.querySelector("html");
    const body = document.querySelector("body");
    if (!minimized) {
      html?.classList.add("minimized");
      body?.classList.add("minimized");
    } else {
      html?.classList.remove("minimized");
      body?.classList.remove("minimized");
    }
    setMinimized(!minimized);
  }, [minimized]);

  const headerItems = useMemo(() => {
    const items: TabProps[] = [
      {
        key: "mapData",
        icon: <StyledIcon icon="dataBase" size="24px" />,
      },
      {
        key: "mapSetting",
        icon: <StyledIcon icon="sliders" />,
      },
      {
        key: "shareNprint",
        icon: <StyledIcon icon="share" />,
      },
      {
        key: "about",
        icon: <StyledIcon icon="info" />,
      },
      {
        key: "template",
        icon: <StyledIcon icon="template" />,
      },
    ];

    return !isInsideEditor ? [...items.slice(0, -1)] : [...items];
  }, [isInsideEditor]);

  return minimized ? (
    <MinimizedSidebar onExpand={handleResize} />
  ) : (
    <SidebarWrapper className={className}>
      <LayoutHeader
        current={current}
        items={headerItems}
        onClick={handleClick}
        onMinimize={handleResize}
      />
      <LayoutContent current={current} />
      <LayoutFooter />
    </SidebarWrapper>
  );
};
export default memo(MainLayout);

const SidebarWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledIcon = styled(Icon)`
  width: 100%;
`;
