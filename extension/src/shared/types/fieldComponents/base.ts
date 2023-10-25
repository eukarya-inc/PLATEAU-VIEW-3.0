export type FieldBase<T> = {
  storeable?: boolean;
  preset?: {
    value?: string | number;
  };
} & T;
