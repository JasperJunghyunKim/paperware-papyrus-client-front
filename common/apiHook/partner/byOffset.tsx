
import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType } from "@/@shared/models/enum";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetByOffsetItem(params: { id: number | false, method: Enum.Method | null, accountedType: AccountedType }) {
	return useQuery(["accounted", "offset", params.id, params.method], async () => {
		if (params.id === false) {
			return null;
		}
		if (params.method === null || params.method !== 'OFFSET') {
			return null
		}

		const resp = await axios.get<Api.ByOffsetItemResponse>(
			`${API_HOST}/accounted/accountedType/${params.accountedType}/accountedId/${params.id}/offset`
		);
		return resp.data;
	});
}

export function useByOffsetCreate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.ByOffsetCreateRequest }) => {
			const resp = await axios.post(
				`${API_HOST}/accounted/accountedType/${params.data.accountedType}/offset`,
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

export function useByOffsetUpdate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.ByOffsetUpdateRequest; id: number }) => {
			const resp = await axios.patch(
				`${API_HOST}/accounted/accountedType/${params.data.accountedType}/accountedId/${params.id}/offset`,
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

export function useByOffsetDelete() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { id: number | false, accountedType: AccountedType }) => {
			const resp = await axios.delete(`${API_HOST}/accounted/accountedType/${params.accountedType}/accountedId/${params.id}/offset`);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["accounted", "list"]);
			},
		}
	);
}