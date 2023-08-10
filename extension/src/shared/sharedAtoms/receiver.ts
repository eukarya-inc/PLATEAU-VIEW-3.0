import { observeRequest, request } from "./intermediator";

export const receive = <R>(name: string, cb: (r: R | undefined) => Promise<void>) => {
  return observeRequest<R>(name, async r => {
    await (async () => {
      try {
        return await cb(r);
      } catch (e) {
        return new Error(`Failed to receive value: ${e}`);
      }
    })();
    request({ name });
  });
};
