import { Api } from "@/@shared";
import { AccountedUnpaidListQuery } from "@/@shared/api";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetList(params: {
  query: Partial<AccountedUnpaidListQuery>;
}) {
  return useQuery(
    [
      "accounted",
      "unpaid",
      params.query.skip,
      params.query.take,
      params.query.accountedType,
      params.query.companyRegistrationNumbers,
      params.query.minAmount,
      params.query.maxAmount,
    ],
    async () => {
      const resp = await axios.get<Api.AccountedUnpaidListResponse>(
        `${API_HOST}/accounted/unpaid`,
        { params: params.query }
      );
      return resp.data;
    }
  );
}
