declare global {
  interface Window {
    __PLATEAUVIEW3_STATE_UPDATE_EVENT?: CustomEvent;
  }
}

const messagePrefix = "PLATEAUVIEW3_STATE_UPDATE_MESSAGE";
const makeName = (name: string) => `${messagePrefix}_${name}`;

export type InstructionRequest<R = unknown> = {
  name: string;
  result?: R;
};

export const request = <R>(r: InstructionRequest<R>) =>
  window.postMessage({ ...r, name: makeName(r.name) });

export const waitRequest = (name: string) =>
  new Promise(resolve => {
    const cb = (msg: MessageEvent<InstructionRequest>) => {
      if (msg.data.name !== makeName(name)) {
        return;
      }
      resolve(undefined);
      window.removeEventListener("message", cb);
    };
    window.addEventListener("message", cb);
  });

export const observeRequest = <R>(name: string, cb: (r: R | undefined) => Promise<void>) => {
  const observe = async (msg: MessageEvent<InstructionRequest<R>>) => {
    if (msg.data.name !== makeName(name)) {
      return;
    }
    await cb(msg.data.result);
  };
  window.addEventListener("message", observe);
  return () => window.removeEventListener("message", observe);
};
