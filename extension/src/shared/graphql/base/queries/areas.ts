import { gql } from "../__gen__/gql";

export const AREAS = gql(`
  query GetAreas($longitude: Float!, $latitude: Float!, $includeRadii: Boolean) {
    areas(longitude: $longitude, latitude: $latitude, includeRadii: $includeRadii) {
      areas {
        code
        name
        radius
        type
      },
      address
    }
  }
`);
