import { Api } from "@/@shared";
import {
  AddOrderToTaxInvoiceRequest,
  DeleteOrderFromTaxInvoiceRequest,
  GetTaxInvoiceListQuery,
  TaxInvoiceOrderListResponse,
} from "@/@shared/api";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<GetTaxInvoiceListQuery> }) {
  return useQuery(
    ["taxInvoice", "list", params.query.skip, params.query.take],
    async () => {
      const resp = await axios.get<Api.GetTaxInvoiceListResponse>(
        `${API_HOST}/tax-invoice`,
        { params: params.query }
      );
      return resp.data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(
    ["taxInvoice", "item", params.id],
    async () => {
      const resp = await axios.get<Api.GetTaxInvoiceItemResponse>(
        `${API_HOST}/tax-invoice/${params.id}`
      );
      return resp.data;
    },
    { enabled: !!params.id }
  );
}

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.CreateTaxInvoiceRequest }) => {
      const resp = await axios.post(`${API_HOST}/tax-invoice`, params.data);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["taxInvoice"]);
      },
    }
  );
}

export function useUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number; data: Api.UpdateTaxInvoiceRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/tax-invoice/${params.id}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["taxInvoice"]);
      },
    }
  );
}

export function useDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number }) => {
      const resp = await axios.delete(`${API_HOST}/tax-invoice/${params.id}`);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["taxInvoice"]);
      },
    }
  );
}

export function useGetInvoiceOrderList(params: { id: number | null }) {
  return useQuery(["taxInvoice", "invoiceOrderList", params.id], async () => {
    if (!params.id) return null;

    const resp = await axios.get<TaxInvoiceOrderListResponse>(
      `${API_HOST}/tax-invoice/${params.id}/order`
    );
    return resp.data;
  });
}

export function useRegisterInvoiceOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number; data: AddOrderToTaxInvoiceRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/tax-invoice/${params.id}/order`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["taxInvoice"]);
        message.success("품목을 등록했습니다.");
      },
    }
  );
}

export function useDeleteInvoiceOrder() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number; data: DeleteOrderFromTaxInvoiceRequest }) => {
      const resp = await axios.delete(
        `${API_HOST}/tax-invoice/${params.id}/order`,
        {
          data: params.data,
        }
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["taxInvoice"]);
        message.success("품목을 삭제했습니다.");
      },
    }
  );
}
