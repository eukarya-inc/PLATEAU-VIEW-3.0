import { CatalogItem } from "@web/extensions/sidebar/core/processCatalog";

import PageLayout from "../PageLayout";

import Details from "./Details";
import FileSelectPane from "./FileSelect";

export type Props = {
  onDatasetAdd: (dataset: CatalogItem) => void;
};

const YourDataPage: React.FC<Props> = ({ onDatasetAdd }) => {
  return <PageLayout left={<FileSelectPane />} right={<Details onDatasetAdd={onDatasetAdd} />} />;
};

export default YourDataPage;
