export type FieldBase<T> = {
  value?: {
    storeable?: {
      omitPropertyNames: string[]; // Specified properties are omited to save to local storage
    };
  };
  preset?: {
    defaultValue?: string | number;
  };
} & T;
