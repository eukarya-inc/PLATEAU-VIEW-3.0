import { fetchWithDelete, fetchWithGet, fetchWithPatch, fetchWithPost } from "../fetch";

export type PlateauAPIType = "data" | "templates";

export class PlateauAPIClient<V> {
  projectId: string;
  url: string;
  type: PlateauAPIType;

  constructor(projectId: string, url: string, type: PlateauAPIType) {
    this.projectId = projectId;
    this.url = url;
    this.type = type;
  }

  baseUrl() {
    return `${this.url}/${this.type}`;
  }

  urlWithId(id: string) {
    return `${this.baseUrl()}/${id}`;
  }

  async findAll(): Promise<V[]> {
    return await fetchWithGet(this.baseUrl());
  }

  async findById(id: string): Promise<V> {
    return await fetchWithGet(this.urlWithId(id));
  }

  async save(data: V[]) {
    return await fetchWithPost(this.baseUrl(), data);
  }

  async update(id: string, data: V) {
    return await fetchWithPatch(this.urlWithId(id), data);
  }

  async delete(id: string) {
    return await fetchWithDelete(this.urlWithId(id));
  }
}
