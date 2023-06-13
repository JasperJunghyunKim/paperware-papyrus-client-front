import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: {
  query: Partial<Api.StockArrivalListQuery>;
}) {
  return useQuery(["stock-arrival", "list"], async () => {
    const { data } = await axios.get<Api.OrderStockArrivalListResponse>(
      `${API_HOST}/stock-arrival`,
      {
        params: params.query,
      }
    );

    return data;
  });
}

export function useApply() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { planId: number; body: Api.StockArrivalApplyRequest }) => {
      const { data } = await axios.post<Api.StockArrivalResponse>(
        `${API_HOST}/stock-arrival/${params.planId}/apply`,
        params.body
      );

      return data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["stock-arrival", "list"]);
        message.info("재고 입고가 완료되었습니다.");
      },
    }
  );
}
