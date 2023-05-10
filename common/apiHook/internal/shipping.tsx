import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import {
  GetPaginationQuery,
  useCreate,
  useDelete,
  useQueryItem,
} from "../common/prelude";

export function useGet(id: number | false) {
  return useQueryItem<Record.Shipping>("internal/shipping", ["shipping"], id);
}

export interface GetListQuery extends GetPaginationQuery {}
export function useGetList(query: GetListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Shipping>(
    "internal/shipping",
    ["shipping"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export interface CreateItem {}
export function useCreateItem() {
  return useCreate<CreateItem>("internal/shipping", [["shipping"]]);
}

export function useDeleteItem() {
  return useDelete("internal/shipping", [["shipping"]]);
}
