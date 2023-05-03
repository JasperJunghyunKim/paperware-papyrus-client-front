import { Api } from "@/common";
import { Record } from "@/common/protocol";
import { Select } from "antd";
import { useMemo } from "react";

interface Props {
  value?: number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const staticData = Api.Static.Paper.useGetAll();

  const options = useMemo(() => {
    return staticData.data?.paperColor.map((x) => ({
      label: <Item item={x} />,
      text: `${x.name})`,
      value: x.id,
    }));
  }, [staticData]);

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
        placeholder="색상 미지정"
      />
    </div>
  );
}

interface ItemProps {
  item: Record.PaperColor;
}

function Item(props: ItemProps) {
  const x = props.item;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-1">{x.name}</div>
    </div>
  );
}
