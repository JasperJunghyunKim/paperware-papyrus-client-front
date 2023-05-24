import { Model } from "@/@shared";
import { Select } from "antd";

export const SECURITY_STATUS_OPTIONS = [
  {
    label: "기본",
    value: "NONE" as Model.Enum.SecurityStatus,
  },
  {
    label: "배서지급",
    value: "ENDORSED" as Model.Enum.SecurityStatus,
  },
  {
    label: "정상 결제",
    value: "NORMAL_PAYMENT" as Model.Enum.SecurityStatus,
  },
  {
    label: "할인 결제",
    value: "DISCOUNT_PAYMENT" as Model.Enum.SecurityStatus,
  },
  {
    label: "부도",
    value: "INSOLVENCY" as Model.Enum.SecurityStatus,
  },
  {
    label: "분실",
    value: "LOST" as Model.Enum.SecurityStatus,
  },
  {
    label: "보관",
    value: "SAFEKEEPING" as Model.Enum.SecurityStatus,
  },
];

interface Props {
  disabled?: boolean;
  value?: Model.Enum.SecurityStatus & string & number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
        options={SECURITY_STATUS_OPTIONS.filter((el) => el.value !== "ENDORSED")}
        placeholder="유가증권 상태 목록"
      />
    </div>
  );
}
