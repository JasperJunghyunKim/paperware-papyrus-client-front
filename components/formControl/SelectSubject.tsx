import { Model } from "@/@shared";
import { accountedSubject } from "@/@shared/helper/enum.util";
import { Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { useMemo } from "react";

export const SUBJECT_OPTIONS = [
  {
    value: "All" as Model.Enum.Subject,
  },
  {
    value: "ACCOUNTS_RECEIVABLE" as Model.Enum.Subject,
  },
  {
    value: "UNPAID" as Model.Enum.Subject,
  },
  {
    value: "ADVANCES" as Model.Enum.Subject,
  },
  {
    value: "MISCELLANEOUS_INCOME" as Model.Enum.Subject,
  },
  {
    value: "PRODUCT_SALES" as Model.Enum.Subject,
  },
  {
    value: "ETC" as Model.Enum.Subject,
  },
];

interface Props {
  isAll?: boolean;
  accountedType: Model.Enum.AccountedType;
  value?: number | Model.Enum.AccountedType;
  onChange?: (value: number) => void;
}

export default function Component(props: Props) {
  const options = useMemo(() => {
    return SUBJECT_OPTIONS.filter((item) => props.isAll ? true : item.value !== 'All')
  }, [props]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        defaultValue={props.isAll ? undefined : props.value as unknown as Model.Enum.Subject as any}
        value={accountedSubject(props.accountedType, props.value as any) as unknown as Model.Enum.Subject as any}
        onChange={props.onChange}
        placeholder="계정 과목"
      >
        {
          options.map((item) => {
            return (
              <Select.Option key={item.value} value={item.value}>
                {accountedSubject(props.accountedType, item.value)}
              </Select.Option>
            )
          })
        }
      </Select>
    </div>
  );
}
