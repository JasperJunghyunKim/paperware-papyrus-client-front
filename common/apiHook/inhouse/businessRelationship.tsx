import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: {
  query: Partial<Api.BusinessRelationshipListQuery>;
}) {
  return useQuery(
    [
      "inhouse",
      "business-relationship",
      params.query.skip,
      params.query.take,
      params.query.srcCompanyId,
      params.query.dstCompanyId,
    ],
    async () => {
      const resp = await axios.get<Api.BusinessRelationshipListResponse>(
        `${API_HOST}/inhouse/business-relationship`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.BusinessRelationshipCreateRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/business-relationship`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship",
        ]);
      },
    }
  );
}
