export type MouseEvent = {
  lat?: number;
  lng?: number;
};
export type DistanceLegend = {
  label?: string;
  uniteLine?: number;
};
type actionType = "modal-google-open" | "modal-terrain-open" | "modal-close";

export type PostMessageProps = { action: actionType; payload?: any };
