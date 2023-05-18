
import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetBankAccountList(params?: {
	query?: Partial<Api.BankAccountQuery>;
}) {
	return useQuery(
		[
			"bank-account",
			"list",
			params?.query?.skip,
			params?.query?.take,
		],
		async () => {
			const resp = await axios.get<Api.BankAccountListResponse>(
				`${API_HOST}/bank-account`,
				{
					params: params?.query,
				}
			);
			return resp.data;
		},
	);
}
export function useGetBankAccountItem(params: {
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
			const resp = await axios.get<Api.BankAccountItemResponse>(
				`${API_HOST}/bank-account/${params.id}`,
			);
			return resp.data;
		},
	);
}

export function useBankAccountCreate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.BankAccountCreateRequest }) => {
			const resp = await axios.post(
				`${API_HOST}/bank-account`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["bank-account", "list"]);
			},
		}
	);
}

export function useBankAccountUpdate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.BankAccountUpdateRequest; id: number }) => {
			const resp = await axios.patch(
				`${API_HOST}/bank-account/${params.id}`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["bank-account", "list"]);
			},
		}
	);
}

export function useBankAccountDelete() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { id: number | false }) => {
			const resp = await axios.delete(`${API_HOST}/bank-account/${params.id}`);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["bank-account", "list"]);
			},
		}
	);
}