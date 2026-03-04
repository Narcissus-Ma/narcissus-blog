export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OptionItem {
  label: string;
  value: string;
}
