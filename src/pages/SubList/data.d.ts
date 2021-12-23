export type TableListItem = {
  key?: number;
  name?: string;
  strategyName?: string;
  subStatue?: number;
  status?: string;
  coinName?: string;
  quoteName?: string;
  authorName?: string;
  platform?: string;
  price?: string;
  entryIntoTime?: string;
  createTime?: string;
  facebookLink?: string;
  facebookName?: string;
  fmzLink?: string;
  fmzName?: string;
  introduce?: string;
  lastRecordId?: string;
  tradingviewLink?: string;
  tradingviewName?: string;
  twitterLink?: string;
  twitterName?: string;
};

export type TableListPagination = {
  total: number;
  pageSize: number;
  current: number;
};

export type TableListData = {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
};

export type TableListParams = {
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: Record<string, any[]>;
  sorter?: Record<string, any>;
};
