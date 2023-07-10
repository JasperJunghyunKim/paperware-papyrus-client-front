import { ApiHook, Util } from "@/common";
import { Record } from "@/common/protocol";
import { Select } from "antd";
import { useMemo } from "react";

type RecordType = Record.Location;

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  companyId: number;
  disabled?: boolean;
}

/** 자사의 기타도착지 또는 매입처의 도착지를 선택하는 컴포넌트 */
export default function Component(props: Props) {
  const list = ApiHook.Inhouse.Location.useGetListForSales({
    query: {
      targetCompanyId: props.companyId,
    },
  });

  const options = useMemo(() => {
    const a = list.data?.items
      .filter((x) => x.isPublic)
      .map((x) => ({
        label: <Item item={x} />,
        text: `${x.name} ${Util.formatAddress(x.address)}`,
        value: x.id,
      }));

    const b = list.data?.items
      .filter((x) => !x.isPublic)
      .map((x) => ({
        label: <Item item={x} />,
        text: `${x.name} ${Util.formatAddress(x.address)}`,
        value: x.id,
      }));

    return [
      {
        label: "거래처 도착지",
        options: b ?? [],
      },
      {
        label: "기타 도착지",
        options: a ?? [],
      },
    ];
  }, [list]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={props.onChange}
        options={options}
        filterOption={(input, option: any) => {
          if (!option) {
            return false;
          }
          return option.text?.toLowerCase().includes(input.toLowerCase());
        }}
        showSearch
        allowClear
        placeholder="도착지 선택"
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
      <div className="flex-initial whitespace-pre">{x.name.padEnd(8)}</div>
      <div className="flex-1 text-gray-400 text-right">
        {Util.formatAddress(x.address)}
      </div>
    </div>
  );
}
