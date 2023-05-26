import { Model } from "@/@shared";
import { Util } from "@/common";
import { Select } from "antd";

export const BANK_ACCOUNT_OPTIONS = [
  {
    label: "보통예금",
    value: "DEPOSIT",
  },
];

interface Props {
  isDisabled?: boolean;
  value?: Model.Enum.CardCompany & string & number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={Util.bankAccountTypeToString(props.value) as unknown as number}
        onChange={props.onChange}
        disabled={props.isDisabled}
        options={BANK_ACCOUNT_OPTIONS}
        placeholder="예금 종류"
      />
    </div>
  );
}
