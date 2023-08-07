import {
  BankAccountCreateRequest,
  BankAccountItemResponse,
  BankAccountListQuery,
  BankAccountListResponse,
  BankAccountUpdateRequest,
} from "@/@shared/api";
import { $mc, $mr, $mu, $qi, $ql } from "@/common/apiTemplate";

export const useGetList = (query?: Partial<BankAccountListQuery>) =>
  $ql<BankAccountListResponse>`bank-account bank-account ${query}`;

export const useGetItem = (id?: number) =>
  $qi<BankAccountItemResponse>`bank-account bank-account ${id}`;

export const useCreate = () =>
  $mc<BankAccountCreateRequest>`bank-account bank-account`;

export const useUpdate = () =>
  $mu<BankAccountUpdateRequest>`bank-account bank-account`;

export const useDelete = () => $mr`bank-account bank-account`;
