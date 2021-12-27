export type TableListItem = {
  key?: number;
  address?: any;
  signalId?: string;
  entryprice?: any;
  lastRecordId?: string;
  side?: string;
  createdAt?: number;
  updatedAt?: number;
  memo?: string;
  time?: string;
  coinName?: string;
  quoteName?: string;
  leverage?: any;
  bnbbalance?: any;
  busdbalance?: any;
  margin?: any;
  marginRatio?: any;
  liq?: any;
  pnl?: any;
  side?: any;
  size?: any;
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
