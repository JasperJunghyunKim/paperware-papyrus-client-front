import {
  AuthNoCheckRequest,
  SendSmsAuthenticationRequest,
} from "@/@shared/api/auth/auth.request";
import {
  AuthNoCheckResponse,
  LoginResponse,
} from "@/@shared/api/auth/auth.response";
import { User } from "@/@shared/models";
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
