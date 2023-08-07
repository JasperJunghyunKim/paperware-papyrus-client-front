import axios from "axios";
import { useQuery, useQueryClient, useMutation } from "react-query";
import { API_HOST } from "./const";
import { flatQueries } from "./util";

export const useGetListQuery =
  <Q extends Record<string, any>, T>(name: string, path: string) =>
  (query: Q) =>
    useQuery(
      [name, "list", ...flatQueries(query)],
      async () =>
        await axios
          .get<T>(`/api/${path}`, {
            params: query,
          })
          .then((res) => res.data)
    );

export const useGetItemQuery =
  <T,>(name: string, path: string) =>
  (id?: number) =>
    useQuery(
      [name, "item", id],
      async () =>
        await axios.get<T>(`${API_HOST}/${name}/${id}`).then((res) => res.data),
      {
        enabled: id !== undefined,
      }
    );

export const useCreateMutation = <T,>(name: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: T }) =>
      await axios
        .post(`${API_HOST}/${name}`, params.data)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([name]);
      },
    }
  );
};

export const useUpdateMutation = <T,>(name: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number; data: T }) =>
      await axios
        .put(`${API_HOST}/${name}/${params.id}`, params.data)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([name]);
      },
    }
  );
};

export const useDeleteMutation = (name: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: number) =>
      await axios.delete(`${API_HOST}/${name}/${id}`).then((res) => res.data),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([name]);
      },
    }
  );
};
