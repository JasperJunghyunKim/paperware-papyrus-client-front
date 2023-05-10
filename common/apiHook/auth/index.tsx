import { API_HOST } from "@/common/const";
import { FormBody, Record } from "@/common/protocol";
import axios from "axios";
import { useMutation, useQuery } from "react-query";

export function useSignIn() {
  return useMutation(async (payload: FormBody.SignIn) => {
    const response = await axios.post<string>(
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
