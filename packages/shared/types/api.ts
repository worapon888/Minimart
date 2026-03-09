export type ApiResponse<T> = {
  ok: boolean;
  data: T;
  meta?: unknown;
};
