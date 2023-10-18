import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client";

export let client: ApolloClient<NormalizedCacheObject> | undefined;
export const createClient = (url: string) => {
  client = new ApolloClient({
    uri: `${url}/graphql`,
    cache: new InMemoryCache(),
  });
};
