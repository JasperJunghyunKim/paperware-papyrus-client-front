import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Select } from "antd";
import { useMemo } from "react";

type RecordType = Omit<Model.User, "company">;

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  isPublic?: boolean;
}

export default function Component(props: Props) {
  const list = ApiHook.Setting.User.useGetList({ query: {} });

  const options = useMemo(() => {
    return list.data?.items.map((x) => ({
      label: <Item item={x} />,
      text: `${x.name} ${x.phoneNo}`,
      value: x.id,
    }));
  }, [list, props.isPublic]);

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
        placeholder="직원 선택"
        dropdownMatchSelectWidth={false}
        disabled={props.disabled}
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
      <div className="flex-1 whitespace-pre">{x.name}</div>
      <div className="flex-initial text-gray-400 text-right font-fixed">
        {Util.formatPhoneNo(x.phoneNo)}
      </div>
    </div>
  );
}
