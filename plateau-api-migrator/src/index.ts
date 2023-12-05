import { convertData, convertTemplate } from "./converter";
import {
  fetchView2Data,
  fetchView2Datacatalog,
  fetchView2Template,
  fetchView3Data,
  fetchView3Template,
  postView3Data,
  postView3Template,
} from "./fetch";
import { Setting as View3Setting } from "./types/view3";

const main = async () => {
  const view2Data = await fetchView2Data();
  const view2Template = await fetchView2Template();
  const view2Datacatalog = await fetchView2Datacatalog();
  const view3Data = await fetchView3Data();
  const view3Template = await fetchView3Template();

  const convertedView3Templates = convertTemplate(view2Template, view3Template);
  const newView3Templates = await postView3Template(convertedView3Templates);

  const convertedView3Data = convertData(
    view2Data,
    view2Datacatalog.filter(d => d.type_en === "usecase"),
    view3Data,
    newView3Templates,
  );
  await postView3Data(convertedView3Data as View3Setting[]);
};

await main();
