import { ApiHook, Util } from "@/common";
import { Record } from "@/common/protocol";
import { Select } from "antd";
import { useMemo } from "react";

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const list = ApiHook.Inhouse.Warehouse.useGetList({
    query: {},
  });

  const options = useMemo(() => {
    return list.data?.items.map((x) => ({
      label: <Item item={x} />,
      text: `${x.name} ${Util.formatAddress(x.address)}`,
      value: x.id,
    }));
  }, [list]);

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
        placeholder="창고 미지정"
        dropdownMatchSelectWidth={false}
        disabled={props.disabled}
      />
    </div>
  );
}

interface ItemProps {
  item: Record.Warehouse;
}

function Item(props: ItemProps) {
  const x = props.item;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-initial whitespace-pre">{x.name.padEnd(8)}</div>
      <div className="flex-1 text-gray-400">
        {Util.formatAddress(x.address)}
      </div>
    </div>
  );
}
