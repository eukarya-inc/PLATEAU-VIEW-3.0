import { waitRequest, request } from "./intermediator";

export const send = async <R, E>(name: string, r: R | E) => {
  request({ name, result: r });
  await waitRequest(name);
};
