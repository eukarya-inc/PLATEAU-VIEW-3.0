import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { showMyDataModalAtom } from "../../../prototypes/view/states/app";
import SharedModal from "../Modal";

import LocalDataTab from "./LocalDataTab";
import { UserDataItem } from "./types";
import WebDataTab from "./WebDataTab";

const MyData = () => {
  const [showMyDataModal, setShowMyDataModal] = useAtom(showMyDataModalAtom);

  const [value, setValue] = useState("local");
  const [fileName, setFileName] = useState("");
  const [selectedLocalItem, setSelectedLocalItem] = useState<UserDataItem>();
  const [selectedWebItem, setSelectedWebItem] = useState<UserDataItem>();

  const addLayer = useAddLayer();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const onClose = useCallback(() => {
    setShowMyDataModal(false);
  }, [setShowMyDataModal]);

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
              selectedLocalItem={selectedLocalItem}
              fileName={fileName}
              onClose={onClose}
              setFileName={setFileName}
              onAddLayer={addLayer}
            />
          </TabPanel>
          <TabPanel value="web">
            <WebDataTab
              selectedWebItem={selectedWebItem}
              setSelectedWebItem={setSelectedWebItem}
              onAddLayer={addLayer}
              onClose={onClose}
            />
          </TabPanel>
        </TabContext>
      </Box>
    </SharedModal>
  );
};

export default MyData;
