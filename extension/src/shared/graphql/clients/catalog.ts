import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client";

import fragmentMatcher from "../base/catalog/__gen__/fragmentMatcher.json";

export let catalogClient: ApolloClient<NormalizedCacheObject> | undefined;
export const createCatalogClient = (url: string) => {
  catalogClient = new ApolloClient({
    uri: url,
    cache: new InMemoryCache({
      possibleTypes: fragmentMatcher.possibleTypes,
    }),
  });
};
