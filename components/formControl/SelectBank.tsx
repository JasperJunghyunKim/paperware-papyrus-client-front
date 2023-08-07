import { Bank } from "@/@shared/models/enum";
import { Util } from "@/common";
import { Select } from "antd";

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <Select
        options={Array.from<Bank>([
          "KAKAO_BANK",
          "KOOKMIN_BANK",
          "KEB_HANA_BANK",
          "NH_BANK",
          "SHINHAN_BANK",
          "IBK",
          "WOORI_BANK",
          "CITI_BANK_KOREA",
          "HANA_BANK",
          "SC_FIRST_BANK",
          "KYONGNAM_BANK",
          "KWANGJU_BANK",
          "DAEGU_BANK",
          "DEUTSCHE_BANK",
          "BANK_OF_AMERICA",
          "BUSAN_BANK",
          "NACF",
          "SAVINGS_BANK",
          "NACCSF",
          "SUHYUP_BANK",
          "NACUFOK",
          "POST_OFFICE",
          "JEONBUK_BANK",
          "JEJU_BANK",
          "K_BANK",
          "TOS_BANK",
        ]).map((item) => ({
          label: Util.bankToString(item),
          value: item,
        }))}
        disabled={props.disabled}
      />
    </div>
  );
}
