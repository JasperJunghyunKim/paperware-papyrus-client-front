import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetItem(params: { id: number | false }) {
  return useQuery(["inhouse", "location", params.id], async () => {
    if (params.id === false) {
      return null;
    }
    const resp = await axios.get<Api.LocationItemResponse>(
      `${API_HOST}/inhouse/location/${params.id}`
    );
    return resp.data;
  });
}

export function useGetList(params: { query: Partial<Api.LocationListQuery> }) {
  return useQuery(
    ["inhouse", "location", params.query.skip, params.query.take],
    async () => {
      const resp = await axios.get<Api.LocationListResponse>(
        `${API_HOST}/inhouse/location`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useGetListForSales(params: {
  query: Partial<Api.LocationForSalesListQuery>;
}) {
  return useQuery(
    [
      "inhouse",
      "location",
      "sales",
      params.query.skip,
      params.query.take,
      params.query.targetCompanyId,
    ],
    async () => {
      if (!params.query.targetCompanyId) {
        return null;
      }

      const resp = await axios.get<Api.LocationListResponse>(
        `${API_HOST}/inhouse/location/for-sales`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.LocationCreateRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/location`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["inhouse", "location"]);
      },
    }
  );
}

export function useUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.LocationUpdateRequest; id: number }) => {
      const resp = await axios.put(
        `${API_HOST}/inhouse/location/${params.id}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["inhouse", "location"]);
      },
    }
  );
}

export function useDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: number) => {
      const resp = await axios.delete(`${API_HOST}/inhouse/location/${id}`);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["inhouse", "location"]);
      },
    }
  );
}
