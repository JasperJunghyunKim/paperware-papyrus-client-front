import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetGroupList(params: {
  query: Partial<Api.StockGroupListQuery>;
}) {
  return useQuery(
    ["stockInhouse", "groupList", params.query.skip, params.query.take],
    async () => {
      const resp = await axios.get<Api.StockGroupListResponse>(
        `${API_HOST}/stock/group`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useGetList(params: { query?: Partial<Api.StockListQuery> }) {
  return useQuery(
    [
      "stockInhouse",
      "list",
      params.query?.warehouseId,
      params.query?.productId,
      params.query?.packagingId,
      params.query?.grammage,
      params.query?.sizeX,
      params.query?.sizeY,
      params.query?.paperColorGroupId,
      params.query?.paperColorId,
      params.query?.paperPatternId,
      params.query?.paperCertId,
    ],
    async () => {
      const resp = await axios.get<Api.StockListResponse>(`${API_HOST}/stock`, {
        params: params.query,
      });
      return resp.data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(["stockInhouse", "item", params.id], async () => {
    if (!params.id) {
      return null;
    }

    const resp = await axios.get<Api.StockDetailResponse>(
      `${API_HOST}/stock/${params.id}`
    );
    return resp.data;
  });
}

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    ["stockInhouse", "create"],
    async (params: { data: Api.StockCreateRequest }) => {
      const resp = await axios.post(`${API_HOST}/stock`, params.data);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["stockInhouse", "groupList"]);
        await queryClient.invalidateQueries(["stockInhouse", "list"]);
      },
    }
  );
}
