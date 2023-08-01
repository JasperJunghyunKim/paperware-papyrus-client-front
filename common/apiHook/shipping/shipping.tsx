import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<Api.ShippingListQuery> }) {
  return useQuery(
    [
      "shipping",
      "list",
      params.query.skip,
      params.query.take,
      params.query.invoiceStatus,
    ],
    async () => {
      const resp = await axios.get<Api.ShippingListResponse>(
        `${API_HOST}/shipping`,
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
    ["shipping", "create"],
    async (params: { data: Api.ShippingCreateRequest }) => {
      const resp = await axios.post(`${API_HOST}/shipping`, params.data);
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping", "list"]);
        message.success("배송이 생성되었습니다.");
      },
    }
  );
}

export function useConnectInvoices() {
  const queryClient = useQueryClient();

  return useMutation(
    ["shipping", "connectInvoices"],
    async (params: {
      shippingId: number;
      data: Api.ShippingConnectInvoicesRequest;
    }) => {
      const resp = await axios.post(
        `${API_HOST}/shipping/${params.shippingId}/invoice/connect`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries([
          "shipping",
          "item",
          "invoice",
          variables.shippingId,
        ]);
        await queryClient.invalidateQueries(["invoice", "list"]);
        await queryClient.invalidateQueries(["shipping", "list"]);
        message.success("송장이 연결되었습니다.");
      },
    }
  );
}

export function useDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    ["shipping", "delete"],
    async (params: { shippingId: number }) => {
      const resp = await axios.delete(
        `${API_HOST}/shipping/${params.shippingId}`
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping", "list"]);
        message.success("배송이 삭제되었습니다.");
      },
    }
  );
}
