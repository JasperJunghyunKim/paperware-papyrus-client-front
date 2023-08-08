import {
  AccountedByBankAccountCreatedRequest,
  AccountedByCardCreatedRequest,
  AccountedByCashCreatedRequest,
  AccountedByEtcCreatedRequest,
  AccountedByOffsetCreatedRequest,
  AccountedItemResponse,
  AccountedListQuery,
  AccountedListResponse,
  BankAccountCreateRequest,
  BankAccountItemResponse,
  BankAccountListQuery,
  BankAccountListResponse,
  BankAccountUpdateRequest,
  CardCreateRequest,
  CardItemResponse,
  CardListQuery,
  CardListResponse,
  CardUpdateRequest,
  SecurityCreateRequest,
  SecurityItemResponse,
  SecurityListQuery,
  SecurityListResponse,
  SecurityStatusUpdateRequest,
} from "@/@shared/api";
import { $query } from "@/common/apiTemplate";

export * as Account from "./account";
export * as Company from "./company";
export * as User from "./user";

export namespace BankAccount {
  const [path, name] = ["bank-account", "bank-account"];
  type Id = { id: number };

  export const useGetList = (query?: Partial<BankAccountListQuery>) =>
    $query.useList<BankAccountListResponse>(path, name, query);

  export const useGetItem = (id?: number) =>
    $query.useItem<BankAccountItemResponse, Id>(`${path}/:id`, name, { id });

  export const useCreate = () =>
    $query.useCreate<BankAccountCreateRequest>(path, [name]);

  export const useUpdate = () =>
    $query.useUpdate<BankAccountUpdateRequest, Id>(`${path}/:id`, [name]);

  export const useDelete = () => $query.useRemove(`${path}/:id`, [name]);
}

export namespace Card {
  const [path, name] = ["card", "card"];
  type Id = { id: number };

  export const useGetList = (query?: Partial<CardListQuery>) =>
    $query.useList<CardListResponse>(path, name, query);

  export const useGetItem = (id?: number) =>
    $query.useItem<CardItemResponse, Id>(`${path}/:id`, name, { id });

  export const useCreate = () =>
    $query.useCreate<CardCreateRequest>(path, [name]);

  export const useUpdate = () =>
    $query.useUpdate<CardUpdateRequest, Id>(`${path}/:id`, [name]);

  export const useDelete = () => $query.useRemove(`${path}/:id`, [name]);
}

export namespace Security {
  const [path, name] = ["security", "security"];
  type Id = { id: number };

  export const useGetList = (query?: Partial<SecurityListQuery>) =>
    $query.useList<SecurityListResponse>(path, name, query);

  export const useGetItem = (id?: number) =>
    $query.useItem<SecurityItemResponse, Id>(`${path}/:id`, name, { id });

  export const useCreate = () =>
    $query.useCreate<SecurityCreateRequest>(path, [name]);

  export const useUpdateStatus = () =>
    $query.usePatch<SecurityStatusUpdateRequest, Id>(`${path}/:id`, [name]);

  export const useDelete = () => $query.useRemove(`${path}/:id`, [name]);
}

export namespace Accounted {
  const [path, name] = ["accounted", "accounted"];
  type Id = { id: number };

  export const useGetList = (query?: Partial<AccountedListQuery>) =>
    $query.useList<AccountedListResponse>(path, name, query);

  export const useGetItem = (id?: number) =>
    $query.useItem<AccountedItemResponse, Id>(`${path}/:id`, name, { id });

  export const useCreateByBankAccount = () =>
    $query.useCreate<AccountedByBankAccountCreatedRequest>(
      `${path}/bank-account`,
      [name]
    );

  export const useCreateByCash = () =>
    $query.useCreate<AccountedByCashCreatedRequest>(`${path}/cash`, [name]);

  export const useCreateBySecurity = () =>
    $query.useCreate<AccountedByCashCreatedRequest>(`${path}/security`, [name]);

  export const useCreateByCard = () =>
    $query.useCreate<AccountedByCardCreatedRequest>(`${path}/card`, [name]);

  export const useCreateByOffset = () =>
    $query.useCreate<AccountedByOffsetCreatedRequest>(`${path}/offset`, [name]);

  export const useCreateByEtc = () =>
    $query.useCreate<AccountedByEtcCreatedRequest>(`${path}/etc`, [name]);

  export const useUpdateByBankAccount = () =>
    $query.useUpdate<AccountedByBankAccountCreatedRequest, Id>(
      `${path}/bank-account/:id`,
      [name]
    );

  export const useUpdateByCash = () =>
    $query.useUpdate<AccountedByCashCreatedRequest, Id>(`${path}/cash/:id`, [
      name,
    ]);

  export const useUpdateBySecurity = () =>
    $query.useUpdate<AccountedByCashCreatedRequest, Id>(
      `${path}/security/:id`,
      [name]
    );

  export const useUpdateByCard = () =>
    $query.useUpdate<AccountedByCardCreatedRequest, Id>(`${path}/card/:id`, [
      name,
    ]);

  export const useUpdateByOffset = () =>
    $query.useUpdate<AccountedByOffsetCreatedRequest, Id>(
      `${path}/offset/:id`,
      [name]
    );

  export const useUpdateByEtc = () =>
    $query.useUpdate<AccountedByEtcCreatedRequest, Id>(`${path}/etc/:id`, [
      name,
    ]);

  export const useDelete = () => $query.useRemove(`${path}/:id`, [name]);
}
