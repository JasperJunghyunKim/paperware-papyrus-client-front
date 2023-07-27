import { Api, Model } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<Api.InvoiceListQuery> }) {
  return useQuery(
    [
      "invoice",
      "list",
      params.query.skip,
      params.query.take,
      params.query.shippingId,
      params.query.planId,
    ],
    async () => {
      const resp = await axios.get<Api.InvoiceListResponse>(
        `${API_HOST}/invoice`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(
    ["invoice", "item", params.id],
    async () => {
      const resp = await axios.get<Model.Invoice>(
        `${API_HOST}/invoice/${params.id}`
      );
      return resp.data;
    },
    { enabled: !!params.id }
  );
}

export function useDisconnect() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.InvoiceDisconnectShippingRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/invoice/disconnect`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping", "list"]);
        await queryClient.invalidateQueries(["shipping", "item"]);
        await queryClient.invalidateQueries(["invoice"]);
        message.success("송장이 연결 해제되었습니다.");
      },
    }
  );
}

export function useForward() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.UpdateInvoiceStatusRequest }) => {
      const resp = await axios.post(`${API_HOST}/invoice/forward`, params.data);
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping", "list"]);
        await queryClient.invalidateQueries(["shipping", "item"]);
        await queryClient.invalidateQueries(["invoice"]);
        message.success("선택한 송장의 상태가 업데이트 되었습니다.");
      },
    }
  );
}

export function useBackward() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.UpdateInvoiceStatusRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/invoice/backward`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping", "list"]);
        await queryClient.invalidateQueries(["shipping", "item"]);
        await queryClient.invalidateQueries(["invoice"]);
        message.success("선택한 송장의 상태가 업데이트 되었습니다.");
      },
    }
  );
}

export function useCancel() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.UpdateInvoiceStatusRequest }) => {
      const resp = await axios.post(`${API_HOST}/invoice/cancel`, params.data);
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping", "list"]);
        await queryClient.invalidateQueries(["shipping", "item"]);
        await queryClient.invalidateQueries(["invoice"]);
        message.success("선택한 송장이 취소 되었습니다.");
      },
    }
  );
}
