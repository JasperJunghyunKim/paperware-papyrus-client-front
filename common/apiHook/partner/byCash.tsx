import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType } from "@/@shared/models/enum";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetByCashItem(params: {
  id: number | false;
  method: Enum.Method | null;
  accountedType: AccountedType;
}) {
  return useQuery(["accounted", "cash", params.id, params.method], async () => {
    if (params.id === false) {
      return null;
    }
    if (params.method === null || params.method !== "CASH") {
      return null;
    }

    const resp = await axios.get<Api.ByCashItemResponse>(
      `${API_HOST}/accounted/accountedType/${params.accountedType}/accountedId/${params.id}/cash`
    );
    return resp.data;
  });
}

export function useByCashCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: any }) => {
      const resp = await axios.post(
        `${API_HOST}/accounted/accountedType/${params.data.accountedType}/cash`,
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

export function useByCashUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: any; id: number }) => {
      const resp = await axios.patch(
        `${API_HOST}/accounted/accountedType/${params.data.accountedType}/accountedId/${params.id}/cash`,
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

export function useByCashDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number | false; accountedType: AccountedType }) => {
      const resp = await axios.delete(
        `${API_HOST}/accounted/accountedType/${params.accountedType}/accountedId/${params.id}/cash`
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
