import {
  ByBankAccountCreateRequest,
  ByBankAccountUpdateRequest,
  ByCardCreateRequest,
  ByCardUpdateRequest,
  ByCashCreateRequest,
  ByCashUpdateRequest,
  ByEtcCreateRequest,
  ByEtcUpdateRequest,
  ByOffsetCreateRequest,
  ByOffsetUpdateRequest,
  BySecurityCreateRequest,
  BySecurityUpdateRequest,
} from "@/@shared/api";
import { API_HOST } from "@/common/const";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

namespace Template {
  const path = `${API_HOST}/accounted/accountedType`;

  export const useGetItemQuery = <T,>(name: string, id?: number) =>
    useQuery(
      [name, "item", id],
      async () =>
        await axios.get<T>(`/api/${name}/${id}`).then((res) => res.data),
      {
        enabled: id !== undefined,
      }
    );

  export const useCreateMutation = <T,>(name: string) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (params: { data: T }) =>
        await axios
          .post(`${path}/${name}`, params.data)
          .then((res) => res.data),
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries([name]);
        },
      }
    );
  };

  export const useUpdateMutation = <T,>(name: string) => {
    const queryClient = useQueryClient();

    return useMutation(
      async (params: { id: number; data: T }) =>
        await axios
          .put(`${path}/${name}/${params.id}`, params.data)
          .then((res) => res.data),
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries([name]);
        },
      }
    );
  };
}

export const useCreateByBankAccount = () =>
  Template.useCreateMutation<ByBankAccountCreateRequest>("bank-account");
export const useUpdateByBankAccount = () =>
  Template.useUpdateMutation<ByBankAccountUpdateRequest>("bank-account");

export const useCreateByCard = () =>
  Template.useCreateMutation<ByCardCreateRequest>("card");
export const useUpdateByCard = () =>
  Template.useUpdateMutation<ByCardUpdateRequest>("card");

export const useCreateByCash = () =>
  Template.useCreateMutation<ByCashCreateRequest>("cash");
export const useUpdateByCash = () =>
  Template.useUpdateMutation<ByCashUpdateRequest>("cash");

export const useCreateByEtc = () =>
  Template.useCreateMutation<ByEtcCreateRequest>("etc");
export const useUpdateByEtc = () =>
  Template.useUpdateMutation<ByEtcUpdateRequest>("etc");

export const useCreateByOffset = () =>
  Template.useCreateMutation<ByOffsetCreateRequest>("offset");
export const useUpdateByOffset = () =>
  Template.useUpdateMutation<ByOffsetUpdateRequest>("offset");

export const useCreateBySecurity = () =>
  Template.useCreateMutation<BySecurityCreateRequest>("security");
export const useUpdateBySecurity = () =>
  Template.useUpdateMutation<BySecurityUpdateRequest>("security");
