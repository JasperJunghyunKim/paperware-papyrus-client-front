import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Select } from "antd";
import { useMemo } from "react";

interface Props {
  isAll?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const staticData = ApiHook.Inhouse.Security.useGetSecurityList();

  const options = useMemo(() => {
    return staticData.data?.items.filter(item => item.securityStatus === 'NONE').map((item) => ({
      label: <Item item={item} />,
      value: item.securityId,
    }));
  }, [staticData]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={props.onChange}
        placeholder="유가증권 목록"
        options={options}
      />
    </div>
  );
}

interface ItemProps {
  item: Model.Security;
}

function Item(props: ItemProps) {
  const { item } = props;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-initial text-gray-600">{Util.drawedStatusToSTring(item?.drawedStatus)}</div>
      <div className="flex-initial whitespace-pre">
        {Util.securityTypeToSTring(item?.securityType)}
      </div>
      <div className="flex-1">{item?.securitySerial}</div>
      <div className="flex-1">{Util.formatIso8601ToLocalDate(item?.drawedDate)}</div>
      <div className="flex-1">{Util.formatIso8601ToLocalDate(item?.maturedDate)}</div>
    </div>
  );
}
