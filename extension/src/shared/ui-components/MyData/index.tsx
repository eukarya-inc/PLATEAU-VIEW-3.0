import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { FC, useCallback, useState } from "react";

import SharedModal from "../Modal";

import LocalDataTab from "./LocalDataTab";
import { UserDataItem } from "./types";
import WebDataTab from "./WebDataTab";

type Props = {
  show: boolean;
  handleSubmit: (item: UserDataItem) => void;
  onClose?: () => void;
};

const MyDataModal: FC<Props> = ({ show, onClose, handleSubmit }) => {
  const [value, setValue] = useState("local");

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    if (event) setValue(newValue);
  }, []);

  return (
    <SharedModal isVisible={show} title="Myデータ" onClose={onClose}>
      <Box sx={{ width: "100%", typography: "body1", borderTop: "1px solid #0000001f" }}>
        <TabContext value={value}>
          <TabList onChange={handleTabChange}>
            <Tab label="ローカルのデータから追加" value="local" sx={{ flex: 1 }} />
            <Tab label="Webから追加" value="web" sx={{ flex: 1 }} />
          </TabList>
          <TabPanel value="local">
            <LocalDataTab onSubmit={handleSubmit} />
          </TabPanel>
          <TabPanel value="web">
            <WebDataTab onSubmit={handleSubmit} />
          </TabPanel>
        </TabContext>
      </Box>
    </SharedModal>
  );
};

export default MyDataModal;
