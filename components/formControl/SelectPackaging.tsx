import { ApiHook, Util } from "@/common";
import { Record } from "@/common/protocol";
import { Select } from "antd";
import { useMemo } from "react";
import { Icon } from "..";
import { Model } from "@/@shared";

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const staticData = ApiHook.Static.PaperMetadata.useGetAll();

  const options = useMemo(() => {
    const options = staticData.data?.packagings.map((x) => ({
      label: <Item item={x} />,
      text: `${Util.formatPackaging(x)})`,
      value: x.id,
    }));
    options?.sort((a, b) => a.text.localeCompare(b.text));
    return options;
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
        placeholder="포장을 선택하세요"
        dropdownMatchSelectWidth={false}
        disabled={props.disabled}
      />
    </div>
  );
}

interface ItemProps {
  item: Model.Packaging;
}

function Item(props: ItemProps) {
  const x = props.item;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-initial whitespace-pre flex flex-col justify-center text-lg">
        <Icon.PackagingType packagingType={x.type} />
      </div>
      <div className="flex-initial whitespace-pre">{x.type.padEnd(4)}</div>
      <div className="flex-1">{Util.formatPackaging(x)}</div>
    </div>
  );
}
