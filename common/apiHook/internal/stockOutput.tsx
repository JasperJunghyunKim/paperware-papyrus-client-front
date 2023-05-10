import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import { GetPaginationQuery, useCreate } from "../common/prelude";

export interface GetStockListQuery extends GetPaginationQuery {}
export function useGetStockList(query: GetStockListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.StockEvent>(
    "internal/stock-output",
    ["stock-output"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}
