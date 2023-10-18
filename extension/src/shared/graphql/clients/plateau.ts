import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client";

import fragmentMatcher from "../base/plateau/__gen__/fragmentMatcher.json";

export let plateauClient: ApolloClient<NormalizedCacheObject> | undefined;
export const createPlateauClient = (url: string) => {
  plateauClient = new ApolloClient({
    uri: url,
    cache: new InMemoryCache({
      possibleTypes: fragmentMatcher.possibleTypes,
    }),
  });
};
