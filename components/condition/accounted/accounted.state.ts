import { Api } from "@/@shared";
import dayjs from "dayjs";
import { atom } from "recoil";
import { v4 } from "uuid";


export const accountedAtom = atom<Omit<Api.AccountedQuery, 'skip' | 'take'>>({
  key: `accounted-condition-${v4()}`,
  default: {
    companyId: 0,
    partnerNickName: '전체',
    companyRegistrationNumber: '',
    accountedType: 'PAID',
    accountedSubject: 'All',
    accountedMethod: 'All',
    // 해당 달의 첫째 날
    accountedFromDate: dayjs().startOf('month').toISOString(),
    // 해당 달의 마지막 날
    accountedToDate: dayjs().endOf('month').toISOString(),
  },
});
