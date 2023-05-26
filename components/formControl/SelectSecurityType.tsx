import { Model } from "@/@shared";
import { Util } from "@/common";
import { Select } from "antd";

export const SECURITY_TYPE_OPTIONS = [
  {
    label: "약속 어음",
    value: "PROMISSORY_NOTE" as Model.Enum.SecurityType,
  },
  {
    label: "전자 어음",
    value: "ELECTRONIC_NOTE" as Model.Enum.SecurityType,
  },
  {
    label: "전자 채권",
    value: "ELECTRONIC_BOND" as Model.Enum.SecurityType,
  },
  {
    label: "자기앞 수표",
    value: "PERSONAL_CHECK" as Model.Enum.SecurityType,
  },
  {
    label: "당좌 수표",
    value: "DEMAND_DRAFT" as Model.Enum.SecurityType,
  },
  {
    label: "가계 수표",
    value: "HOUSEHOLD_CHECK" as Model.Enum.SecurityType,
  },
  {
    label: "문방구 어음",
    value: "STATIONERY_NOTE" as Model.Enum.SecurityType,
  },
  {
    label: "기타",
    value: "ETC" as Model.Enum.SecurityType,
  },
];

interface Props {
  disabled?: boolean;
  value?: Model.Enum.SecurityType & string & number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={Util.securityTypeToSTring(props.value) as unknown as number}
        onChange={props.onChange}
        disabled={props.disabled}
        options={SECURITY_TYPE_OPTIONS}
        placeholder="유가증권 유형 목록"
      />
    </div>
  );
}
