import {
  AuthNoCheckRequest,
  FindIdRequest,
  FindPasswordChangeRequest,
  FindPasswordRequest,
  SendSmsAuthenticationRequest,
} from "@/@shared/api/auth/auth.request";
import {
  AuthNoCheckResponse,
  FindIdResponse,
  FindPasswordResponse,
  LoginResponse,
} from "@/@shared/api/auth/auth.response";
import { AccountPasswordAndPhoneNoUpdateRequest } from "@/@shared/api/setting/account.request";
import { API_HOST } from "@/common/const";
import { FormBody, Record } from "@/common/protocol";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery } from "react-query";

export function useSignIn() {
  return useMutation(async (payload: FormBody.SignIn) => {
    const response = await axios.post<LoginResponse>(
      `${API_HOST}/auth/signin`,
      payload
    );
    return response.data;
  });
}

export function useGetMe() {
  return useQuery(
    `me`,
    async () => {
      const response = await axios.get<Record.User>(`${API_HOST}/me`);
      return response.data;
    },
    {
      staleTime: 5000,
    }
  );
}

export function useSendSmsVerifyCode() {
  return useMutation(
    async (payload: SendSmsAuthenticationRequest) => {
      const response = await axios.post(`${API_HOST}/auth/sms`, payload);
      return response.data;
    },
    {
      onSuccess: async () => {
        message.success("인증번호가 발송되었습니다.");
      },
    }
  );
}

export function useValidateVerifyCode() {
  return useMutation(
    async (payload: AuthNoCheckRequest) => {
      const response = await axios.post<AuthNoCheckResponse>(
        `${API_HOST}/auth/authNo`,
        payload
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        message.success("인증되었습니다.");
      },
    }
  );
}

export function useFindId() {
  return useMutation(async (payload: FindIdRequest) => {
    const response = await axios.post<FindIdResponse>(
      `${API_HOST}/auth/find/id`,
      payload
    );
    return response.data;
  });
}

export function useFindPw() {
  return useMutation(async (payload: FindPasswordRequest) => {
    const response = await axios.post<FindPasswordResponse>(
      `${API_HOST}/auth/find/password`,
      payload
    );
    return response.data;
  });
}

export function useResetPw() {
  return useMutation(
    async (payload: FindPasswordChangeRequest) => {
      const response = await axios.post(
        `${API_HOST}/auth/find/password/change`,
        payload
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        message.success("비밀번호가 변경되었습니다.");
      },
    }
  );
}

export function useSetup() {
  return useMutation(
    async (params: {
      payload: AccountPasswordAndPhoneNoUpdateRequest;
      accessToken: string;
    }) => {
      const response = await axios.patch(
        `${API_HOST}/setting/account/password-phone`,
        params.payload,
        {
          headers: {
            Authorization: `Bearer ${params.accessToken}`,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        message.success("계정 초기설정이 완료되었습니다.");
      },
    }
  );
}
