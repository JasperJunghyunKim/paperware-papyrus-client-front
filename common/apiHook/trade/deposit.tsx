import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetList(params: {
  query: Partial<Api.OrderDepositListQuery>;
}) {
  return useQuery(
    [
      "deposit",
      params.query.skip,
      params.query.take,
      params.query.type,
      params.query.companyRegistrationNumber,
    ],
    async () => {
      const resp = await axios.get<Api.DepositListResponse>(
        `${API_HOST}/deposit`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}
