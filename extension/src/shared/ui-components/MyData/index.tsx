import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";

import { showMyDataModalAtom } from "../../../prototypes/view/states/app";
import SharedModal from "../Modal";

import LocalDataTab from "./LocalDataTab";
import { UserDataItem } from "./types";
import WebDataTab from "./WebDataTab";

const MyData = () => {
  const [showMyDataModal, setShowMyDataModal] = useAtom(showMyDataModalAtom);
  const [value, setValue] = useState("local");
  const [fileName, setFileName] = useState("");
  const [selectedDataset, setDataset] = useState<UserDataItem>();
  const [requireLayerName, setRequireLayerName] = useState<boolean>(false);
  const [selectedLocalItem, setSelectedLocalItem] = useState<UserDataItem>();
  const [selectedWebItem, setSelectedWebItem] = useState<UserDataItem>();

  const handleOpenDetails = useCallback((data?: UserDataItem, needLayerName?: boolean) => {
    setDataset(data);
    setRequireLayerName(!!needLayerName);
  }, []);

  console.log("selectedLocalItem", selectedDataset);
  console.log("requiredName", requireLayerName);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (handleOpenDetails) {
      if (newValue === "local") handleOpenDetails(selectedLocalItem);
      else handleOpenDetails(selectedWebItem);
    }
    setValue(newValue);
  };

  const onClose = useCallback(() => {
    setShowMyDataModal(false);
  }, [setShowMyDataModal]);

  const handleSubmit = useCallback(() => {
    console.log("called");
  }, []);

  return (
    <SharedModal isVisible={showMyDataModal} title="Myデータ" onClose={onClose}>
      <Box sx={{ width: "100%", typography: "body1", borderTop: "1px solid #0000001f" }}>
        <TabContext value={value}>
          <TabList onChange={handleChange}>
            <Tab label="ローカルのデータから追加" value="local" sx={{ flex: 1 }} />
            <Tab label="Webから追加" value="web" sx={{ flex: 1 }} />
          </TabList>
          <TabPanel value="local">
            <LocalDataTab
              setSelectedLocalItem={setSelectedLocalItem}
              onSubmit={handleSubmit}
              fileName={fileName}
              setFileName={setFileName}
            />
          </TabPanel>
          <TabPanel value="web">
            <WebDataTab
              selectedWebItem={selectedWebItem}
              onOpenDetails={handleOpenDetails}
              setSelectedWebItem={setSelectedWebItem}
              onSubmit={handleSubmit}
            />
          </TabPanel>
        </TabContext>
      </Box>
    </SharedModal>
  );
};

export default MyData;
