
import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetCardList(params: {
	query: Partial<Api.CardQuery>;
}) {
	return useQuery(
		[
			"card",
			"list",
			params.query.skip,
			params.query.take,
		],
		async () => {
			const resp = await axios.get<Api.CardListResponse>(
				`${API_HOST}/card`,
				{
					params: params.query,
				}
			);
			return resp.data;
		},
	);
}
export function useGetCardItem(params: {
	id: number | false;
}) {
	return useQuery(
		[
			"card",
			"item",
			params.id
		],
		async () => {
			if (params.id === false) {
				return null;
			}
			const resp = await axios.get<Api.CardItemResponse>(
				`${API_HOST}/card/${params.id}`,
			);
			return resp.data;
		},
	);
}

export function useCardCreate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.CardCreateRequest }) => {
			const resp = await axios.post(
				`${API_HOST}/card`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["card", "list"]);
			},
		}
	);
}

export function useCardUpdate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.CardUpdateRequest; id: number }) => {
			const resp = await axios.patch(
				`${API_HOST}/card/${params.id}`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["card", "list"]);
			},
		}
	);
}

export function useCardDelete() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { id: number | false }) => {
			const resp = await axios.delete(`${API_HOST}/card/${params.id}`);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["card", "list"]);
			},
		}
	);
}