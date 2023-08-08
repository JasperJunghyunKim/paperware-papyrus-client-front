import { Model } from "@/@shared";
import { BankAccount, Card } from "@/@shared/models";
import { ApiHook, Util } from "@/common";
import { Select } from "antd";
import { useMemo } from "react";

type RecordType = Card;

interface Props {
  disabled?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const list = ApiHook.Setting.Card.useGetList({});

  const options = useMemo(() => {
    return list.data?.items.map((x) => ({
      label: <Item item={x} />,
      text: `${x.cardName} ${x.cardHolder} ${Util.cardCompanyString(
        x.cardCompany
      )}`,
      value: x.id,
    }));
  }, [list]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
        options={options}
        placeholder="카드 종류"
      />
    </div>
  );
}

interface ItemProps {
  item: RecordType;
}

function Item(props: ItemProps) {
  const x = props.item;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-1 whitespace-pre">{x.cardName}</div>
      <div className="flex-initial whitespace-pre">{x.cardHolder}</div>
      <div className="flex-initial text-gray-400 text-right">
        {Util.cardCompanyString(x.cardCompany)}
      </div>
    </div>
  );
}
