import { useState } from "react";
import { ApiHook } from ".";

export function usePage() {
  const [page, setPage] = useState<ApiHook.Common.GetPaginationQuery>({
    skip: 0,
    take: 100,
  });

  return [page, setPage] as const;
}
