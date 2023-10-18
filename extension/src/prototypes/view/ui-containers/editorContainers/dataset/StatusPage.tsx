import { Dataset } from "../../../../../shared/api/types";
import { StatusBlock } from "../../editorBlocks/StatusBlock";

type StatusPageProps = {
  dataset?: Dataset;
};

export const StatusPage: React.FC<StatusPageProps> = ({ dataset }) => {
  return <StatusBlock dataset={dataset} />;
};
