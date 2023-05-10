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

export function useGetLocation(id: number | false) {
  return useQueryItem<Record.Location>("internal/location", ["location"], id);
}

export interface GetLocationListQuery extends GetPaginationQuery {}
export function useGetLocationList(query: GetLocationListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Location>(
    "internal/location",
    ["location"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export function useGetLocationStats() {
  return useQueryData<Record.LocationStats>("internal/location/stats", [
    "location",
    "stats",
  ]);
}

export interface CreateLocation {
  name: string;
  code: string | null;
  isPublic: boolean;
  address: string;
}
export function useCreateLocation() {
  return useCreate<CreateLocation>("internal/location", [["location"]]);
}

export interface UpdateLocation {
  name: string;
  code: string | null;
  isPublic: boolean;
  address: string;
}
export function useUpdateLocation() {
  return useUpdate<UpdateLocation>("internal/location", [["location"]]);
}

export function useDeleteLocation() {
  return useDelete("internal/location", [["location"]]);
}
