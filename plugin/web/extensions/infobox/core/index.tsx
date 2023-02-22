import { Spin } from "@web/sharedComponents";
import { styled } from "@web/theme";

import Editor from "./components/editor";
import Viewer from "./components/viewer";
import useHooks from "./hooks";

const Infobox: React.FC = () => {
  const { mode, dataState, feature, fields, wrapperRef, isSaving, saveFields, updateSize } =
    useHooks();

  return (
    <Wrapper ref={wrapperRef}>
      {dataState === "empty" && <SimplePane>NO DATA</SimplePane>}
      {dataState !== "empty" && mode === "edit" && fields && (
        <Editor
          fields={fields}
          feature={feature}
          isSaving={isSaving}
          ready={dataState === "ready"}
          saveFields={saveFields}
          updateSize={updateSize}
        />
      )}
      {dataState !== "empty" && mode === "view" && (
        <Viewer
          fields={fields}
          feature={feature}
          ready={dataState === "ready"}
          updateSize={updateSize}
        />
      )}
      {dataState === "loading" && (
        <Loading>
          <Spin />
        </Loading>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  padding: 0 12px;
`;

const Loading = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-height: 200px;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SimplePane = styled.div`
  width: 100%;
  padding: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

export default Infobox;
