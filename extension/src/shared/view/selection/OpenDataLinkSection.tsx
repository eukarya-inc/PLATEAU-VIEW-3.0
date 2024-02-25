import { Divider, Button, styled } from "@mui/material";
import { groupBy, unionBy } from "lodash-es";
import { type FC, useMemo } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import { InspectorItem } from "../../../prototypes/ui-components";
import { useAreaDatasets, useDatasetTypes } from "../../../shared/graphql";
import { Area } from "../../../shared/states/address";

export interface SwitchDatasetProps {
  area: Area[];
}

export const OpenDataLink: FC<SwitchDatasetProps> = ({ area }) => {
  const { data: datasetTypeOrder } = useDatasetTypes();
  const filteredDatasetTypeOrder = useMemo(
    () => unionBy(datasetTypeOrder, "name"),
    [datasetTypeOrder],
  );
  const query = useAreaDatasets(area[0].code);

  const datasetGroups = useMemo(() => {
    const datasets = query.data?.area?.datasets;
    if (!datasets) {
      return;
    }
    const groups = Object.entries(
      groupBy(
        datasets.filter(d =>
          !d.cityCode
            ? area[0].code === d.prefectureCode
            : !d.wardCode
            ? d.cityCode === area[0].code
            : d.wardCode
            ? d.wardCode === area[0].code
            : false,
        ),
        d => d.type.name,
      ),
    );

    return filteredDatasetTypeOrder
      ?.map(orderedType => groups.find(([type]) => type === orderedType.name))
      .filter(isNotNullish)
      .map(([, datasets]) => datasets);
  }, [query.data, filteredDatasetTypeOrder, area]);

  const firstOpenDataUrl = useMemo(() => {
    const firstDatasetWithOpenDataUrl = datasetGroups?.flat().find(dataset => dataset.openDataUrl);
    return firstDatasetWithOpenDataUrl?.openDataUrl ?? null;
  }, [datasetGroups]);

  const hasDatasets = datasetGroups != null && datasetGroups.length > 0;

  return (
    <>
      {hasDatasets && (
        <>
          <Divider />
          <InspectorItem>
            <CustomButton
              size="small"
              variant="outlined"
              fullWidth
              onClick={() => {
                if (firstOpenDataUrl) {
                  window.open(firstOpenDataUrl, "_blank");
                }
              }}>
              オープンデータを入手
            </CustomButton>
          </InspectorItem>
        </>
      )}
    </>
  );
};

const CustomButton = styled(Button)({
  borderRadius: "2px",
  borderColor: "#D9D9D9",
});
