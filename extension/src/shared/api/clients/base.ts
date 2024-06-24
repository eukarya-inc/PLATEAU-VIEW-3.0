import invariant from "tiny-invariant";

import { fetchWithDelete, fetchWithGet, fetchWithPatch, fetchWithPost } from "../fetch";

export type PlateauAPIType = "data" | "templates";

export type CityOptions = { projectId: string; token: string };

export class PlateauAPIClient<V> {
  projectId: string;
  url: string;
  token: string;
  type: PlateauAPIType;
  cityOptions?: CityOptions;

  constructor(
    projectId: string,
    url: string,
    token: string,
    type: PlateauAPIType,
    cityOptions?: CityOptions,
  ) {
    this.projectId = projectId;
    this.url = url;
    this.token = token;
    this.type = type;
    this.cityOptions = cityOptions;
  }

  baseUrl() {
    return `${this.url}/${this.projectId}/${this.type}`;
  }

  baseUrlForCity() {
    invariant(this.cityOptions);
    return `${this.url}/${this.cityOptions.projectId}/${this.type}`;
  }

  urlWithId(id: string) {
    return this.cityOptions ? `${this.baseUrlForCity()}/${id}` : `${this.baseUrl()}/${id}`;
  }

  _token() {
    return this.cityOptions ? this.cityOptions.token : this.token;
  }

  handleError(obj: any) {
    if (!obj) return [];
    if (typeof obj === "object" && "error" in obj) return [];
    return obj;
  }

  // Combine the data only in findAll.
  async findAll(): Promise<V[]> {
    return this.handleError(
      await Promise.all<(Promise<V[]> | undefined)[]>([
        fetchWithGet(this.baseUrl()),
        this.cityOptions ? fetchWithGet(this.baseUrlForCity()) : undefined,
      ]).then(r => r.filter((v): v is V[] => !!v).flat()),
    );
  }

  async findAllForCity(): Promise<V[]> {
    return this.handleError(await fetchWithGet(this.baseUrlForCity()));
  }

  async findById(id: string): Promise<V> {
    return this.handleError(await fetchWithGet(this.urlWithId(id)));
  }

  async save(data: V) {
    return await fetchWithPost(
      this.cityOptions ? this.baseUrlForCity() : this.baseUrl(),
      data,
      this._token(),
    );
  }

  async update(id: string, data: V) {
    return await fetchWithPatch(this.urlWithId(id), data, this._token());
  }

  async delete(id: string) {
    return await fetchWithDelete(this.urlWithId(id), this._token());
  }
}
