import { Model } from "@/@shared";
import { Select } from "antd";


const CARD_OPTIONS = [
  {
    label: "비씨카드",
    value: "BC_CARD" as Model.Enum.CardCompany,
  },
  {
    label: "국민카드",
    value: "KB_CARD" as Model.Enum.CardCompany,
  },
  {
    label: "삼성카드",
    value: "SAMSUNG_CARD" as Model.Enum.CardCompany,
  },
  {
    label: "신한카드",
    value: "SHINHAN_CARD" as Model.Enum.CardCompany,
  },
  {
    label: "우리카드",
    value: "WOORI_CARD" as Model.Enum.CardCompany,
  },
  {
    label: "하나카드",
    value: "HANA_CARD" as Model.Enum.CardCompany,
  },
  {
    label: "롯데카드",
    value: "LOTTE_CARD" as Model.Enum.CardCompany,
  },
  {
    label: "현대카드",
    value: "HYUNDAI_CARD" as Model.Enum.CardCompany,
  },
  {
    label: "농협카드",
    value: "NH_CARD" as Model.Enum.CardCompany,
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
        value={props.value}
        onChange={props.onChange}
        disabled={props.isDisabled}
        options={CARD_OPTIONS}
        placeholder="카드 목록"
      />
    </div>
  );
}
