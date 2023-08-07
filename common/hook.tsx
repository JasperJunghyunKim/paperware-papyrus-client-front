import { useEffect, useState } from "react";
import { ApiHook, Util } from ".";

export function usePage() {
  const [page, setPage] = useState<ApiHook.Common.GetPaginationQuery>({
    skip: 0,
    take: 100,
  });

  return [page, setPage] as const;
}

export function useSelection<T>(dependancies: any[] = []) {
  const [selected, setSelected] = useState<T[]>([]);
  const only = Util.only(selected);

  useEffect(() => setSelected([]), dependancies);

  return [selected, setSelected, only] as const;
}
