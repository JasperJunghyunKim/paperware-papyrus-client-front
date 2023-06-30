import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQueryClient } from "react-query";

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "process", "create"],
    async (params: { data: Api.OrderProcessCreateRequest }) => {
      const resp = await axios.post<Api.OrderCreateResponse>(
        `${API_HOST}/order/process`,
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
    ["order", "process", "update"],
    async (params: {
      orderId: number;
      data: Api.OrderProcessInfoUpdateRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/order/process/${params.orderId}`,
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
    ["order", "process", "update", "stock"],
    async (params: {
      orderId: number;
      data: Api.OrderProcessStockUpdateRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/order/${params.orderId}/process/stock`,
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
