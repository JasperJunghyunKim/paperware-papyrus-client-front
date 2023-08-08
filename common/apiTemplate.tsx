import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { API_HOST } from "./const";
import { flatQueries } from "./util";

export namespace $query {
  const splitName = (value: string) => value.split(".");
  const parsePath = (value: string, record?: Record<string, any>) => {
    try {
      return value.replace(/:(\w+)/g, (_, key) => {
        if (record?.[key]) {
          return record[key];
        } else {
          console.log("ASDF");
          throw new Error(`Invalid path: ${value}`);
        }
      });
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  export const useList = <T,>(
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

  export const useItem = <T, U extends Record<string, any> = {}>(
    path: string,
    name: string,
    record: Partial<U>
  ) =>
    useQuery(
      [...splitName(name), "item", flatQueries(record)],
      async () =>
        await axios
          .get<T>(`${API_HOST}/${parsePath(path, record)}`)
          .then((res) => res.data),
      {
        enabled: parsePath(path, record) !== null,
      }
    );

  export const useGet = <T,>(path: string, name: string) =>
    useQuery(
      [...splitName(name)],
      async () =>
        await axios
          .get<T>(`${API_HOST}/${parsePath(path)}`)
          .then((res) => res.data)
    );

  export const useCreate = <T,>(
    path: string,
    names: string[],
    msg?: string
  ) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (params: { data: T }) =>
        await axios
          .post(`${API_HOST}/${parsePath(path)}`, params.data)
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

  export const useUpdate = <T, U extends Record<string, any>>(
    path: string,
    names: string[],
    msg?: string
  ) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (params: { path: Partial<U>; data: T }) =>
        await axios
          .put(`${API_HOST}/${parsePath(path, params.path)}`, params.data)
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

  export const usePatch = <T, U extends Record<string, any>>(
    path: string,
    names: string[],
    msg?: string
  ) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (params: { path: Partial<U>; data: T }) =>
        await axios
          .patch(`${API_HOST}/${parsePath(path, params.path)}`, params.data)
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

  export const useRemove = <U extends Record<string, any>>(
    path: string,
    names: string[],
    msg?: string
  ) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (params: { path: U }) =>
        await axios
          .delete(`${API_HOST}/${parsePath(path, params.path)}`)
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
