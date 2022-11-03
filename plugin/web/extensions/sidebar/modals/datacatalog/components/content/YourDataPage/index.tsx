import DatasetDetails, { Dataset } from "../DatasetDetails";
import PageLayout from "../PageLayout";

import FileSelectPane from "./FileSelect";

export type Props = {
  onDatasetAdd: (dataset: Dataset) => void;
};

const YourDataPage: React.FC<Props> = ({ onDatasetAdd }) => {
  return (
    <PageLayout left={<FileSelectPane />} right={<DatasetDetails onDatasetAdd={onDatasetAdd} />} />
  );
};

export default YourDataPage;
