export class TileFeatureIndex {
  private _layerId: string;

  constructor(layerId: string) {
    this._layerId = layerId;
  }

  get features(): string[] {
    return (
      window.reearth?.layers
        ?.findById?.(this._layerId)
        ?.computed?.originalFeatures.map(f => f.id) ?? []
    );
  }
}
