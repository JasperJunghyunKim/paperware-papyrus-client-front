import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetItem(params: { id: number | false }) {
  return useQuery(["inhouse", "company"], async () => {
    if (params.id === false) {
      return null;
    }
    const resp = await axios.get<Api.CompanyItemResponse>(
      `${API_HOST}/inhouse/company/${params.id}`
    );
    return resp.data;
  });
}

export function useGetList(params: { query: Partial<Api.CompanyListQuery> }) {
  return useQuery(
    ["inhouse", "company", params.query.skip, params.query.take],
    async () => {
      const resp = await axios.get<Api.CompanyListResponse>(
        `${API_HOST}/inhouse/company`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}
