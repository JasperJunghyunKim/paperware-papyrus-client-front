import {
  BankAccountListQuery,
  CardCreateRequest,
  CardItemResponse,
  CardListResponse,
  CardUpdateRequest,
} from "@/@shared/api";
import { $mc, $mr, $mu, $qi, $ql } from "@/common/apiTemplate";

export const useGetList = (query?: Partial<BankAccountListQuery>) =>
  $ql<CardListResponse>`card card ${query}`;

export const useGetItem = (id?: number) =>
  $qi<CardItemResponse>`card card ${id}`;

export const useCreate = () => $mc<CardCreateRequest>`card card`;

export const useUpdate = () => $mu<CardUpdateRequest>`card card`;

export const useDelete = () => $mr`card card`;
