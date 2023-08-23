import { Api } from "@/@shared";
import { OrderStockGroupCreateRequest } from "@/@shared/api";
import { $query } from "@/common/apiTemplate";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "stock", "create"],
    async (params: { data: Api.OrderStockCreateRequest }) => {
      const resp = await axios.post<Api.OrderCreateResponse>(
        `${API_HOST}/order/stock`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, _variables) => {
        await queryClient.invalidateQueries(["order", "list"]);
        message.info("주문이 생성되었습니다.");
      },
    }
  );
}

export function useUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "stock", "update"],
    async (params: { orderId: number; data: Api.OrderStockUpdateRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/order/stock/${params.orderId}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["order", "list"]);
        await queryClient.invalidateQueries([
          "order",
          "item",
          variables.orderId,
        ]);
        message.info("수정사항이 저장되었습니다.");
      },
    }
  );
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "stock", "update", "stock"],
    async (params: {
      orderId: number;
      data: Api.OrderStockAssignStockUpdateRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/order/stock/${params.orderId}/assign`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["order", "list"]);
        await queryClient.invalidateQueries([
          "order",
          "item",
          variables.orderId,
        ]);
        message.info("수정사항이 저장되었습니다.");
      },
    }
  );
}

export const useCreateWithCart = () =>
  $query.useCreate<OrderStockGroupCreateRequest>(
    "order/stock/group",
    ["order", "cart"],
    "일괄등록 처리가 완료되었습니다."
  );
