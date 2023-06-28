import { API_HOST } from "@/common/const";
import { Api } from "@shared";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: {
  query: Partial<Api.BusinessRelationshipRequestListQuery>;
}) {
  return useQuery(
    [
      "inhouse",
      "business-relationship-request",
      "received",
      params.query.skip,
      params.query.take,
    ],
    async () => {
      const resp = await axios.get<Api.BusinessRelationshipRequestListResponse>(
        `${API_HOST}/inhouse/business-relationship-request/received`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useGetSendedList(params: {
  query: Partial<Api.BusinessRelationshipRequestListQuery>;
}) {
  return useQuery(
    [
      "inhouse",
      "business-relationship-request",
      "sended",
      params.query.skip,
      params.query.take,
    ],
    async () => {
      const resp = await axios.get<Api.BusinessRelationshipRequestListResponse>(
        `${API_HOST}/inhouse/business-relationship-request/sended`,
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
        message.info("거래처 요청을 수락하였습니다.");
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship-request",
        ]);
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship",
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
        message.info("거래처 요청을 거절하였습니다.");
        await queryClient.invalidateQueries([
          "inhouse",
          "business-relationship-request",
        ]);
      },
    }
  );
}
