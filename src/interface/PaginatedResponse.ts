export interface PaginatedResponse<Item> {
  items: Item[];
  meta: MetaPage;
}

export interface MetaPage {
  currentPage: number;
  nextPage: number;
  hasNext: boolean;
  pageRecords: number;
  totalRecords: number;
  actualIndex: number;
  numberOfPages: number;
}
