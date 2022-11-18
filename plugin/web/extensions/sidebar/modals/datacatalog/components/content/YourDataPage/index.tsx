import PageLayout from "../PageLayout";

import Details, { Data } from "./Details";
import FileSelectPane from "./FileSelect";

export type Props = {
  onDatasetAdd: (dataset: Data) => void;
};

const YourDataPage: React.FC<Props> = ({ onDatasetAdd }) => {
  return <PageLayout left={<FileSelectPane />} right={<Details onDatasetAdd={onDatasetAdd} />} />;
};

export default YourDataPage;
