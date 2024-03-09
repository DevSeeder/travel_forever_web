export interface ListInputFilter {
  key: string;
  label: string;
  type: string;
  options?: {
    label: string;
    value: string;
  }[];
}
