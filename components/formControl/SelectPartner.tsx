import { Model } from "@/@shared";
import { ApiHook } from "@/common";
import { Select } from "antd";
import { isUndefined } from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import { atom, useResetRecoilState, useSetRecoilState } from "recoil";
import { v4 } from "uuid";

export const selectPartnerAtom = atom<Model.Partner>({
  key: `select-partner-${v4()}`,
  default: {} as Model.Partner
})

interface Props {
  isAll?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const staticData = ApiHook.Partner.Partner.useGetList();
  const setSelectPartner = useSetRecoilState(selectPartnerAtom);
  const reset = useResetRecoilState(selectPartnerAtom);

  const options = useMemo(() => {
    const itemList = staticData.data?.reduce((acc: any[], crr, idx) => {
      if (idx === 0 && props.isAll) {
        acc.push({
          label: <Item item={{
            partnerId: 0,
            partnerNickName: "전체",
          } as Model.Partner} />,
          text: '전체',
          value: 0,
        })
      }

      acc.push({
        label: <Item item={crr} />,
        text: `${crr.partnerNickName}`,
        value: crr.partnerId,
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
      return 0;
    }
  }, [staticData, props])

  const onChange = useCallback((value: number) => {
    const selectData = staticData.data?.filter((item) => item.partnerId === value)[0];
    if (!isUndefined(selectData)) {
      setSelectPartner(selectData);
    }
    props.onChange?.(value);
  }, [props, setSelectPartner, staticData])

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isUndefined(props.value)) {
      const list = options?.filter((item) => item.partnerId === props.value)[0];
      if (!isUndefined(list)) {
        setSelectPartner(list);
      }
    }
  }, [props, setSelectPartner, staticData, options])

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value === 0 ? value() : props.value}
        onChange={onChange}
        placeholder="거래처"
        options={options}
      />
    </div>
  );
}

interface ItemProps {
  item: Model.Partner;
}

function Item(props: ItemProps) {
  const { item } = props;
  return (
    <div className="flex font-fixed gap-x-4">
      <div style={{ display: 'none' }}>{item.partnerId}</div>
      <div className="flex-1">{item.partnerNickName}</div>
    </div>
  );
}
