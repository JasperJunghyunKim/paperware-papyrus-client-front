import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: {
  query: Partial<Api.BusinessRelationshipRequestListQuery>;
}) {
  return useQuery(
    [
      "inhouse",
      "business-relationship-request",
      params.query.skip,
      params.query.take,
    ],
    async () => {
      const resp = await axios.get<Api.BusinessRelationshipRequestListResponse>(
        `${API_HOST}/inhouse/business-relationship-request`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useGetPendingCount() {
  return useQuery(
    ["inhouse", "business-relationship-request", "pending-count"],
    async () => {
      const resp =
        await axios.get<Api.BusinessRelationshipRequestPendingCountResponse>(
          `${API_HOST}/inhouse/business-relationship-request/pending-count`
        );
      return resp.data;
    }
  );
}

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.BusinessRelationshipRequestCreateRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/business-relationship-request`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship-request",
        ]);
      },
    }
  );
}

export function useAccept() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.BusinessRelationshipRequestAcceptRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/business-relationship-request/accept`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship-request",
        ]);
      },
    }
  );
}

export function useReject() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: Api.BusinessRelationshipRequestRejectRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/inhouse/business-relationship-request/reject`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship-request",
        ]);
      },
    }
  );
}
