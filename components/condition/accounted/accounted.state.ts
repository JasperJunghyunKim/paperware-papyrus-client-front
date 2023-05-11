import { Api } from "@/@shared";
import { atom } from "recoil";
import { v1 } from "uuid";

export const accountedAtom = atom<Omit<Api.AccountedQuery, 'skip' | 'take'>>({
  key: `paid-condition-${v1()}`,
  default: {
    partnerId: 0,
    accountedType: 'PAID',
    accountedSubject: 'All',
    accountedMethod: 'All',
    accountedFromDate: '',
    accountedToDate: '',
  },
});
