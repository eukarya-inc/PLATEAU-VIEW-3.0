import { fetchWithGet } from "../fetch";

export class CityGMLClient {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  handleError(obj: any) {
    if (!obj) return;
    if (typeof obj !== "object") return;
    if ("error" in obj) {
      console.error(obj.error);
      return;
    }
    return obj;
  }

  async getFiles(conditions: string) {
    return this.handleError(await fetchWithGet(`${this.url}/${conditions}`));
  }
}
