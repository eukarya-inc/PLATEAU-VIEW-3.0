import Header, { Pages } from "@web/extensions/sidebar/components/Header";
import SidebarWrapper from "@web/extensions/sidebar/components/Wrapper";
import { memo, useCallback, useState } from "react";

export type Props = {
  className?: string;
  isInsideEditor: boolean;
};

const Sidebar: React.FC<Props> = ({ className, isInsideEditor }) => {
  const [minimized, setMinimized] = useState(false);
  const [current, setCurrent] = useState<Pages>("mapData");

  const handleClick = useCallback((p: Pages) => {
    setCurrent(p);
  }, []);

  const handleResize = useCallback(() => {
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
    setMinimized(!minimized);
  }, [minimized]);

  return (
    <SidebarWrapper
      className={className}
      header={
        <Header
          current={current}
          isInsideEditor={isInsideEditor}
          minimized={minimized}
          onMinimize={handleResize}
          onClick={handleClick}
        />
      }
      current={current}
      minimized={minimized}
    />
  );
};

export default memo(Sidebar);
