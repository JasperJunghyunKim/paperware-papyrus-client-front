import {
  OrderRequestCreateRequest,
  OrderRequestItemDoneRequest,
  OrderRequestItemListQuery,
} from "@/@shared/api";
import {
  OrderRequestItemListResponse,
  OrderRequestResponse,
} from "@/@shared/api/trade/order-request.response";
import { OrderRequestItem } from "@/@shared/models";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: {
  query: Partial<OrderRequestItemListQuery>;
}) {
  return useQuery(
    [
      "orderRequest",
      "list",
      params.query.skip,
      params.query.take,
      params.query.srcCompanyId,
      params.query.dstCompanyId,
    ],
    async () => {
      if (!params.query.srcCompanyId && !params.query.dstCompanyId) return null;

      const resp = await axios.get<OrderRequestItemListResponse>(
        `${API_HOST}/order-request/item`,
        { params: params.query }
      );

      return resp.data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(
    ["orderRequest", "item", params.id],
    async () => {
      const resp = await axios.get<OrderRequestResponse>(
        `${API_HOST}/order-request/${params.id}`
      );

      return resp.data;
    },
    { enabled: !!params.id }
  );
}

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: OrderRequestCreateRequest }) => {
      const resp = await axios.post(`${API_HOST}/order-request`, params.data);

      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["orderRequest"]);

        message.success("퀵 주문이 등록되었습니다.");
      },
    }
  );
}

export function useCancel() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number }) => {
      const resp = await axios.patch(
        `${API_HOST}/order-request/item/${params.id}/cancel`
      );

      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["orderRequest"]);

        message.success("퀵 주문이 취소되었습니다.");
      },
    }
  );
}

export function useDone() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number; data: OrderRequestItemDoneRequest }) => {
      const resp = await axios.patch(
        `${API_HOST}/order-request/item/${params.id}/done`,
        params.data
      );

      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["orderRequest"]);

        message.success("퀵 주문이 완료 처리되었습니다.");
      },
    }
  );
}

export function useCheck() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number }) => {
      const resp = await axios.patch(
        `${API_HOST}/order-request/item/${params.id}/check`
      );

      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["orderRequest"]);
      },
    }
  );
}
