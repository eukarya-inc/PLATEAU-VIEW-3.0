import { ApolloClient, InMemoryCache } from "@apollo/client";

import { GEO_API } from "../constants";

export const client = new ApolloClient({
  uri: `${GEO_API}/graphql`,
  cache: new InMemoryCache(),
});
