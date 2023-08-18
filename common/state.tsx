import { Model } from "@/@shared";
import { atom } from "recoil";
import { v1 } from "uuid";

export const session$ = atom({
  key: `session-${v1()}`,
  default: null,
});

export const stockCart$ = atom<Model.StockGroup[]>({
  key: `stockCart-${v1()}`,
  default: [],
});
