import { Model } from "@/@shared";
import { ApiHook } from "@/common";
import { Select } from "antd";
import { useMemo } from "react";

export const CARD_OPTIONS = [
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
  const staticData = ApiHook.Inhouse.Card.useGetCardList();

  const options = useMemo(() => {
    return staticData.data?.items.map((el) => ({
      label: <Item item={el} />,
      text: `${el.cardCompany} ${el.cardName}`,
      value: el.cardId,
    }));
  }, [staticData]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={props.onChange}
        disabled={props.isDisabled}
        options={options}
        placeholder="카드 목록"
      />
    </div>
  );
}

interface ItemProps {
  item: Model.Card;
}

function Item(props: ItemProps) {
  const el = props.item;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-initial whitespace-pre">
        {el.cardName} ({CARD_OPTIONS.find((item) => item.value === el.cardCompany)?.label} {el.cardNumber})
      </div>
    </div>
  );
}
