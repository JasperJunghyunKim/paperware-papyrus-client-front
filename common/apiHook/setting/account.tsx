import {
  AccountPasswordUpdateRequest,
  AccountPhoneNoUpdateRequest,
  AccountUpdateRequest,
} from "@/@shared/api/setting/account.request";
import { AccountResponse } from "@/@shared/api/setting/account.response";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGet() {
  return useQuery(["setting", "account"], async () => {
    const resp = await axios.get<AccountResponse>(
      `${API_HOST}/setting/account`
    );
    return resp.data;
  });
}

export function useUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (req: AccountUpdateRequest) => {
      const resp = await axios.put(`${API_HOST}/setting/account`, req);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["me"]);
        await queryClient.invalidateQueries(["setting", "account"]);

        message.success("계정 정보가 업데이트 되었습니다.");
      },
    }
  );
}

export function useUpdatePassword() {
  return useMutation(
    async (req: AccountPasswordUpdateRequest) => {
      const resp = await axios.patch(
        `${API_HOST}/setting/account/password`,
        req
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        message.success("비밀번호가 변경되었습니다.");
      },
    }
  );
}

export function useUpdatePhoneNo() {
  const queryClient = useQueryClient();

  return useMutation(
    async (req: AccountPhoneNoUpdateRequest) => {
      const resp = await axios.patch(
        `${API_HOST}/setting/account/phoneNo`,
        req
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["me"]);
      },
    }
  );
}
