export type TableListItem = {
  key?: number;
  address?: string;
  signalId?: string;
  amount?: number;
  lastRecordId?: string;
  side?: string;
  createdAt?: number;
  updatedAt?: number;
  memo?: string;
  time?: string;
  coinName?: string;
  quoteName?: string;
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
