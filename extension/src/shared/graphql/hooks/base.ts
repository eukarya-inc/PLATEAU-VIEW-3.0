import {
  useQuery as useApolloQuery,
  DocumentNode,
  TypedDocumentNode,
  OperationVariables,
  QueryHookOptions,
  NoInfer,
  QueryResult,
} from "@apollo/client";

import { client } from "../client";

export const useQuery = <TData = any, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>,
): QueryResult<TData, TVariables> => {
  return useApolloQuery(query, {
    ...options,
    client,
  });
};
