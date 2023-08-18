import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.OrderReturnCreateRequest }) => {
      const resp = await axios.post<Api.OrderReturnResponse>(
        `${API_HOST}/order/return`,
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
    async (params: { orderId: number; data: Api.OrderReturnUpdateRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/order/${params.orderId}/return`,
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
    async (params: {
      orderId: number;
      data: Api.OrderReturnUpdateStockRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/order/${params.orderId}/return/stock`,
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