import { Model } from "@/@shared";
import { Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { useMemo } from "react";

export const PAID_SUBJECT_OPTIONS = [
  {
    label: "전체",
    value: "All" as Model.Enum.Subject,
  },
  {
    label: "외상 매출금",
    value: "PAID_ACCOUNTS_RECEIVABLE" as Model.Enum.Subject,
  },
  {
    label: "미수금",
    value: "PAID_UNPAID_AMOUNTS" as Model.Enum.Subject,
  },
  {
    label: "선수금",
    value: "PAID_ADVANCES" as Model.Enum.Subject,
  },
  {
    label: "잡이익",
    value: "PAID_MISCELLANEOUS_INCOME" as Model.Enum.Subject,
  },
  {
    label: "상품 매출",
    value: "PAID_PRODUCT_SALES" as Model.Enum.Subject,
  },
  {
    label: "기타",
    value: "ETC" as Model.Enum.Subject,
  },
];

export const COLLECTED_OPTIONS = [
  {
    label: "전체",
    value: "All" as Model.Enum.Subject,
  },
  {
    label: "외상 매입금",
    value: "COLLECTED_ACCOUNTS_RECEIVABLE" as Model.Enum.Subject,
  },
  {
    label: "미지급금",
    value: "COLLECTED_UNPAID_EXPENSES" as Model.Enum.Subject,
  },
  {
    label: "선지급금",
    value: "COLLECTED_PREPAID_EXPENSES" as Model.Enum.Subject,
  },
  {
    label: "잡손실",
    value: "COLLECTED_MISCELLANEOUS_LOSSES" as Model.Enum.Subject,
  },
  {
    label: "상품 매입",
    value: "COLLECTED_PRODUCT_PURCHASES" as Model.Enum.Subject,
  },
  {
    label: "기타",
    value: "ETC" as Model.Enum.Subject,
  },
];

interface Props {
  isAll?: boolean;
  accountedType: Model.Enum.AccountedType;
  value?: number;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const options = useMemo(() => {
    let list = [];

    if (props.accountedType === 'PAID') {
      list = PAID_SUBJECT_OPTIONS.filter((item) => props.isAll ? true : item.value !== 'All')
    } else {
      list = COLLECTED_OPTIONS.filter((item) => props.isAll ? true : item.value !== 'All')
    }

    return list;
  }, [props]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        defaultValue={props.isAll ? undefined : props.value as unknown as Model.Enum.Method as any}
        value={props.value as unknown as Model.Enum.Subject as any}
        onChange={props.onChange}
        options={options as DefaultOptionType[]}
        placeholder="계정 과목"
      />
    </div>
  );
}
