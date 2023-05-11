
import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useQuery } from "react-query";

export function useGetList() {
	return useQuery(
		["partner", "list"],
		async () => {
			const resp = await axios.get<Api.PartnerResponse[]>(
				`${API_HOST}/partner`,
			);
			return resp.data;
		}
	);
}
