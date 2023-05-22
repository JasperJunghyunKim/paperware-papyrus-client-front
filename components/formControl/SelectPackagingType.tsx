import { Model } from "@/@shared";
import { Radio } from "antd";

interface Props {
  value?: Model.Enum.PackagingType;
  onChange?: (value: Model.Enum.PackagingType) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <Radio.Group
        value={props.value}
        onChange={(p) => props.onChange?.(p.target.value)}
        options={["ROLL", "SKID", "REAM", "BOX"].map((p) => ({
          value: p,
          label: p,
        }))}
        optionType="button"
        buttonStyle="solid"
        disabled={props.disabled}
      />
    </div>
  );
}
