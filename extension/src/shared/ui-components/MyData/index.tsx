import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { FC, useCallback, useState } from "react";

import { AddLayerOptions } from "../../../prototypes/layers";
import { MY_DATA_LAYER } from "../../../prototypes/view-layers";
import { RootLayerConfig, createRootLayerForLayerAtom } from "../../view-layers";
import SharedModal from "../Modal";

import LocalDataTab from "./LocalDataTab";
import { UserDataItem } from "./types";
import WebDataTab from "./WebDataTab";

type Props = {
  show: boolean;
  addLayer: (
    layer: Omit<RootLayerConfig, "id">,
    options?: AddLayerOptions | undefined,
  ) => () => void;
  onClose?: () => void;
};

const MyDataModal: FC<Props> = ({ show, addLayer, onClose }) => {
  const [value, setValue] = useState("local");

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    if (event) setValue(newValue);
  }, []);

  const handleDataSetSubmit = (selectedItem: UserDataItem, layers?: string[]) => {
    addLayer(
      createRootLayerForLayerAtom({
        title: selectedItem.name ?? "",
        format: selectedItem?.format,
        type: MY_DATA_LAYER,
        url: selectedItem?.url,
        id: selectedItem?.dataID,
        csv: selectedItem?.additionalData?.data?.csv,
        layers,
      }),
      { autoSelect: false },
    );
    onClose?.();
  };

  return (
    <SharedModal isVisible={show} title="Myデータ" onClose={onClose}>
      <Box sx={{ width: "100%", typography: "body1", borderTop: "1px solid #0000001f" }}>
        <TabContext value={value}>
          <TabList onChange={handleTabChange}>
            <Tab label="ローカルのデータから追加" value="local" sx={{ flex: 1 }} />
            <Tab label="Webから追加" value="web" sx={{ flex: 1 }} />
          </TabList>
          <TabPanel value="local">
            <LocalDataTab onSubmit={handleDataSetSubmit} />
          </TabPanel>
          <TabPanel value="web">
            <WebDataTab onSubmit={handleDataSetSubmit} />
          </TabPanel>
        </TabContext>
      </Box>
    </SharedModal>
  );
};

export default MyDataModal;