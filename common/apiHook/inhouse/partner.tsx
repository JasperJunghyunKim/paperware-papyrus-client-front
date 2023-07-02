import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetList(params: { query: Partial<Api.PartnerListQuery> }) {
  return useQuery(
    ["inhouse", "partner", params.query.skip, params.query.take],
    async () => {
      const resp = await axios.get<Api.PartnerListResponse>(
        `${API_HOST}/inhouse/partner`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}
