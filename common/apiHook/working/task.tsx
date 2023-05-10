import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetItem(params: { id: number | null }) {
  return useQuery(["task", "item", params.id], async () => {
    if (!params.id) {
      return null;
    }

    const resp = await axios.get<Api.TaskItemResponse>(
      `${API_HOST}/working/task/${params.id}`
    );
    return resp.data;
  });
}

export function useStart() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "start"],
    async (params: { id: number; planId?: number }) => {
      const resp = await axios.post(
        `${API_HOST}/working/task/${params.id}/start`
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task", "item", variables.id]);
        if (variables.planId) {
          await queryClient.invalidateQueries([
            "plan",
            "item",
            variables.planId,
            "task",
          ]);
        }
      },
    }
  );
}

export function useReset() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "reset"],
    async (params: { id: number; planId?: number }) => {
      const resp = await axios.post(
        `${API_HOST}/working/task/${params.id}/reset`
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task", "item", variables.id]);
        if (variables.planId) {
          await queryClient.invalidateQueries([
            "plan",
            "item",
            variables.planId,
            "task",
          ]);
        }
      },
    }
  );
}

export function useFinish() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "finish"],
    async (params: { id: number; planId?: number }) => {
      const resp = await axios.post(
        `${API_HOST}/working/task/${params.id}/finish`
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task", "item", variables.id]);
        if (variables.planId) {
          await queryClient.invalidateQueries([
            "plan",
            "item",
            variables.planId,
            "task",
          ]);
        }
      },
    }
  );
}

export function useCreateConverting() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "create"],
    async (params: { data: Api.TaskCreateConvertingRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/working/task/converting`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task"]);
        await queryClient.invalidateQueries([
          "plan",
          "item",
          variables.data.planId,
        ]);
      },
    }
  );
}

export function useCreateGuillotine() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "create"],
    async (params: { data: Api.TaskCreateGuillotineRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/working/task/guillotine`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task"]);
        await queryClient.invalidateQueries([
          "plan",
          "item",
          variables.data.planId,
        ]);
      },
    }
  );
}

export function useCreateQuantity() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "create"],
    async (params: { data: Api.TaskCreateQuantityRequest }) => {
      const resp = await axios.post(
        `${API_HOST}/working/task/quantity`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task"]);
        await queryClient.invalidateQueries([
          "plan",
          "item",
          variables.data.planId,
        ]);
      },
    }
  );
}

export function useUpdateConverting() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "update"],
    async (params: {
      taskId: number;
      data: Api.TaskUpdateConvertingRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/working/task/converting/${params.taskId}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task"]);
        await queryClient.invalidateQueries(["plan", "item", variables.taskId]);
      },
    }
  );
}

export function useUpdateGuillotine() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "update"],
    async (params: {
      taskId: number;
      data: Api.TaskUpdateGuillotineRequest;
    }) => {
      const resp = await axios.put(
        `${API_HOST}/working/task/guillotine/${params.taskId}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task"]);
        await queryClient.invalidateQueries(["plan", "item", variables.taskId]);
      },
    }
  );
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "update"],
    async (params: { taskId: number; data: Api.TaskUpdateQuantityRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/working/task/quantity/${params.taskId}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task"]);
        await queryClient.invalidateQueries(["plan", "item", variables.taskId]);
      },
    }
  );
}

export function useDelete() {
  const queryClient = useQueryClient();

  return useMutation(
    ["task", "delete"],
    async (params: { id: number; planId?: number }) => {
      const resp = await axios.delete(`${API_HOST}/working/task/${params.id}`);
      return resp.data;
    },
    {
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(["task"]);
        if (variables.planId) {
          await queryClient.invalidateQueries([
            "plan",
            "item",
            variables.planId,
          ]);
        }
      },
    }
  );
}
