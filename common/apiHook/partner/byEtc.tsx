import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType } from "@/@shared/models/enum";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetByEtcItem(params: {
  id: number | false;
  method: Enum.Method | null;
  accountedType: AccountedType;
}) {
  return useQuery(["accounted", "etc", params.id, params.method], async () => {
    if (params.id === false) {
      return null;
    }
    if (params.method === null || params.method !== "ETC") {
      return null;
    }
    const resp = await axios.get<Api.ByEtcItemResponse>(
      `${API_HOST}/accounted/accountedType/${params.accountedType}/accountedId/${params.id}/etc`
    );
    return resp.data;
  });
}

export function useByEtcCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: any }) => {
      const resp = await axios.post(
        `${API_HOST}/accounted/accountedType/${params.data.accountedType}/etc`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["accounted", "list"]);
      },
    }
  );
}

export function useByEtcUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: any; id: number }) => {
      const resp = await axios.patch(
        `${API_HOST}/accounted/accountedType/${params.data.accountedType}/accountedId/${params.id}/etc`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["accounted", "list"]);
      },
    }
  );
}

export function useByEtcDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number | false; accountedType: AccountedType }) => {
      const resp = await axios.delete(
        `${API_HOST}/accounted/accountedType/${params.accountedType}/accountedId/${params.id}/etc`
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["accounted", "list"]);
      },
    }
  );
}
