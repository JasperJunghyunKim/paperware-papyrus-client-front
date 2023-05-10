import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import {
  GetPaginationQuery,
  useCreate,
  useQueryData,
  useQueryItem,
} from "../common/prelude";

export function useGetStock(id: number | false) {
  return useQueryItem<Record.Stock>("internal/stock", ["stock"], id);
}

export interface GetStockListQuery extends GetPaginationQuery {}
export function useGetStockList(
  query: GetStockListQuery,
  ignore: boolean = false
) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Stock>("internal/stock", ["stock"], {
    ...page,
    ...query,
    ignore,
  });

  return [data, page, setPage] as const;
}

export function useGetStockStats() {
  return useQueryData<Record.StockStats>("internal/stock/stats", [
    "stock",
    "stats",
  ]);
}

export interface CreateStock {
  warehouseId: number | null;
  productId: number;
  packagingId: number;
  grammage: number;
  sizeX: number;
  sizeY: number;
  paperColorGroupId: number | null;
  paperColorId: number | null;
  paperPatternId: number | null;
  paperCertIds: number[];
  price: number;
  quantity: number;
}
export function useCreateStock() {
  return useCreate<CreateStock>("internal/stock", [["stock"]]);
}
