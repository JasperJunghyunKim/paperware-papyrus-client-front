
import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType } from "@/@shared/models/enum";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetByCardItem(params: { id: number | false, method: Enum.Method | null, accountedType: AccountedType }) {
	return useQuery(["accounted", "card", params.id, params.method], async () => {
		if (params.id === false) {
			return null;
		}
		if (params.method === null || params.method !== 'CARD_PAYMENT') {
			return null
		}

		const resp = await axios.get<Api.ByCardItemResponse>(
			`${API_HOST}/accounted/accountedType/${params.accountedType}/accountedId/${params.id}/card`
		);
		return resp.data;
	});
}

export function useByCardCreate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.ByCardCreateRequest }) => {
			const resp = await axios.post(
				`${API_HOST}/accounted/accountedType/${params.data.accountedType}/card`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["accounted", "list"]);
			},
		}
	);
}

export function useByCardUpdate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.ByCardUpdateRequest; id: number }) => {
			const resp = await axios.patch(
				`${API_HOST}/accounted/accountedType/${params.data.accountedType}/accountedId/${params.id}/card`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["accounted", "list"]);
			},
		}
	);
}

export function useByCardDelete() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { id: number | false, accountedType: AccountedType }) => {
			const resp = await axios.delete(`${API_HOST}/accounted/accountedType/${params.accountedType}/accountedId/${params.id}/card`);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["accounted", "list"]);
			},
		}
	);
}