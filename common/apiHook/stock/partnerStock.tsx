import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetList(params: {
  query: Partial<Api.PartnerStockGroupListQuery>;
}) {
  return useQuery(
    [
      "partner-stock",
      "group",
      "list",
      params.query.skip,
      params.query.take,
      params.query.companyId,
      params.query.manufacturerIds,
      params.query.minGrammage,
      params.query.maxGrammage,
      params.query.packagingIds,
      params.query.paperTypeIds,
      params.query.sizeX,
      params.query.sizeY,
    ],
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
