import { Model } from "@/@shared";
import { Util } from "@/common";
import { InputNumber } from "antd";
import { useMemo } from "react";

interface Props {
  value?: number | null;
  onChange?: (value: number | null) => void;
  grammage: number;
  sizeX: number;
  sizeY: number;
  packaging: Model.Packaging;
}

export default function Component(props: Props) {
  const unit = useMemo(() => {
    return {
      unit: Util.priceUnit(props.packaging.type),
      format: Util.formatPriceUnit(props.packaging.type),
    };
  }, [props.packaging.type]);

  return (
    <div className="flex gap-x-2">
      <InputNumber
        value={props.value}
        onChange={(x) => props.onChange?.(x)}
        formatter={(x, state) =>
          (state.userTyping ? x : Util.comma(x))?.toString() ?? ""
        }
        precision={0}
        min={0}
        rootClassName="w-full"
        addonAfter={unit.format}
      />
      {props.packaging.type !== "ROLL" && (
        <InputNumber
          value={Util.toWeightPrice(Number(props.value), unit.unit, "wpt", {
            grammage: props.grammage,
            sizeX: props.sizeX,
            sizeY: props.sizeY,
            packaging: props.packaging,
          })}
          formatter={(x, state) =>
            (state.userTyping ? x : Util.comma(x))?.toString() ?? ""
          }
          disabled
          rootClassName="w-full"
          addonAfter={"원/T"}
        />
      )}
    </div>
  );
}
