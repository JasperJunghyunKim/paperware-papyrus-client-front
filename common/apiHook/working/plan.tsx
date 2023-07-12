import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: Partial<Api.PlanListQuery> }) {
  return useQuery(
    ["plan", "list", params.query.skip, params.query.take, params.query.type],
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
  const queryClient = useQueryClient();

  return useMutation(
    ["plan", "create"],
    async (params: { data: Api.InhouseProcessCreateRequest }) => {
      const resp = await axios.post(`${API_HOST}/inhouse/process`, params.data);
      return resp.data;
    },
    {
      onSuccess: async (_data, _variables) => {
        await queryClient.invalidateQueries(["plan", "list"]);
      },
    }
  );
}

export function useGetTaskList(params: { planId: number | null }) {
  return useQuery(["plan", "item", params.planId, "task"], async () => {
    if (!params.planId) {
      return null;
    }

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
        await queryClient.invalidateQueries(["plan", "list"]);
        await queryClient.invalidateQueries(["stockInhouse"]);
        await queryClient.invalidateQueries(["order"]);
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
        await queryClient.invalidateQueries(["plan", "list"]);
      },
    }
  );
}

export function useRegisterInputStock() {
  const queryClient = useQueryClient();

  return useMutation(
    ["plan", "registerInputStock"],
    async (params: { id: number; data: Api.RegisterInputStockRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/working/plan/${params.id}/register-stock`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["plan", "item", variables.id]);
        await queryClient.invalidateQueries(["plan", "list"]);
        message.success("실투입이 등록 되었습니다.");
      },
    }
  );
}

export function useUpdateInputStock() {
  const queryClient = useQueryClient();

  return useMutation(
    ["plan", "updateInputStock"],
    async (params: { id: number; data: Api.UpdateInputStockRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/working/plan/${params.id}/input-stock`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["plan", "item", variables.id]);
        await queryClient.invalidateQueries(["plan", "list"]);
        message.success("실투입 수량이 수정되었습니다.");
      },
    }
  );
}

export function useDeleteInputStock() {
  const queryClient = useQueryClient();

  return useMutation(
    ["plan", "deleteInputStock"],
    async (params: { id: number; data: Api.DeleteInputStockRequest }) => {
      const resp = await axios.delete(
        `${API_HOST}/working/plan/${params.id}/input-stock`,
        {
          data: params.data,
        }
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["plan", "item", variables.id]);
        await queryClient.invalidateQueries(["plan", "list"]);
        message.success("실투입이 해제되었습니다.");
      },
    }
  );
}

export function useGetInputList(params: {
  planId: number | null;
  query: Partial<Api.PlanInputListQuery>;
}) {
  return useQuery(["plan", "item", params.planId, "input-stock"], async () => {
    if (!params.planId) {
      return {
        items: [],
        total: 0,
      };
    }

    const resp = await axios.get<Api.PlanInputListResponse>(
      `${API_HOST}/working/plan/${params.planId}/input-stock`
    );
    return resp.data;
  });
}

export function useGetInputItem(params: {
  key: {
    planId: number;
    stockId: number;
  } | null;
}) {
  return useQuery(
    ["plan", "item", params.key?.planId, "input-stock", params.key?.stockId],
    async () => {
      if (!params.key) {
        return null;
      }

      const resp = await axios.get<Api.InputStockResponse>(
        `${API_HOST}/working/plan/${params.key.planId}/input-stock/${params.key.stockId}`
      );
      return resp.data;
    }
  );
}
