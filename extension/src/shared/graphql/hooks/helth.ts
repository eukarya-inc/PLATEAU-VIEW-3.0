import { HEALTH } from "../base/queries/health";

import { useQuery } from "./base";

export const useHelth = (id: string) => {
  return useQuery(HEALTH, {
    variables: {
      id,
    },
  });
};
