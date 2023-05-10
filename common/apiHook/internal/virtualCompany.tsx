import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import {
  GetPaginationQuery,
  useCreate,
  useQueryData,
  useQueryItem,
} from "../common/prelude";

export function useGetVirtualCompany(id: number | false) {
  return useQueryItem<Record.Company>(
    "internal/company/virtual",
    ["company/virtual"],
    id
  );
}

export interface GetVirtualCompanyListQuery extends GetPaginationQuery {}
export function useGetVirtualCompanyList(query: GetVirtualCompanyListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Company>(
    "internal/company/virtual",
    ["company/virtual"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export function useGetVirtualCompanyStats() {
  return useQueryData<Record.VirtualCompanyStats>(
    "internal/company/virtual/stats",
    ["company/virtual", "stats"]
  );
}

export interface CreateVirtualCompany {
  name: string;
  code: string | null;
  isPublic: boolean;
  address: string;
}
export function useCreateVirtualCompany() {
  return useCreate<CreateVirtualCompany>("internal/company/virtual", [
    ["company/virtual"],
  ]);
}
