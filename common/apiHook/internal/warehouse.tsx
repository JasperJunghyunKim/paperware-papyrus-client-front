import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import {
  GetPaginationQuery,
  useCreate,
  useDelete,
  useQueryData,
  useQueryItem,
  useUpdate,
} from "../common/prelude";

export function useGetWarehouse(id: number | false) {
  return useQueryItem<Record.Warehouse>(
    "internal/warehouse",
    ["warehouse"],
    id
  );
}

export interface GetWarehouseListQuery extends GetPaginationQuery {}
export function useGetWarehouseList(query: GetWarehouseListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Warehouse>(
    "internal/warehouse",
    ["warehouse"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export function useGetWarehouseStats() {
  return useQueryData<Record.WarehouseStats>("internal/warehouse/stats", [
    "warehouse",
    "stats",
  ]);
}

export interface CreateWarehouse {
  name: string;
  code: string | null;
  isPublic: boolean;
  address: string;
}
export function useCreateWarehouse() {
  return useCreate<CreateWarehouse>("internal/warehouse", [["warehouse"]]);
}

export interface UpdateWarehouse {
  name: string;
  code: string | null;
  isPublic: boolean;
  address: string;
}
export function useUpdateWarehouse() {
  return useUpdate<UpdateWarehouse>("internal/warehouse", [["warehouse"]]);
}

export function useDeleteWarehouse() {
  return useDelete("internal/warehouse", [["warehouse"]]);
}
