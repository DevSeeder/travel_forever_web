export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_ORDER_MODE = 'DESC';
export const DEFAULT_OPTIONS_ROWS_PER_PAGE = [5, 10, 15, 30, 50];

export const InputTypes = {
  Text: ['text', 'currency'],
  Number: ['number', 'double', 'integer', 'float'],
  Date: ['date'],
  Datetime: ['datetime'],
  Select: ['externalId'],
  Toggle: ['boolean'],
  Link: ['link'],
};
