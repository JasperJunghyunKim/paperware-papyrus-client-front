import { SettingCompanyResponse } from "@/@shared/api/setting/company.response";
import {
  SettingUserListQuery,
  UserActivatedUpdateRequest,
  UserCreateRequest,
  UserIdCheckQuery,
  UserMenuUpdateRequest,
  UserUpdateRequest,
} from "@/@shared/api/setting/user.request";
import {
  SettingUserListReseponse,
  SettingUserResponse,
  UserIdCheckResponse,
  UserMemuResponse,
} from "@/@shared/api/setting/user.response";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetList(params: { query: SettingUserListQuery }) {
  return useQuery(["setting", "user", "list", params.query], async () => {
    const resp = await axios.get<SettingUserListReseponse>(
      `${API_HOST}/setting/user`,
      {
        params: params.query,
      }
    );
    return resp.data;
  });
}

export function useGetItem(params: { userId: number | null }) {
  return useQuery(
    ["setting", "user", "item", params.userId],
    async () => {
      const resp = await axios.get<SettingUserResponse>(
        `${API_HOST}/setting/user/${params.userId}`
      );
      return resp.data;
    },
    {
      enabled: params.userId !== null,
    }
  );
}

export function useCheckId(params: { query: UserIdCheckQuery | null }) {
  return useQuery(
    ["setting", "user", "checkId", params.query?.username],
    async () => {
      const resp = await axios.get<UserIdCheckResponse>(
        `${API_HOST}/setting/user/id/check`,
        {
          params: params.query,
        }
      );
      return resp.data;
    },
    { enabled: params.query !== null }
  );
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { data: UserCreateRequest }) => {
      const resp = await axios.post(`${API_HOST}/setting/user`, params.data);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["setting", "user", "list"]);
        message.success("직원이 추가되었습니다.");
      },
    }
  );
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { userId: number; data: UserUpdateRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/setting/user/${params.userId}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["setting", "user"]);
        message.success("직원 정보가 수정되었습니다.");
      },
    }
  );
}

export function useSetAdmin() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { userId: number }) => {
      const resp = await axios.post(
        `${API_HOST}/setting/user/${params.userId}/admin`
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["setting", "user"]);
        message.success("관리자가 지정되었습니다.");
      },
    }
  );
}

export function useSetActivated() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { userId: number; data: UserActivatedUpdateRequest }) => {
      const resp = await axios.patch(
        `${API_HOST}/setting/user/${params.userId}/activated`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["setting", "user"]);
        message.success("계정 활성화 상태가 변경되었습니다.");
      },
    }
  );
}

export function useGetMenu(params: { userId: number | null }) {
  return useQuery(
    ["setting", "user", "menu", params.userId],
    async () => {
      const resp = await axios.get<UserMemuResponse>(
        `${API_HOST}/setting/user/${params.userId}/menu`
      );
      return resp.data;
    },
    {
      enabled: params.userId !== null,
    }
  );
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: { userId: number; data: UserMenuUpdateRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/setting/user/${params.userId}/menu`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["setting", "user"]);
        message.success("직원 메뉴 설정이 수정되었습니다.");
      },
    }
  );
}
