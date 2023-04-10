import { isObject, mergeWith, cloneDeep, merge } from "lodash";

const mergeDeep = (obj1: any, obj2: any): any => {
  const merged = cloneDeep(obj1);
  mergeWith(merged, obj2, (mergedValue, obj2Value) => {
    if (isObject(mergedValue)) {
      return merge(mergedValue, obj2Value);
    }
    return obj2Value !== undefined ? obj2Value : mergedValue;
  });
  return merged;
};

export const mergeDefaultOverrides = (obj1: any, obj2: any, format: string) => {
  const res = mergeDeep(obj1, obj2);
  return format === "gtfs" ? mergeDeep(res, { model: { heightReference: "clamp" } }) : res;
};
