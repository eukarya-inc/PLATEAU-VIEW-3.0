import { cloneDeep } from "lodash-es";
import { useMemo } from "react";
import ReactJson from "react-json-view";

import { Dataset } from "../../../../shared/api/types";

import { BasicBlock, BasicBlockProps } from "./BasicBlock";

type DataBlockProps = BasicBlockProps & {
  dataset?: Dataset;
  dataId?: string;
};

export const DataBlock: React.FC<DataBlockProps> = ({ dataset, dataId, ...props }) => {
  const data = useMemo(
    () => cloneDeep(dataId === "default" ? dataset : dataset?.data.find(d => d.id === dataId)),
    [dataset, dataId],
  );
  return (
    <BasicBlock title="Data" expandable {...props}>
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
    </BasicBlock>
  );
};
