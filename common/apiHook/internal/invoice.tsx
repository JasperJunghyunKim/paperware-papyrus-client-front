import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import {
  GetPaginationQuery,
  useCreate,
  useDelete,
  useQueryItem,
  useUpdate,
} from "../common/prelude";

export function useGet(id: number | false) {
  return useQueryItem<Record.Invoice>("internal/invoice", ["invoice"], id);
}

export interface GetListQuery extends GetPaginationQuery {}
export function useGetList(query: GetListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Invoice>(
    "internal/invoice",
    ["invoice"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export interface CreateItem {
  shippingId: number;
  stockEventId: number;
}
export function useCreateItem() {
  return useCreate<CreateItem>("internal/invoice", [["invoice"]]);
}

export function useDeleteItem() {
  return useDelete("internal/invoice", [["invoice"]]);
}
