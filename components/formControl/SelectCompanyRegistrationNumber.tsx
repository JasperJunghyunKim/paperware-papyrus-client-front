import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Select } from "antd";
import { useMemo } from "react";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const staticData = ApiHook.Inhouse.BusinessRelationship.useGetCompactList({
    query: {},
  });

  const options = useMemo(() => {
    const options = staticData.data?.items.map((x) => ({
      label: <Item item={x} />,
      value: x.companyRegistrationNumber,
      temp: `${x.partner?.partnerNickName} ${x.companyRegistrationNumber} ${x.businessName}`,
    }));
    options?.sort((a, b) => a.temp.localeCompare(b.temp));
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
          return `${option.temp}`.toLowerCase().includes(input.toLowerCase());
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
  item: Model.BusinessRelationshipCompact;
}

function Item(props: ItemProps) {
  const x = props.item;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-1">
        {x.partner?.partnerNickName ?? x.businessName}
      </div>
      <div className="flex-initial text-gray-400">
        {Util.formatCompanyRegistrationNo(x.companyRegistrationNumber)}
      </div>
      <div className="flex-initial">{x.managedById ? "비연결" : "연결"}</div>
    </div>
  );
}
