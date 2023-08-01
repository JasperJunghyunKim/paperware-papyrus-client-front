import { SettingCompanyUpdateRequest } from "@/@shared/api/setting/company.request";
import { SettingCompanyResponse } from "@/@shared/api/setting/company.response";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGet() {
  return useQuery(["setting", "company"], async () => {
    const resp = await axios.get<SettingCompanyResponse>(
      `${API_HOST}/setting/company`
    );
    return resp.data;
  });
}

export function useUpdate() {
  const queryClient = useQueryClient();

  return useMutation(
    async (req: SettingCompanyUpdateRequest) => {
      const resp = await axios.put(`${API_HOST}/setting/company`, req);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["setting", "company"]);
        message.success("회사 정보가 업데이트 되었습니다.");
      },
    }
  );
}
