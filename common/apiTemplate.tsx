import axios from "axios";
import { useQuery, useQueryClient, useMutation } from "react-query";
import { API_HOST } from "./const";
import { flatQueries } from "./util";
import { trim } from "lodash";
import { message } from "antd";

const parseNamePath = (strings: TemplateStringsArray) => {
  const splitted = strings.join(" ").split(" ").map(trim);
  return [splitted[0], splitted[1]];
};

export const useGetListQuery = <T,>(
  name: string,
  path: string,
  query?: Partial<Record<string, any>>
) =>
  useQuery(
    [name, "list", ...flatQueries(query)],
    async () =>
      await axios
        .get<T>(`${API_HOST}/${path}`, {
          params: query,
        })
        .then((res) => res.data)
  );

export const $ql = <T,>(
  strings: TemplateStringsArray,
  args?: Partial<Record<string, any>>
) => {
  const [name, path] = parseNamePath(strings);
  return useGetListQuery<T>(name, path, args);
};

export const useGetItemQuery = <T,>(name: string, path: string, id?: number) =>
  useQuery(
    [name, "item", id],
    async () =>
      await axios.get<T>(`${API_HOST}/${path}/${id}`).then((res) => res.data),
    {
      enabled: id !== undefined,
    }
  );

export const $qi = <T,>(strings: TemplateStringsArray, args?: number) => {
  const [name, path] = parseNamePath(strings);
  return useGetItemQuery<T>(name, path, args);
};

export const useCreateMutation = <T,>(name: string, path: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: T }) =>
      await axios
        .post(`${API_HOST}/${path}`, params.data)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([name]);
        message.info("등록되었습니다.");
      },
    }
  );
};

export const $mc = <T,>(strings: TemplateStringsArray) => {
  const [name, path] = parseNamePath(strings);
  return useCreateMutation<T>(name, path);
};

export const useUpdateMutation = <T,>(name: string, path: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { id: number; data: T }) =>
      await axios
        .put(`${API_HOST}/${path}/${params.id}`, params.data)
        .then((res) => res.data),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([name]);
        message.info("수정되었습니다.");
      },
    }
  );
};

export const $mu = <T,>(strings: TemplateStringsArray) => {
  const [name, path] = parseNamePath(strings);
  return useUpdateMutation<T>(name, path);
};

export const useDeleteMutation = (name: string, path: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: number) =>
      await axios.delete(`${API_HOST}/${path}/${id}`).then((res) => res.data),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries([name]);
        message.info("삭제되었습니다.");
      },
    }
  );
};

export const $mr = (strings: TemplateStringsArray) => {
  const [name, path] = parseNamePath(strings);
  return useDeleteMutation(name, path);
};
