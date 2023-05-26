import { Model } from "@/@shared";
import { ApiHook } from "@/common";
import { Select } from "antd";
import { isUndefined } from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import { atom, useResetRecoilState, useSetRecoilState } from "recoil";
import { v4 } from "uuid";

export const selectSecurityAtom = atom<Model.Security>({
  key: `select-security-${v4()}`,
  default: {} as Model.Security
})

interface Props {
  isFilter?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const staticData = ApiHook.Inhouse.Security.useGetSecurityList();
  const setSelectSecurity = useSetRecoilState(selectSecurityAtom);
  const reset = useResetRecoilState(selectSecurityAtom);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isUndefined(props.value)) {
      const selectData = staticData.data?.items?.filter((item) => item.securityId === props.value)[0];
      if (!isUndefined(selectData)) {
        setSelectSecurity(selectData);
      }
    }
  }, [props, setSelectSecurity, staticData])

  const options = useMemo(() => {
    if (props.isFilter) {
      return staticData.data?.items.filter(item => item.securityStatus === 'NONE').map((item) => ({
        label: <Item item={item} />,
        value: item.securityId,
      }));
    } else {
      return staticData.data?.items.filter(item => item.securityStatus === 'NONE' || item.securityId === props.value).map((item) => ({
        label: <Item item={item} />,
        value: item.securityId,
      }));
    }
  }, [staticData, props]);

  const onChange = useCallback((value: number) => {
    const selectData = staticData.data?.items?.filter((item) => item.securityId === value)[0];
    if (!isUndefined(selectData)) {
      setSelectSecurity(selectData);
    }
    props.onChange?.(value);
  }, [props, setSelectSecurity, staticData])

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={onChange}
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
      <div>
        유가증권 번호:
      </div>
      <div className="flex-1">{item?.securitySerial}</div>
    </div>
  );
}
