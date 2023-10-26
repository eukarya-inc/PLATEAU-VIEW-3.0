export type FieldBase<T> = {
  storeable?: boolean;
  preset?: {
    defaultValue?: string | number;
  };
} & T;
