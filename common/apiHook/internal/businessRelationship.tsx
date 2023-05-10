import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import {
  GetPaginationQuery,
  useCreate,
  useQueryData,
  useQueryItem,
} from "../common/prelude";

export function useGetBusinessRelationship(
  args: { srcCompanyId: number; dstCompanyId: number } | false
) {
  return useQueryItem<Record.BusinessRelationship>(
    "internal/business-relationship",
    ["business-relationship"],
    args ? [args.srcCompanyId, args.dstCompanyId] : false
  );
}

export interface GetBusinessRelationshipPurchaseListQuery
  extends GetPaginationQuery {}
export function useGetBusinessRelationshipPurchaseList(
  query: GetBusinessRelationshipPurchaseListQuery
) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.BusinessRelationship>(
    "internal/business-relationship/purchase",
    ["business-relationship", "purchase"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export function useGetBusinessRelationshipPurchaseStats() {
  return useQueryData<Record.BusinessRelationshipStats>(
    "internal/business-relationship/purchase/stats",
    ["business-relationship", "purchase", "stats"]
  );
}

export interface GetBusinessRelationshipSalesListQuery
  extends GetPaginationQuery {}
export function useGetBusinessRelationshipSalesList(
  query: GetBusinessRelationshipSalesListQuery
) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.BusinessRelationship>(
    "internal/business-relationship/sales",
    ["business-relationship", "sales"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export function useGetBusinessRelationshipSalesStats() {
  return useQueryData<Record.BusinessRelationshipStats>(
    "internal/business-relationship/sales/stats",
    ["business-relationship", "sales", "stats"]
  );
}

export interface CreateBusinessRelationship {
  dstCompanyId: number;
}
export function useCreateBusinessRelationship() {
  return useCreate<CreateBusinessRelationship>(
    "internal/business-relationship",
    [["business-relationship"]]
  );
}

export interface CreateVirtualPurchaseBusinessRelationship {
  srcCompanyId: number;
}

export function useCreateVirtualPurchaseBusinessRelationship() {
  return useCreate<CreateVirtualPurchaseBusinessRelationship>(
    "internal/business-relationship/virtual/purchase",
    [["business-relationship"]]
  );
}
