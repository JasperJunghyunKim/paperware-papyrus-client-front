import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import { message } from "antd";
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

export function useGetCompactList(params: {
  query: Partial<Api.BusinessRelationshipCompactListQuery>;
}) {
  return useQuery(
    [
      "inhouse",
      "business-relationship",
      "compact",
      params.query.skip,
      params.query.take,
    ],
    async () => {
      const resp = await axios.get<Api.BusinessRelationshipCompactListResponse>(
        `${API_HOST}/inhouse/business-relationship/compact`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}
export function useSearchPartnerItem() {
  const queryClient = useQueryClient();

  return useMutation(async (params: { data: Api.SearchPartnerRequest }) => {
    const resp = await axios.post<Api.SearchPartnerResponse>(
      `${API_HOST}/inhouse/business-relationship/search`,
      params.data
    );
    return resp.data;
  }, {});
}

export function useRegisterPartner() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.RegisterPartnerRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/business-relationship/register`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        message.info("등록되었습니다.");
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship",
        ]);
      },
    }
  );
}

export function useDeactive() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { srcCompanyId: number; dstCompanyId: number }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/business-relationship/${params.srcCompanyId}/${params.dstCompanyId}/deactive`
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        message.info("해지되었습니다.");
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship",
        ]);
      },
    }
  );
}
