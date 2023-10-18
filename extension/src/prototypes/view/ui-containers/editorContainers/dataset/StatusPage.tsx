import { Dataset } from "../../../../../shared/api/types";
import { StatusBlock } from "./blocks/StatusBlock";

type StatusPageProps = {
  dataset?: Dataset;
};

export const StatusPage: React.FC<StatusPageProps> = ({ dataset }) => {
  return <StatusBlock dataset={dataset} />;
};
