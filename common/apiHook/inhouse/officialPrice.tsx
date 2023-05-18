import {
  OfficialPriceCreateRequest,
  OfficialPriceListQuery,
  OfficialPriceMappingQuery,
  OfficialPriceUpdateRequest,
} from "@/@shared/api/inhouse/official-price.request";
import {
  OfficialPriceListResponse,
  OfficialPriceMappingResponse,
  OfficialPriceResponse,
} from "@/@shared/api/inhouse/official-price.response";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<OfficialPriceListQuery> }) {
  return useQuery(
    ["inhouse", "official-price", "list", params.query.skip, params.query.take],
    async () => {
      const { data } = await axios.get<OfficialPriceListResponse>(
        `${API_HOST}/official-price`,
        {
          params: params.query,
        }
      );
      return data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(
    ["inhouse", "official-price", "item", params.id],
    async () => {
      if (!params.id) {
        return null;
      }

      const { data } = await axios.get<OfficialPriceResponse>(
        `${API_HOST}/official-price/${params.id}`
      );
      return data;
    }
  );
}

export function useCreate() {
  const queryClient = useQueryClient();
  return useMutation(
    async (params: { data: OfficialPriceCreateRequest }) => {
      const { data } = await axios.post(
        `${API_HOST}/official-price`,
        params.data
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "official-price"]);
      },
    }
  );
}

export function useUpdate() {
  const queryClient = useQueryClient();
  return useMutation(
    async (params: { id: number; data: OfficialPriceUpdateRequest }) => {
      const { data } = await axios.put(
        `${API_HOST}/official-price/${params.id}`,
        params.data
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "official-price"]);
      },
    }
  );
}

export function useDelete() {
  const queryClient = useQueryClient();
  return useMutation(
    async (params: { id: number }) => {
      const { data } = await axios.delete(
        `${API_HOST}/official-price/${params.id}`
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "official-price"]);
      },
    }
  );
}

export function useGetMappingList(params: {
  query: Partial<OfficialPriceMappingQuery>;
}) {
  return useQuery(
    [
      "inhouse",
      "official-price",
      "mapping",
      params.query.productId,
      params.query.grammage,
      params.query.sizeX,
      params.query.sizeY,
      params.query.paperColorGroupId,
      params.query.paperColorId,
      params.query.paperPatternId,
      params.query.paperCertId,
    ],
    async () => {
      if (
        !params.query.productId ||
        !params.query.grammage ||
        !params.query.sizeX ||
        !params.query.sizeY
      ) {
        return null;
      }

      const { data } = await axios.get<OfficialPriceMappingResponse>(
        `${API_HOST}/official-price/mapping`,
        {
          params: params.query,
        }
      );
      return data;
    }
  );
}
