import { Protocol } from "@/common";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useQueryData<T>(url: string, key: string[]) {
  return useQuery([...key], async () => {
    const { data } = await axios.get<T>(`${API_HOST}/${url}`);
    return data;
  });
}

export function useQueryItem<T>(
  url: string,
  key: string[],
  id: string | number | (string | number)[] | false
) {
  return useQuery([...key, "item", id], async () => {
    if (id === false) {
      return null;
    }

    const subpath = Array.isArray(id) ? id.join("/") : id;

    const { data } = await axios.get<T>(`${API_HOST}/${url}/${subpath}`);
    return data;
  });
}

export interface GetPaginationQuery {
  skip?: number;
  take?: number;
}

export function useQueryPagination<T, U = any>(
  url: string,
  key: string[],
  query: GetPaginationQuery & U,
  ignore: boolean = false
) {
  return useQuery([...key, "list", query.skip, query.take], async () => {
    if (ignore) {
      return {
        items: [],
        count: 0,
      };
    }

    const { data } = await axios.get<Protocol.Record.List<T>>(
      `${API_HOST}/${url}`,
      {
        params: query,
      }
    );
    return data;
  });
}

export function useCreate<T, U = any>(
  url: string,
  keys: string[][],
  options?: {
    message?: (data: U | null, variables: { data: T }) => string;
    ignore?: boolean;
  }
) {
  const context = useQueryClient();

  return useMutation(
    async (args: { data: T }) => {
      if (options?.ignore) {
        return null;
      }

      const { data } = await axios.post<U>(`${API_HOST}/${url}`, args.data);
      return data;
    },
    {
      onSuccess: async (data, variables: { data: T }) => {
        for (const key of keys) {
          await context.invalidateQueries(key);
        }
        if (options?.message) {
          message.info(options.message(data, variables));
        }
      },
    }
  );
}

export function useUpdate<T, U = any>(
  url: string,
  keys: string[][],
  options?: {
    message?: (data: U | null, variables: { data: T }) => string;
    ignore?: boolean;
  }
) {
  const context = useQueryClient();

  return useMutation(
    async (args: { id: number; data: T }) => {
      if (options?.ignore) {
        return null;
      }

      const { data } = await axios.put<U>(
        `${API_HOST}/${url}/${args.id}`,
        args.data
      );
      return data;
    },
    {
      onSuccess: async (data, variables: { data: T }) => {
        for (const key of keys) {
          await context.invalidateQueries(key);
        }
        if (options?.message) {
          message.info(options.message(data, variables));
        }
      },
    }
  );
}

export function useModify<T, U = any, P = {}>(options: {
  url: string;
  keys: string[][];
  params: P | null;
  message?: (data: U | null, variables: { data: T }) => string;
}) {
  const context = useQueryClient();

  return useMutation(
    async (args: { data: T }) => {
      if (options.params === null) {
        return null;
      }

      let path = options.url;
      for (const key in options.params) {
        path = path.replace(`:${key}`, options.params[key] as any);
      }

      const { data } = await axios.put<U>(`${API_HOST}/${path}`, args.data);
      return data;
    },
    {
      onSuccess: async (data, variables: { data: T }) => {
        for (const key of options.keys) {
          await context.invalidateQueries(key);
        }
        if (options?.message) {
          message.info(options.message(data, variables));
        }
      },
    }
  );
}

export function useDelete<U = any>(
  url: string,
  keys: string[][],
  options?: { message?: (data: U, variables: { data: number }) => string }
) {
  const context = useQueryClient();

  return useMutation(
    async (id: number) => {
      const { data } = await axios.delete<U>(`${API_HOST}/${url}/${id}`);
      return data;
    },
    {
      onSuccess: async (data, variables) => {
        for (const key of keys) {
          await context.invalidateQueries(key);
        }
        if (options?.message) {
          message.info(options.message(data, { data: variables }));
        }
      },
    }
  );
}
