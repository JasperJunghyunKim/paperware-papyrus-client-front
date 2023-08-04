import { Api } from "@/@shared";
import {
  ShippingAssignMangerRequest,
  ShippingCreateResponse,
  ShippingResponse,
} from "@/@shared/api";
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
      params.query.types,
      params.query.shippingNo,
      params.query.managerIds,
      params.query.partnerCompanyRegistrationNumbers,
      params.query.memo,
      params.query.minCreatedAt,
      params.query.maxCreatedAt,
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

export function useGetItem(params: { shippingId: number | null }) {
  return useQuery(
    ["shipping", "item", params.shippingId],
    async () => {
      const resp = await axios.get<ShippingResponse>(
        `${API_HOST}/shipping/${params.shippingId}`
      );
      return resp.data;
    },
    {
      enabled: params.shippingId !== null,
    }
  );
}

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.ShippingCreateRequest }) => {
      const resp = await axios.post<ShippingCreateResponse>(
        `${API_HOST}/shipping`,
        params.data
      );
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

export function useUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { shippingId: number; data: Api.ShippingUpdateRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/shipping/${params.shippingId}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping"]);
        message.success("배송이 수정되었습니다.");
      },
    }
  );
}

export function useConnectInvoices() {
  const queryClient = useQueryClient();

  return useMutation(
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

export function useAssignManager() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: {
      shippingId: number;
      data: ShippingAssignMangerRequest;
    }) => {
      const resp = await axios.patch(
        `${API_HOST}/shipping/${params.shippingId}/manager`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping"]);
        message.success("담당자가 배정되었습니다.");
      },
    }
  );
}

export function useUnassignManager() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { shippingId: number }) => {
      const resp = await axios.delete(
        `${API_HOST}/shipping/${params.shippingId}/manager`
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["shipping"]);
        message.success("담당자 배정이 취소되었습니다.");
      },
    }
  );
}
