import { BusinessRelationshipCompact } from "@/@shared/models";
import PartnerTaxManager from "@/@shared/models/partner-tax-manager";
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
      if (!params.query.srcCompanyId && !params.query.dstCompanyId) {
        return null;
      }
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

export function useGetCompactItem(params: { targetCompanyId: number | null }) {
  return useQuery(
    ["inhouse", "business-relationship", "compact", params.targetCompanyId],
    async () => {
      if (!params.targetCompanyId) return null;

      const resp = await axios.get<BusinessRelationshipCompact>(
        `${API_HOST}/inhouse/business-relationship/compact/${params.targetCompanyId}`
      );
      return resp.data;
    }
  );
}

export function useUpsertPartner() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: {
      companyRegistrationNumber: string;
      data: Api.UpsertPartnerRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/inhouse/business-relationship/partner/${params.companyRegistrationNumber}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        message.info("거래처 정보가 저장되었습니다.");
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship",
        ]);
      },
    }
  );
}

export function useSearchPartnerItem() {
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

export function useRequest() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.BusinessRelationshipRequestRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/business-relationship/request`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        message.info("거래 관계를 수정했습니다.");
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

export function useGetTaxManagerList(params: {
  companyRegistrationNumber: string | null;
}) {
  return useQuery(
    ["inhouse", "partner", "taxManager", params.companyRegistrationNumber],
    async () => {
      if (!params.companyRegistrationNumber) return null;

      const resp = await axios.get<Api.PartnerTaxManagerListResponse>(
        `${API_HOST}/partner/${params.companyRegistrationNumber}/tax-manager`
      );
      return resp.data;
    }
  );
}

export function useGetTaxManagerItem(params: { id: number | null }) {
  return useQuery(["inhouse", "partner", "taxManager", params.id], async () => {
    if (!params.id) return null;

    const resp = await axios.get<PartnerTaxManager>(
      `${API_HOST}/partner/tax-manager/${params.id}`
    );
    return resp.data;
  });
}

export function useCreateTaxManager() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.PartnerTaxManagerCreateRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/partner/tax-manager`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        message.info("세금계산서담당자가 등록되었습니다.");
        await queryClient.invalidateQueries([
          "inhouse",
          "partner",
          "taxManager",
        ]);
      },
    }
  );
}

export function useUpdateTaxManager() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: {
      id: number;
      data: Api.PartnerTaxManagerUpdateRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/partner/tax-manager/${params.id}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        message.info("세금계산서담당자가 수정되었습니다.");
        await queryClient.invalidateQueries([
          "inhouse",
          "partner",
          "taxManager",
        ]);
      },
    }
  );
}

export function useDeleteTaxManager() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number }) => {
      const resp = await axios.delete(
        `${API_HOST}/partner/tax-manager/${params.id}`
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        message.info("세금계산서담당자가 삭제되었습니다.");
        await queryClient.invalidateQueries([
          "inhouse",
          "partner",
          "taxManager",
        ]);
      },
    }
  );
}
