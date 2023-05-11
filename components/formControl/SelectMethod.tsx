import { Model } from "@/@shared";
import { Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { useCallback, useMemo } from "react";

const METHOD_OPTIONS = [
  {
    label: "전체",
    value: "All" as Model.Enum.Method,
  },
  // {
  //   label: "계좌 이체",
  //   value: "ACCOUNT_TRANSFER" as Model.Enum.Method,
  // },
  // {
  //   label: "유가증권",
  //   value: "PROMISSORY_NOTE" as Model.Enum.Method,
  // },
  // {
  //   label: "카드입금",
  //   value: "CARD_PAYMENT" as Model.Enum.Method,
  // },
  {
    label: "현금",
    value: "CASH" as Model.Enum.Method,
  },
  // {
  //   label: "상계",
  //   value: "SET_OFF" as Model.Enum.Method,
  // },
  {
    label: "기타",
    value: "ETC" as Model.Enum.Method,
  },
];

interface Props {
  isAll?: boolean;
  isDisabled?: boolean;
  value?: Model.Enum.Method & string & number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const options = useMemo(() => {
    const itemList = METHOD_OPTIONS.filter((item) => props.isAll ? true : item.value !== 'All')

    return itemList;
  }, [props.isAll]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        defaultValue={props.isAll ? 'All' : undefined as unknown as Model.Enum.Method as any}
        disabled={props.isDisabled}
        value={props.value as unknown as Model.Enum.Method as any}
        onChange={props.onChange}
        options={options as DefaultOptionType[]}
        placeholder="계정 과목"
      />
    </div>
  );
}
