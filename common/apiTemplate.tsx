import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { API_HOST } from "./const";
import { flatQueries } from "./util";

export namespace $query {
  const splitName = (value: string) => value.split(".");
  const parsePath = (value: string, id?: number) =>
    value.replaceAll(":id", id?.toString() ?? "");

  export const list = <T,>(
    path: string,
    name: string,
    query?: Partial<Record<string, any>>
  ) =>
    useQuery(
      [...splitName(name), "list", ...flatQueries(query)],
      async () =>
        await axios
          .get<T>(`${API_HOST}/${path}`, {
            params: query,
          })
          .then((res) => res.data)
    );
  export const item = <T,>(path: string, name: string, id?: number) =>
    useQuery(
      [...splitName(name), "item", id],
      async () =>
        await axios
          .get<T>(`${API_HOST}/${parsePath(path)}`)
          .then((res) => res.data),
      {
        enabled: id !== undefined,
      }
    );
  export const create = <T,>(path: string, names: string[], msg?: string) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (params: { data: T }) =>
        await axios
          .post(`${API_HOST}/${path}`, params.data)
          .then((res) => res.data),
      {
        onSuccess: async () => {
          for (const name of names)
            await queryClient.invalidateQueries(splitName(name));

          message.info(msg ?? "등록되었습니다.");
        },
      }
    );
  };
  export const update = <T,>(path: string, names: string[], msg?: string) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (params: { id: number; data: T }) =>
        await axios
          .put(`${API_HOST}/${parsePath(path, params.id)}`, params.data)
          .then((res) => res.data),
      {
        onSuccess: async () => {
          for (const name of names)
            await queryClient.invalidateQueries(splitName(name));

          message.info(msg ?? "수정되었습니다.");
        },
      }
    );
  };

  export const remove = (path: string, names: string[], msg?: string) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (id: number) =>
        await axios
          .delete(`${API_HOST}/${parsePath(path, id)}`)
          .then((res) => res.data),
      {
        onSuccess: async () => {
          for (const name of names)
            await queryClient.invalidateQueries(splitName(name));

          message.info(msg ?? "삭제되었습니다.");
        },
      }
    );
  };
}
