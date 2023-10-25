import { gql } from "../__gen__/gql";

export const DATASETS = gql(`
query Datasets($input: DatasetsInput!) {
  datasets(input: $input) {
    ...DatasetFragment
  }
}
`);

export const DATASET_BY_ID = gql(`
query DatasetById($id: ID!) {
  node(id: $id) {
    ... on Dataset {
      ...DatasetFragment
    }
  }
}
`);
