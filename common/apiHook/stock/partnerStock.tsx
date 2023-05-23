import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetList(params: {
  query: Partial<Api.PartnerStockGroupListQuery>;
}) {
  return useQuery(
    ["partner-stock", params.query, "group", "list"],
    async () => {
      const { data } = await axios.get<Api.PartnerStockGroupListResponse>(
        `${API_HOST}/partner/stock/group`,
        {
          params: params.query,
        }
      );

      return data;
    }
  );
}
