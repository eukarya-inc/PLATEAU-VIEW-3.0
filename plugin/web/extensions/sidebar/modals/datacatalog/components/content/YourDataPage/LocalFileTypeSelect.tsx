import { Select } from "@web/sharedComponents";

export const fileFormats = ".kml,.csv,.czml,.gpx,.geojson,.georss,.shapefile,.zip";

export type FileType =
  | "auto"
  | "geojson"
  | "kml"
  | "csv"
  | "czml"
  | "gpx"
  // | "json"
  | "georss"
  | "shapefile";

type Props = {
  onFileTypeSelect: (value: string) => void;
};

const FileTypeSelect: React.FC<Props> = ({ onFileTypeSelect }) => {
  const options = [
    {
      value: "auto",
      label: "Auto-detect (Recommended)",
    },
    {
      value: "geojson",
      label: "GeoJSON",
    },
    {
      value: "kml",
      label: "KML or KMZ",
    },
    {
      value: "csv",
      label: "CSV",
    },
    {
      value: "czml",
      label: "CZML",
    },
    {
      value: "gpx",
      label: "GPX",
    },
    // {
    //   value: "json",
    //   label: "JSON",
    // },
    {
      value: "georss",
      label: "GeoRSS",
    },
    {
      value: "shapefile",
      label: "ShapeFile (zip)",
    },
  ];

  return (
    <Select
      defaultValue="auto"
      style={{ width: "100%" }}
      onChange={onFileTypeSelect}
      options={options}
    />
  );
};

export default FileTypeSelect;
