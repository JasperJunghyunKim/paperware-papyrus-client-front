import { Model } from "@/@shared";
import { ApiHook } from "@/common";
import { Select } from "antd";
import { useCallback, useMemo } from "react";

interface Props {
  isAll?: boolean;
  value?: number | string;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const staticData = ApiHook.Partner.Partner.useGetList();

  const options = useMemo(() => {
    const itemList = staticData.data?.reduce((acc: any[], crr, idx) => {
      if (idx === 0 && props.isAll) {
        acc.push({
          label: <Item item={{
            companyRegistrationNumber: '',
            companyId: 0,
            memo: '',
            partnerNickName: '전체'
          }} />,
          value: '',
        });
      }

      acc.push({
        label: <Item item={crr} />,
        value: `${crr.companyId}/${crr.companyRegistrationNumber}`,
      });
      return acc;
    }, []);

    return itemList;
  }, [props.isAll, staticData]);

  const value = useCallback(() => {
    if (staticData.data?.length === 0) {
      return undefined;
    }

    if (props.isAll) {
      return '';
    }
  }, [staticData, props])

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value === 0 ? value() : props.value as any}
        onChange={props.onChange}
        placeholder="거래처"
        options={options}
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
