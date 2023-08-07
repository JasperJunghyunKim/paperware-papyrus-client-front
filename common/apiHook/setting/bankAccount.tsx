import {
  BankAccountCreateRequest,
  BankAccountUpdateRequest,
} from "@/@shared/api";
import { ApiTemplate } from "@/common";

export const useGetList = ApiTemplate.useGetListQuery(
  "bank-account",
  "account"
);

export const useGetItem = ApiTemplate.useGetItemQuery(
  "bank-account",
  "account"
);

export const useCreate =
  ApiTemplate.useCreateMutation<BankAccountCreateRequest>("bank-account");

export const useUpdate =
  ApiTemplate.useUpdateMutation<BankAccountUpdateRequest>("bank-account");

export const useDelete = ApiTemplate.useDeleteMutation("bank-account");
