import { Model } from "@/@shared";
import { Util } from "@/common";
import { InputNumber } from "antd";
import { useMemo } from "react";

interface Props {
  value?: number | null;
  onChange?: (value: number | null) => void;
  packaging: Model.Packaging;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const unit = useMemo(() => {
    return {
      unit: Util.stockUnit(props.packaging.type),
      precision: props.packaging.type === "ROLL" ? 6 : 0,
    };
  }, [props.packaging.type]);

  return (
    <div className="flex gap-x-2">
      <InputNumber
        value={
          props.packaging.type === "ROLL"
            ? Util.gramsToTon(props.value ?? 0)
            : props.value
        }
        onChange={(x) =>
          props.onChange?.(
            props.packaging.type === "ROLL" ? Util.tonToGrams(x ?? 0) : x
          )
        }
        formatter={(x, state) => {
          return !x
            ? ""
            : (state.userTyping
                ? x
                : Util.comma(x, unit.precision)
              )?.toString() ?? "";
        }}
        precision={unit.precision}
        min={0}
        rootClassName="w-full"
        addonAfter={unit.unit}
        disabled={props.disabled}
      />
    </div>
  );
}
