
import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetSecurityList(params?: {
	query?: Partial<Api.SecurityQuery>;
}) {
	return useQuery(
		[
			"security",
			"list",
			params?.query?.skip,
			params?.query?.take,
		],
		async () => {
			const resp = await axios.get<Api.SecurityListResponse>(
				`${API_HOST}/security`,
				{
					params: params?.query,
				}
			);
			return resp.data;
		},
	);
}
export function useGetSecurityItem(params: {
	id: number | false;
}) {
	return useQuery(
		[
			"security",
			"item",
			params.id
		],
		async () => {
			if (params.id === false) {
				return null;
			}
			const resp = await axios.get<Api.SecurityItemResponse>(
				`${API_HOST}/security/${params.id}`,
			);
			return resp.data;
		},
	);
}

export function useSecurityCreate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.SecurityCreateRequest }) => {
			const resp = await axios.post(
				`${API_HOST}/security`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["security", "list"]);
			},
		}
	);
}

export function useSecurityUpdate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.SecurityUpdateRequest; id: number }) => {
			const resp = await axios.patch(
				`${API_HOST}/security/${params.id}`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["security", "list"]);
			},
		}
	);
}

export function useSecurityStatusUpdate() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { data: Api.SecurityUpdateStatusRequest; id: number }) => {
			const resp = await axios.patch(
				`${API_HOST}/security/${params.id}/status`,
				params.data
			);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["security", "list"]);
			},
		}
	);
}

export function useSecurityDelete() {
	const queryClient = useQueryClient();

	return useMutation(
		async (params: { id: number | false }) => {
			const resp = await axios.delete(`${API_HOST}/security/${params.id}`);
			return resp.data;
		},
		{
			onSuccess: async () => {
				await queryClient.invalidateQueries(["security", "list"]);
			},
		}
	);
}