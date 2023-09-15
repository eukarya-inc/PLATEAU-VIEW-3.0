import {
  useQuery as useApolloQuery,
  useLazyQuery as useApolloLazyQuery,
  DocumentNode,
  TypedDocumentNode,
  OperationVariables,
  QueryHookOptions,
  NoInfer,
  QueryResult,
  LazyQueryResultTuple,
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

export const useLasyQuery = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>,
): LazyQueryResultTuple<TData, TVariables> => {
  return useApolloLazyQuery(query, {
    ...options,
    client,
  });
};
