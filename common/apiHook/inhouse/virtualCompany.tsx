import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetItem(params: { id: number | false }) {
  return useQuery(["inhouse", "virtual-company"], async () => {
    if (params.id === false) {
      return null;
    }
    const resp = await axios.get<Api.VirtualCompanyItemResponse>(
      `${API_HOST}/inhouse/virtual-company/${params.id}`
    );
    return resp.data;
  });
}

export function useGetList(params: {
  query: Partial<Api.VirtualCompanyListQuery>;
}) {
  return useQuery(
    ["inhouse", "virtual-company", params.query.skip, params.query.take],
    async () => {
      const resp = await axios.get<Api.VirtualCompanyListResponse>(
        `${API_HOST}/inhouse/virtual-company`,
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
    async (params: { data: Api.VirtualCompanyCreateRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/virtual-company`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "virtual-company"]);
      },
    }
  );
}

export function useUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.VirtualCompanyUpdateRequest; id: number }) => {
      const resp = await axios.put(
        `${API_HOST}/inhouse/virtual-company/${params.id}`,
        params
      );
      return resp.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "virtual-company"]);
      },
    }
  );
}

export function useDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: number) => {
      const resp = await axios.delete(
        `${API_HOST}/inhouse/virtual-company/${id}`
      );
      return resp.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "virtual-company"]);
      },
    }
  );
}
