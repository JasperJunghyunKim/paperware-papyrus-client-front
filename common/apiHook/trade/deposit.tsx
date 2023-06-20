import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

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

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    ["deposit", "create"],
    async (params: { data: Api.DepositCreateRequest }) => {
      const resp = await axios.post<Api.DepositCreateRequest>(
        `${API_HOST}/deposit`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, _variables) => {
        await queryClient.invalidateQueries(["deposit", "list"]);
      },
    }
  );
}