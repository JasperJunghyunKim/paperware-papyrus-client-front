import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import { GetPaginationQuery, useCreate } from "../common/prelude";

export interface GetStockListQuery extends GetPaginationQuery {}
export function useGetStockList(query: GetStockListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.StockEvent>(
    "internal/arrival-stock",
    ["arrival-stock"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export interface ApplyStockArrival {
  stockEventId: number;
  warehouseId: number;
}
export function useApplyStockArrival() {
  return useCreate<ApplyStockArrival>(
    "internal/arrival-stock/apply",
    [["arrival-stock"]],
    {
      message: (_data, _variables) => "입고 처리되었습니다.",
    }
  );
}
