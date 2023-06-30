import { Model } from "@/@shared";
import { PaperUtil, Util } from "@/common";
import { ValueType } from "@rc-component/mini-decimal";
import { InputNumber } from "antd";
import _ from "lodash";
import { useCallback, useMemo } from "react";

interface Spec {
  grammage: number;
  sizeX: number;
  sizeY: number;
  packaging: Model.Packaging;
}

interface Props {
  spec: Spec;
  value?: number | null;
  onChange?: (value: number | null) => void;
  disabled?: boolean;
  onlyPositive?: boolean;
}

export default function Component(props: Props) {
  const unit = useMemo(() => {
    return {
      unit: Util.stockUnit(props.spec.packaging.type),
      precision: props.spec.packaging.type === "ROLL" ? 6 : 0,
    };
  }, [props.spec.packaging.type]);

  const convert = useMemo(
    () => _.curry(PaperUtil.convertQuantityWith)(props.spec),
    [props.spec]
  );

  const ntz = useCallback(
    (value: ValueType | null) => Util.nanToZero(_.toNumber(value)) ?? null,
    []
  );

  const change = useCallback(
    (unit: "매" | "R" | "BOX" | "g") => (value: number | null) => {
      const converted = convert(unit)(_.toNumber(value) ?? 0);
      const newValue =
        props.spec.packaging.type === "ROLL"
          ? converted?.grams
          : props.spec.packaging.type === "BOX"
          ? converted?.packed?.value
          : converted?.unpacked?.value;
      props.onChange?.(newValue ?? 0);
    },
    [props.spec]
  );

  return (
    <div className="flex gap-x-2">
      {props.spec.packaging.type === "ROLL" ? (
        <InputNumber
          addonAfter="m"
          rootClassName="flex-1"
          value={
            PaperUtil.convertQuantity(props.spec, props.value ?? 0)?.packed
              ?.value ?? 0
          }
          disabled
          precision={1}
          min={props.onlyPositive ? 0 : undefined}
        />
      ) : (
        <>
          <InputNumber
            addonAfter="매"
            rootClassName="flex-1"
            value={
              PaperUtil.convertQuantity(props.spec, props.value ?? 0)?.unpacked
                ?.value ?? 0
            }
            onChange={(p) => change("매")(p)}
            precision={0}
            disabled={props.disabled || props.spec.packaging.type === "BOX"}
            min={props.onlyPositive ? 0 : undefined}
          />
          <InputNumber
            addonAfter={props.spec.packaging.type === "BOX" ? "BOX" : "R"}
            rootClassName="flex-1"
            value={
              PaperUtil.convertQuantity(props.spec, props.value ?? 0)?.packed
                ?.value ?? 0
            }
            onChange={(p) =>
              change(props.spec.packaging.type === "BOX" ? "BOX" : "R")(p)
            }
            precision={props.spec.packaging.type === "BOX" ? 0 : 3}
            disabled={props.disabled}
            min={props.onlyPositive ? 0 : undefined}
          />
        </>
      )}
      <InputNumber
        addonAfter="T"
        rootClassName="flex-1"
        value={_.round(
          PaperUtil.convertQuantity(props.spec, props.value ?? 0)?.grams *
            0.000001,
          3
        )}
        onChange={(p) => change("g")((ntz(p) ?? 0) * 1000000)}
        disabled={props.disabled || props.spec.packaging.type !== "ROLL"}
        precision={3}
        min={props.onlyPositive ? 0 : undefined}
      />
    </div>
  );
}
