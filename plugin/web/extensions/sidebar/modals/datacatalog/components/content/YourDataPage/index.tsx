import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";
import { useCallback, useState } from "react";

import PageLayout from "../PageLayout";

import Details from "./Details";
import FileSelectPane from "./FileSelect";

export type Props = {
  onDatasetAdd: (dataset: UserDataItem) => void;
};

const YourDataPage: React.FC<Props> = ({ onDatasetAdd }) => {
  const [selectedDataset, setDataset] = useState<UserDataItem>();

  const handleOpenDetails = useCallback((data?: UserDataItem) => {
    setDataset(data);
  }, []);

  return (
    <PageLayout
      left={<FileSelectPane onOpenDetails={handleOpenDetails} />}
      right={<Details isShareable={false} dataset={selectedDataset} onDatasetAdd={onDatasetAdd} />}
    />
  );
};

export default YourDataPage;
