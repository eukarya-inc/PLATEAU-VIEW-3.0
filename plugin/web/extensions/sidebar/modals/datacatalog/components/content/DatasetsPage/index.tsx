import PageLayout from "../PageLayout";

import DatasetTree from "./DatasetTree";
import DatasetDetails, { Dataset as DatasetType } from "./Details";

export type Dataset = DatasetType;

export type Props = {
  onDatasetAdd: (dataset: Dataset) => void;
};

const DatasetsPage: React.FC<Props> = ({ onDatasetAdd }) => {
  return (
    <PageLayout left={<DatasetTree />} right={<DatasetDetails onDatasetAdd={onDatasetAdd} />} />
  );
};

export default DatasetsPage;
