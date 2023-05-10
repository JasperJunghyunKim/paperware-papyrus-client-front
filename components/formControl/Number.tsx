import { Util } from "@/common";
import { InputNumber } from "antd";
import classNames from "classnames";

interface Props {
  value?: number | null;
  onChange?: (value: number | null) => void;
  unit?: string;
  min?: number;
  max?: number;
  pricision?: number;
  rootClassName?: string;
  disabled?: boolean;
}

export default function Component(props: Props) {
  return (
    <InputNumber
      value={props.value}
      onChange={(x) => props.onChange?.(x ?? null)}
      formatter={(x, state) =>
        (state.userTyping ? x : Util.comma(x))?.toString() ?? ""
      }
      precision={props.pricision}
      min={props.min}
      max={props.max}
      rootClassName={classNames("w-full", props.rootClassName)}
      addonAfter={props.unit}
      disabled={props.disabled}
    />
  );
}
