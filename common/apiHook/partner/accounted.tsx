import { Api } from "@/@shared";
import { isValidDateRange } from "@/@shared/helper/util";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useQuery } from "react-query";

export function useAccountedList(params: {
  query: Partial<Api.AccountedQuery>;
}) {
  return useQuery(
    [
      "accounted",
      "list",
      params.query.skip,
      params.query.take,
      params.query.partnerId,
      params.query.accountedType,
      params.query.accountedSubject,
      params.query.accountedMethod,
      params.query.accountedFromDate,
      params.query.accountedToDate,
    ],
    async () => {
      if (
        params.query.accountedFromDate === "" ||
        params.query.accountedToDate === ""
      ) {
        return;
      } else if (
        !isValidDateRange(
          new Date(params.query.accountedFromDate ?? ""),
          new Date(params.query.accountedToDate ?? "")
        )
      ) {
        return;
      }

      const resp = await axios.get<Api.AccountedListResponse>(
        `${API_HOST}/accounted/accountedType/${params.query.accountedType}`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}
