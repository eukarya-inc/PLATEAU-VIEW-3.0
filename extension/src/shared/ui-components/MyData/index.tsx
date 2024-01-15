import AddIcon from "@mui/icons-material/Add";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useAtom } from "jotai";
import { useCallback, useState, useMemo } from "react";

import { showMyDataModalAtom } from "../../../prototypes/view/states/app";
import SharedModal from "../Modal";

import LocalDataTab from "./LocalDataTab";

const MyData = () => {
  const [showMyDataModal, setShowMyDataModal] = useAtom(showMyDataModalAtom);
  const [value, setValue] = useState("1");
  const [fileName, setFileName] = useState("");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  const onClose = useCallback(() => {
    setShowMyDataModal(false);
  }, [setShowMyDataModal]);

  const handleSubmit = useCallback(() => {
    console.log("called");
  }, []);

  const disabled = useMemo(() => {
    if (fileName) return false;
    return true;
  }, [fileName]);

  return (
    <SharedModal
      isVisible={showMyDataModal}
      title="Myデータ"
      disabled={disabled}
      buttonTitle="シーンに追加"
      isIcon={true}
      buttonIcon={<AddIcon />}
      onClose={onClose}
      onSubmit={handleSubmit}>
      <Box sx={{ width: "100%", typography: "body1", borderTop: "1px solid #0000001f" }}>
        <TabContext value={value}>
          <TabList onChange={handleChange}>
            <Tab label="ローカルのデータから追加" value="1" sx={{ flex: 1 }} />
            <Tab label="Webから追加" value="2" sx={{ flex: 1 }} />
          </TabList>
          <TabPanel value="1">
            <LocalDataTab fileName={fileName} setFileName={setFileName} />
          </TabPanel>
          <TabPanel value="2">Item Two</TabPanel>
        </TabContext>
      </Box>
    </SharedModal>
  );
};

export default MyData;
