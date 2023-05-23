import { Model } from "@/@shared";
import { Select } from "antd";

export const BANK_OPTIONS = [
  {
    label: "카카오뱅크",
    value: "KAKAO_BANK" as Model.Enum.Bank,
  },
  {
    label: "국민은행",
    value: "KOOKMIN_BANK" as Model.Enum.Bank,
  },
  {
    label: "하나은행",
    value: "KEB_HANA_BANK" as Model.Enum.Bank,
  },
  {
    label: "농협은행",
    value: "NH_BANK" as Model.Enum.Bank,
  },
  {
    label: "신한은행",
    value: "SHINHAN_BANK" as Model.Enum.Bank,
  },
  {
    label: "기업은행",
    value: "IBK" as Model.Enum.Bank,
  },
  {
    label: "우리은행",
    value: "WOORI_BANK" as Model.Enum.Bank,
  },
  {
    label: "씨티은행",
    value: "CITI_BANK_KOREA" as Model.Enum.Bank,
  },
  {
    label: "하나은행",
    value: "HANA_BANK" as Model.Enum.Bank,
  },
  {
    label: "SC 제일은행",
    value: "SC_FIRST_BANK" as Model.Enum.Bank,
  },
  {
    label: "경남은행",
    value: "KYONGNAM_BANK" as Model.Enum.Bank,
  },
  {
    label: "광주은행",
    value: "KWANGJU_BANK" as Model.Enum.Bank,
  },
  {
    label: "대구은행",
    value: "DAEGU_BANK" as Model.Enum.Bank,
  },
  {
    label: "도이치은행",
    value: "DEUTSCHE_BANK" as Model.Enum.Bank,
  },
  {
    label: "뱅크오브아메리카",
    value: "BANK_OF_AMERICA" as Model.Enum.Bank,
  },
  {
    label: "부산은행",
    value: "BUSAN_BANK" as Model.Enum.Bank,
  },
  {
    label: "산림조합중앙회",
    value: "NACF" as Model.Enum.Bank,
  },
  {
    label: "저축은행",
    value: "SAVINGS_BANK" as Model.Enum.Bank,
  },
  {
    label: "새마을금고중앙회",
    value: "NACCSF" as Model.Enum.Bank,
  },
  {
    label: "수협은행",
    value: "SUHYUP_BANK" as Model.Enum.Bank,
  },
  {
    label: "신협중앙회",
    value: "NACUFOK" as Model.Enum.Bank,
  },
  {
    label: "우체국",
    value: "POST_OFFICE" as Model.Enum.Bank,
  },
  {
    label: "전북은행",
    value: "JEONBUK_BANK" as Model.Enum.Bank,
  },
  {
    label: "제주은행",
    value: "JEJU_BANK" as Model.Enum.Bank,
  },
  {
    label: "K뱅크",
    value: "K_BANK" as Model.Enum.Bank,
  },
  {
    label: "토스뱅크",
    value: "TOS_BANK" as Model.Enum.Bank,
  },
];

interface Props {
  isDisabled?: boolean;
  value?: Model.Enum.Bank & string & number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={props.onChange}
        disabled={props.isDisabled}
        options={BANK_OPTIONS}
        placeholder="은행 목록"
      />
    </div>
  );
}
