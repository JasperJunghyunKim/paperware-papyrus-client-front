import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { Record } from "@/common/protocol";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetAll() {
  return useQuery(
    ["static", "paper-metadata"],
    async () => {
      const resp = await axios.get<Api.PaperMetadataResponse>(
        `${API_HOST}/static/paper-metadata`
      );
      return resp.data;
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );
}
