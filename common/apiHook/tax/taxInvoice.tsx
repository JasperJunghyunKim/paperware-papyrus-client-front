import { Api } from "@/@shared";
import {
  GetTaxInvoiceListQuery,
  TaxInvoiceOrderListResponse,
} from "@/@shared/api";
import { API_HOST } from "@/common/const";
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

export function useGetItem(params: { id: number }) {
  return useQuery(["taxInvoice", "item", params.id], async () => {
    const resp = await axios.get<Api.GetTaxInvoiceItemResponse>(
      `${API_HOST}/tax-invoice/${params.id}`
    );
    return resp.data;
  });
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
  return useQuery(["taxInvoice", "invoiceOrderList"], async () => {
    if (!params.id) return null;

    const resp = await axios.get<TaxInvoiceOrderListResponse>(
      `${API_HOST}/tax-invoice/${params.id}/order`
    );
    return resp.data;
  });
}
