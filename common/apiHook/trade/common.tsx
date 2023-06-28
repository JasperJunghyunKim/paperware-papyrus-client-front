import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<Api.OrderListQuery> }) {
  return useQuery(
    [
      "order",
      "list",
      params.query.skip,
      params.query.take,
      params.query.dstCompanyId,
      params.query.srcCompanyId,
    ],
    async () => {
      if (!params.query.dstCompanyId && !params.query.srcCompanyId) {
        return null;
      }
      const resp = await axios.get<Api.OrderListResponse>(`${API_HOST}/order`, {
        params: params.query,
      });
      return resp.data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(["order", "item", params.id], async () => {
    if (!params.id) {
      return null;
    }

    const resp = await axios.get<Api.OrderItemResponse>(
      `${API_HOST}/order/${params.id}`
    );
    return resp.data;
  });
}

export function useGetOrderStockArrivalList(params: {
  orderId: number | null;
  query: Partial<Api.OrderStockArrivalListQuery>;
}) {
  return useQuery(
    [
      "order",
      "item",
      params.orderId,
      "arrival",
      "list",
      params.orderId,
      params.query.skip,
      params.query.take,
    ],
    async () => {
      if (!params.orderId) {
        return null;
      }

      const resp = await axios.get<Api.OrderStockArrivalListResponse>(
        `${API_HOST}/order/stock/${params.orderId}/arrival`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useRequest() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "request"],
    async (params: { orderId: number }) => {
      const resp = await axios.post(
        `${API_HOST}/order/${params.orderId}/request`
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
        message.info("요청되었습니다.");
      },
    }
  );
}

export function useCancel() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "cancel"],
    async (params: { orderId: number }) => {
      const resp = await axios.post(
        `${API_HOST}/order/${params.orderId}/cancel`
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
        message.info("취소되었습니다.");
      },
    }
  );
}

export function useAccept() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "accept"],
    async (params: { orderId: number }) => {
      const resp = await axios.post(
        `${API_HOST}/order/${params.orderId}/accept`
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
        message.info("승인되었습니다.");
      },
    }
  );
}

export function useReject() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "reject"],
    async (params: { orderId: number }) => {
      const resp = await axios.post(
        `${API_HOST}/order/${params.orderId}/reject`
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
        message.info("거절되었습니다.");
      },
    }
  );
}

export function useReset() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "reset"],
    async (params: { orderId: number }) => {
      const resp = await axios.post(
        `${API_HOST}/order/${params.orderId}/reset`
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
        message.info("초기화되었습니다.");
      },
    }
  );
}

export function useCreateArrival() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "arrival", "create"],
    async (params: {
      orderId: number;
      data: Api.OrderStockArrivalCreateRequest;
    }) => {
      const resp = await axios.post(
        `${API_HOST}/order/${params.orderId}/arrival`,
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
        await queryClient.invalidateQueries(["stockInhouse"]);
        message.info("입고 재고를 추가했습니다.");
      },
    }
  );
}

export function useGetTradePrice(params: { orderId: number | null }) {
  return useQuery(["order", "tradePrice", params.orderId], async () => {
    if (!params.orderId) {
      return null;
    }

    const resp = await axios.get<Api.TradePriceResponse>(
      `${API_HOST}/order/${params.orderId}/price`
    );
    return resp.data;
  });
}

export function useUpdateTradePrice() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "tradePrice", "update"],
    async (params: { orderId: number; data: Api.TradePriceUpdateRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/order/${params.orderId}/price`,
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
        message.info("거래가격을 저장했습니다.");
      },
    }
  );
}

export function useGetDeposit(params: { orderId: number | null }) {
  return useQuery(["order", "deposit", params.orderId], async () => {
    if (!params.orderId) {
      return null;
    }

    const resp = await axios.get<Api.OrderDepositResponse>(
      `${API_HOST}/order/${params.orderId}/deposit`
    );
    return resp.data;
  });
}

export function useCreateDeposit() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "deposit", "create"],
    async (params: {
      orderId: number;
      data: Api.OrderDepositAssignDepositCreateRequest;
    }) => {
      const resp = await axios.post(
        `${API_HOST}/order/${params.orderId}/deposit`,
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
        message.info("보관품 정보를 저장했습니다.");
      },
    }
  );
}

export function useUpdateDeposit() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "deposit", "update"],
    async (params: {
      orderId: number;
      data: Api.OrderDepositAssignDepositUpdateRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/order/${params.orderId}/deposit`,
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
        message.info("보관품 정보를 저장했습니다.");
      },
    }
  );
}

export function useDeleteDeposit() {
  const queryClient = useQueryClient();

  return useMutation(
    ["order", "deposit", "delete"],
    async (params: { orderId: number }) => {
      const resp = await axios.delete(
        `${API_HOST}/order/${params.orderId}/deposit`
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
        message.info("보관품 정보를 삭제했습니다.");
      },
    }
  );
}
