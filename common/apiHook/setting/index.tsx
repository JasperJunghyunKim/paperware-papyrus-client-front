import {
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
  SecurityUpdateRequest,
} from "@/@shared/api";
import { $query } from "@/common/apiTemplate";

export * as Account from "./account";
export * as Company from "./company";
export * as User from "./user";

export namespace BankAccount {
  const path = "bank-account";
  const name = "bank-account";

  export const useGetList = (query?: Partial<BankAccountListQuery>) =>
    $query.list<BankAccountListResponse>(path, name, query);

  export const useGetItem = (id?: number) =>
    $query.item<BankAccountItemResponse>(`${path}/:id`, name, id);

  export const useCreate = () =>
    $query.create<BankAccountCreateRequest>(path, [name]);

  export const useUpdate = () =>
    $query.update<BankAccountUpdateRequest>(`${path}/:id`, [name]);

  export const useDelete = () => $query.remove(`${path}/:id`, [name]);
}

export namespace Card {
  const path = "card";
  const name = "card";

  export const useGetList = (query?: Partial<CardListQuery>) =>
    $query.list<CardListResponse>(path, name, query);

  export const useGetItem = (id?: number) =>
    $query.item<CardItemResponse>(`${path}/:id`, name, id);

  export const useCreate = () => $query.create<CardCreateRequest>(path, [name]);

  export const useUpdate = () =>
    $query.update<CardUpdateRequest>(`${path}/:id`, [name]);

  export const useDelete = () => $query.remove(`${path}/:id`, [name]);
}

export namespace Security {
  const path = "security";
  const name = "security";

  export const useGetList = (query?: Partial<SecurityListQuery>) =>
    $query.list<SecurityListResponse>(path, name, query);

  export const useGetItem = (id?: number) =>
    $query.item<SecurityItemResponse>(`${path}/:id`, name, id);

  export const useCreate = () =>
    $query.create<SecurityCreateRequest>(path, [name]);

  export const useUpdate = () =>
    $query.update<SecurityUpdateRequest>(`${path}/:id`, [name]);

  export const useUpdateStatus = () =>
    $query.update<SecurityUpdateRequest>(`${path}/:id/status`, [name]);

  export const useDelete = () => $query.remove(`${path}/:id`, [name]);
}
