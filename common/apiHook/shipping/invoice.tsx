import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<Api.InvoiceListQuery> }) {
  return useQuery(
    ["invoice", "list", params.query.skip, params.query.take],
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

export function useDisconnect() {
  const queryClient = useQueryClient();

  return useMutation(
    ["invoice", "disconnect"],
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
        await queryClient.invalidateQueries(["invoice", "list"]);
        message.success("송장이 연결 해제되었습니다.");
      },
    }
  );
}
