export type MouseEventData = {
  lat?: number;
  lng?: number;
};
type actionType = "modal-google-open" | "modal-terrain-open" | "modal-close";

export type PostMessageProps = { action: actionType; payload?: any };
