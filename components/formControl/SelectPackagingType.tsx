import { Model } from "@/@shared";
import { Radio } from "antd";

interface Props {
  value?: Model.Enum.PackagingType | undefined;
  onChange?: (value: Model.Enum.PackagingType | undefined) => void;
  disabled?: boolean;
  showNone?: boolean;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <Radio.Group
        value={props.value === undefined ? "NONE" : props.value}
        onChange={(p) =>
          props.onChange?.(
            p.target.value === "NONE" ? undefined : p.target.value
          )
        }
        options={["NONE", "ROLL", "SKID", "REAM", "BOX"]
          .filter((p) => props.showNone || p !== null)
          .map((p) => ({
            value: p,
            label: p === "NONE" ? "미지정" : p,
          }))}
        optionType="button"
        buttonStyle="solid"
        disabled={props.disabled}
      />
    </div>
  );
}
