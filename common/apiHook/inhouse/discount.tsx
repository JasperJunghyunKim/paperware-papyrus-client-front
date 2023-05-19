import {
  DiscountRateCreateRequest,
  DiscountRateListQuery,
  DiscountRateMappingQuery,
  DiscountRateUpdateRequest,
} from "@/@shared/api/inhouse/discount-rate.request";
import {
  DiscountRateListResponse,
  DiscountRateMappingResponse,
  DiscountRateResponse,
} from "@/@shared/api/inhouse/discount-rate.response";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<DiscountRateListQuery> }) {
  return useQuery(
    [
      "inhouse",
      "discount",
      "list",
      params.query.companyRegistrationNumber,
      params.query.skip,
      params.query.take,
    ],
    async () => {
      const { data } = await axios.get<DiscountRateListResponse>(
        `${API_HOST}/discount-rate`,
        {
          params: params.query,
        }
      );
      return data;
    }
  );
}

export function useGetMapping(params: {
  query: Partial<DiscountRateMappingQuery>;
}) {
  return useQuery(
    [
      "inhouse",
      "discount",
      "mapping",
      params.query.companyRegistrationNumber,
      params.query.packagingType,
      params.query.paperDomainId,
      params.query.manufacturerId,
      params.query.paperGroupId,
      params.query.paperTypeId,
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
        !params.query.companyRegistrationNumber ||
        !params.query.discountRateType
      ) {
        return null;
      }

      const { data } = await axios.get<DiscountRateMappingResponse>(
        `${API_HOST}/discount-rate/mapping`,
        {
          params: params.query,
        }
      );
      return data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(["inhouse", "discount", "item", params.id], async () => {
    if (!params.id) {
      return null;
    }

    const { data } = await axios.get<DiscountRateResponse>(
      `${API_HOST}/discount-rate/${params.id}`
    );
    return data;
  });
}

export function useCreate() {
  const queryClient = useQueryClient();
  return useMutation(
    async (params: { data: DiscountRateCreateRequest }) => {
      const { data } = await axios.post(
        `${API_HOST}/discount-rate`,
        params.data
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "discount"]);
      },
    }
  );
}

export function useUpdate() {
  const queryClient = useQueryClient();
  return useMutation(
    async (params: { id: number; data: DiscountRateUpdateRequest }) => {
      const { data } = await axios.put(
        `${API_HOST}/discount-rate/${params.id}`,
        params.data
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "discount"]);
      },
    }
  );
}

export function useDelete() {
  const queryClient = useQueryClient();
  return useMutation(
    async (params: { discountRateConditionId: number }) => {
      const { data } = await axios.delete(
        `${API_HOST}/discount-rate/${params.discountRateConditionId}`
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inhouse", "discount"]);
      },
    }
  );
}
