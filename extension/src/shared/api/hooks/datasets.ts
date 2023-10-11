import { atom, useAtom } from "jotai";
import { useCallback } from "react";

// import { DATA_API } from "../../constants";
import { mockDatasets } from "../mock";
import { Dataset } from "../types";

const datasetsAtom = atom<Dataset[]>([]);

export default () => {
  const [_, setDatasets] = useAtom(datasetsAtom);

  const handleDatasetsFetch = useCallback(async () => {
    // TODO: use the new datacatalog API
    // const response = await fetch(`${DATA_API}/datacatalog/plateau-2022`);
    // const data = await response.json();

    // // convert datacatalog to datasets
    // const datasets = data.map((d: any) => ({
    //   id: d.id,
    //   name: d.name,
    //   format: d.format,
    //   url: d.url,
    // }));

    setDatasets(mockDatasets);
  }, [setDatasets]);

  return {
    datasetsAtom,
    handleDatasetsFetch,
  };
};
