import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Select } from "antd";
import { useMemo } from "react";

type RecordType = Model.Order;

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  type: "PURCHASE" | "SALES";
}

export default function Component(props: Props) {
  const me = ApiHook.Auth.useGetMe();
  const list = ApiHook.Trade.Common.useGetList({
    query: {
      srcCompanyId: props.type === "PURCHASE" ? me.data?.companyId : undefined,
      dstCompanyId: props.type === "SALES" ? me.data?.companyId : undefined,
      orderStatus: "ACCEPTED|CANCELLED",
      orderTypes: "NORMAL|DEPOSIT|NORMAL_DEPOSIT|PROCESS|ETC",
    },
  });

  console.log(list.data);

  const options = useMemo(() => {
    return list.data?.items.map((x) => ({
      label: <Item item={x} type={props.type} />,
      text: `${x.orderNo} ${Util.orderTypeToString(
        x.orderType,
        !!x.depositEvent,
        props.type
      )}`,
      value: x.orderNo,
    }));
  }, [list.data, props.type]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={props.onChange}
        options={options}
        filterOption={(input, option) => {
          if (!option) {
            return false;
          }
          return option.text.toLowerCase().includes(input.toLowerCase());
        }}
        showSearch
        allowClear
        placeholder={
          props.type === "PURCHASE" ? "매입번호 선택" : "매출번호 선택"
        }
        dropdownMatchSelectWidth={false}
        disabled={props.disabled}
      />
    </div>
  );
}

interface ItemProps {
  item: RecordType;
  type: "PURCHASE" | "SALES";
}

function Item(props: ItemProps) {
  const x = props.item;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-1 whitespace-pre">{x.orderNo}</div>
      <div className="flex-initial text-gray-400 text-right">
        {Util.orderTypeToString(x.orderType, !!x.depositEvent, props.type)}
      </div>
    </div>
  );
}
