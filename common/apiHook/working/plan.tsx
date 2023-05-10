import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<Api.PlanListQuery> }) {
  return useQuery(
    ["plan", "list", params.query.skip, params.query.take],
    async () => {
      const resp = await axios.get<Api.PlanListResponse>(
        `${API_HOST}/working/plan`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(["plan", "item", params.id], async () => {
    if (!params.id) {
      return null;
    }

    const resp = await axios.get<Api.PlanItemResponse>(
      `${API_HOST}/working/plan/${params.id}`
    );
    return resp.data;
  });
}

export function useCreate() {
  return useMutation(
    ["plan", "create"],
    async (params: { data: Api.PlanCreateRequest }) => {
      const resp = await axios.post(`${API_HOST}/working/plan`, params.data);
      return resp.data;
    }
  );
}

export function useGetTaskList(params: { planId: number }) {
  return useQuery(["plan", "item", params.planId, "task"], async () => {
    const resp = await axios.get<Api.TaskListResponse>(
      `${API_HOST}/working/plan/${params.planId}/task`
    );
    return resp.data;
  });
}

export function useStart() {
  const queryClient = useQueryClient();

  return useMutation(
    ["plan", "start"],
    async (params: { id: number }) => {
      const resp = await axios.post(
        `${API_HOST}/working/plan/${params.id}/start`
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["plan", "item", variables.id]);
      },
    }
  );
}

export function useComplete() {
  const queryClient = useQueryClient();

  return useMutation(
    ["plan", "complete"],
    async (params: { id: number }) => {
      const resp = await axios.post(
        `${API_HOST}/working/plan/${params.id}/complete`
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["plan", "item", variables.id]);
      },
    }
  );
}
