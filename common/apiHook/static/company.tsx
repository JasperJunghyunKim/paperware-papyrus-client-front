import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { GetPaginationQuery, useQueryPagination } from "../common";

export interface GetCompanyListQuery extends GetPaginationQuery {}
export function useGetCompanyList(query: GetCompanyListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Company>(
    "static/company",
    ["static-company"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}
