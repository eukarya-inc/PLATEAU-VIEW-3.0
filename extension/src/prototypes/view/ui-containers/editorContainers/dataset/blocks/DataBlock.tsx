import { cloneDeep } from "lodash-es";
import { useMemo } from "react";
import ReactJson from "react-json-view";

import { EditorDataset } from "..";
import { EditorBlock, EditorBlockProps } from "../../../../../ui-components";

type DataBlockProps = EditorBlockProps & {
  dataset?: EditorDataset;
  dataId?: string;
};

export const DataBlock: React.FC<DataBlockProps> = ({ dataset, dataId, ...props }) => {
  const data = useMemo(
    () => cloneDeep(dataId === "default" ? dataset : dataset?.items.find(d => d.id === dataId)),
    [dataset, dataId],
  );
  return (
    <EditorBlock title="Data" expandable {...props}>
      {data && (
        <ReactJson
          src={data}
          displayDataTypes={false}
          enableClipboard={false}
          displayObjectSize={false}
          quotesOnKeys={false}
          indentWidth={2}
          style={{ wordBreak: "break-all", lineHeight: 1.2 }}
        />
      )}
    </EditorBlock>
  );
};
