import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetItem(params: { id: number | false }) {
  return useQuery(["inhouse", "warehouse", params.id], async () => {
    if (params.id === false) {
      return null;
    }
    const resp = await axios.get<Api.WarehouseItemResponse>(
      `${API_HOST}/inhouse/warehouse/${params.id}`
    );
    return resp.data;
  });
}

export function useGetList(params: { query: Partial<Api.WarehouseListQuery> }) {
  return useQuery(
    ["inhouse", "warehouse", params.query.skip, params.query.take],
    async () => {
      const resp = await axios.get<Api.WarehouseListResponse>(
        `${API_HOST}/inhouse/warehouse`,
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
    async (params: { data: Api.WarehouseCreateRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/warehouse`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "warehouse"]);
      },
    }
  );
}

export function useUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.WarehouseUpdateRequest; id: number }) => {
      const resp = await axios.put(
        `${API_HOST}/inhouse/warehouse/${params.id}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "warehouse"]);
      },
    }
  );
}

export function useDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: number) => {
      const resp = await axios.delete(`${API_HOST}/inhouse/warehouse/${id}`);
      return resp.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "warehouse"]);
      },
    }
  );
}
