import { Util } from "@/common";
import { InputNumber } from "antd";
import classNames from "classnames";
import { forwardRef } from "react";

interface Props {
  ref?: any;
  value?: number | null;
  onChange?: (value: number | null) => void;
  unit?: string;
  min?: number;
  max?: number;
  precision?: number;
  rootClassName?: string;
  disabled?: boolean;
}

export default forwardRef(function Component(props: Props, ref: any) {
  return (
    <InputNumber
      {...props}
      ref={ref}
      value={props.value}
      onChange={(x) => props.onChange?.(x ?? null)}
      formatter={(x, state) =>
        (state.userTyping
          ? x
          : Util.comma(x, props.precision ?? 0)
        )?.toString() ?? ""
      }
      precision={props.precision}
      min={props.min}
      max={props.max}
      rootClassName={classNames("w-full", props.rootClassName)}
      addonAfter={props.unit}
      disabled={props.disabled}
    />
  );
})
