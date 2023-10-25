import { gql } from "../__gen__";

export const DATASET_FRAGMENT = gql(`
  fragment DatasetFragment on Dataset {
    id
    name
    subname
    description
    year
    groups
    prefectureId
    prefectureCode
    cityId
    cityCode
    wardId
    wardCode
    prefecture {
      name
      code
    }
    city {
      name
      code
    }
    ward {
      name
      code
    }
    type {
      id
      code
      name
      category
    }
    items {
      id
      format
      name
      url
      layers
    }
  }
`);
