import { Bank, EndorsementType } from "@/@shared/models/enum";
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
        options={Array.from<EndorsementType>([
          "NONE",
          "SELF_NOTE",
          "OTHERS_NOTE",
        ]).map((item) => ({
          label: Util.endorsementTypeToString(item),
          value: item,
        }))}
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
      />
    </div>
  );
}
