import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<Api.OrderListQuery> }) {
  return useQuery(
    ["order", "list", params.query.skip, params.query.take],
    async () => {
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
