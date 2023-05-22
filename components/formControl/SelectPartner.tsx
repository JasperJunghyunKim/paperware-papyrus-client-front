import { Model } from "@/@shared";
import { ApiHook } from "@/common";
import { Select } from "antd";
import { useMemo } from "react";

interface Props {
  isAll?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const staticData = ApiHook.Partner.Partner.useGetList();

  const options = useMemo(() => {
    const itemList = staticData.data?.reduce((acc: any[], crr, idx) => {
      if (idx === 0 && props.isAll) {
        acc.push({
          label: <Item item={null} />,
          value: undefined,
        });
      }

      acc.push({
        label: <Item item={crr} />,
        value: crr.companyRegistrationNumber,
      });

      return acc;
    }, []);

    return itemList;
  }, [staticData, props.isAll]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        defaultValue={props.isAll ? 0 : undefined}
        value={props.value}
        onChange={props.onChange}
        options={options}
        placeholder="거래처"
        disabled={props.disabled}
      />
    </div>
  );
}

interface ItemProps {
  item: Model.Partner | null;
}

function Item(props: ItemProps) {
  const { item } = props;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-1">{item?.partnerNickName}</div>
    </div>
  );
}
