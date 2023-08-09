import { Model } from "@/@shared";
import { BankAccount, Security } from "@/@shared/models";
import { ApiHook, Util } from "@/common";
import { Select } from "antd";
import { useMemo } from "react";

type RecordType = Security;

interface Props {
  disabled?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const list = ApiHook.Setting.Security.useGetList({});

  const options = useMemo(() => {
    return list.data?.items.map((x) => ({
      label: <Item item={x} />,
      text: `${x.securitySerial} ${x.payer} ${Util.bankToString(x.payingBank)}`,
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
        placeholder="유가 증권을 선택하세요"
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
      <div className="flex-1 whitespace-pre">{x.securitySerial}</div>
      <div className="flex-initial whitespace-pre">{x.payer}</div>
      <div className="flex-initial text-gray-400 text-right">
        {Util.bankToString(x.payingBank)}
      </div>
    </div>
  );
}
