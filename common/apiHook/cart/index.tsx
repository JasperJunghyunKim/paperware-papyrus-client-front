import {
  CartCreateRequest,
  CartListQuery,
} from "@/@shared/api/trade/cart.request";
import { CartListResponse } from "@/@shared/api/trade/cart.response";
import { $query } from "@/common/apiTemplate";

export const useGetList = (query: Partial<CartListQuery>) =>
  $query.useList<CartListResponse>("cart", "cart", query);

export const useCreate = () =>
  $query.useCreate<CartCreateRequest>("cart", ["cart"]);

export const useDelete = () =>
  $query.useRemove<{ id: number }>("cart/:id", ["cart"]);
