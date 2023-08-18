import { Api } from "@/@shared";
import { PaperUtil, Util } from "@/common";
import { QuantitySpec } from "@/common/paperUtil";
import { InputNumber, Radio } from "antd";
import _ from "lodash";
import { useCallback, useMemo } from "react";

interface Props {
  value?: Api.OrderStockTradeAltBundleUpdateRequest | null;
  onChange?: (value: Api.OrderStockTradeAltBundleUpdateRequest | null) => void;
  spec: {
    grammage: number;
  };
  rootClassName?: string;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const change = useCallback(
    (values: Partial<Api.OrderStockTradeAltBundleUpdateRequest>) => {
      props.onChange?.(
        props.value
          ? {
              ...props.value,
              ...values,
            }
          : null
      );
    },
    [props.onChange, props.value]
  );

  const spec: QuantitySpec | null = useMemo(
    () =>
      props.value
        ? props.value.altSizeY
          ? {
              grammage: props.spec.grammage,
              sizeX: props.value.altSizeX,
              sizeY: props.value.altSizeY,
              packaging: { type: "SKID", packA: 1, packB: 1 },
            }
          : {
              grammage: props.spec.grammage,
              sizeX: props.value.altSizeX,
              sizeY: props.value.altSizeY,
              packaging: { type: "ROLL", packA: 1, packB: 1 },
            }
        : null,
    [props.value, props.spec.grammage]
  );

  const convert = useMemo(
    () => (spec ? _.curry(PaperUtil.convertQuantityWith)(spec) : null),
    [spec]
  );

  const ntz = useCallback(
    (value: any) => Util.nanToZero(_.toNumber(value)) ?? null,
    []
  );

  const changeQ = useCallback(
    (unit: "매" | "R" | "BOX" | "g") => (value: number | null) => {
      const converted = convert?.(unit)(_.toNumber(value) ?? 0) ?? null;
      const newValue =
        spec?.packaging.type === "ROLL"
          ? converted?.grams
          : spec?.packaging.type === "BOX"
          ? converted?.packed?.value
          : converted?.unpacked?.value;
      change({ altQuantity: newValue ?? 0 });
    },
    [change, convert, spec?.packaging.type]
  );

  return (
    <div className="flex-initial flex flex-col gap-y-2 h-auto">
      <Radio.Group
        value={props.value ? true : false}
        optionType="button"
        buttonStyle="solid"
        onChange={(e) =>
          props.onChange?.(
            e.target.value
              ? {
                  altSizeX: 0,
                  altSizeY: 0,
                  altQuantity: 0,
                }
              : null
          )
        }
        disabled={props.disabled}
        options={[
          {
            label: "대체 적용 안함",
            value: false,
          },
          {
            label: "단가 대체 적용",
            value: true,
          },
        ]}
        rootClassName="flex-initial"
      />
      {props.value && (
        <div className="flex-initial flex flex-col gap-y-2">
          <div className="flex-initial flex gap-x-2">
            <InputNumber
              value={props.value.altSizeX}
              onChange={(x) =>
                change({
                  altSizeX: x ?? undefined,
                })
              }
              precision={0}
              min={0}
              max={9999}
              addonAfter={"mm"}
              disabled={props.disabled}
            />
            <InputNumber
              value={props.value.altSizeY}
              onChange={(x) =>
                change({
                  altSizeY: x ?? undefined,
                })
              }
              precision={0}
              min={0}
              max={9999}
              addonAfter={"mm"}
              disabled={props.disabled}
            />
          </div>
          <div className="flex-initial flex gap-x-2">
            {/* {!!(
              props.value &&
              props.value.altSizeX &&
              !props.value.altSizeY
            ) && (
              <InputNumber
                value={props.value?.altQuantity}
                onChange={(x) =>
                  change({
                    altQuantity: x ?? undefined,
                  })
                }
                precision={3}
                addonAfter={"T"}
                disabled={props.disabled}
                rootClassName="flex-1"
              />
            )}
            {!!(
              props.value &&
              props.value.altSizeX &&
              props.value.altSizeY
            ) && (
              <InputNumber
                value={props.value?.altQuantity}
                onChange={(x) =>
                  change({
                    altQuantity: x ?? undefined,
                  })
                }
                precision={0}
                addonAfter={"매"}
                disabled={props.disabled}
                rootClassName="flex-1"
              />
            )} */}
            {/*  */}
            {spec && (
              <>
                {spec.packaging.type === "ROLL" ? (
                  <InputNumber
                    addonAfter="m"
                    rootClassName="flex-1"
                    value={
                      PaperUtil.convertQuantity(
                        spec,
                        props.value.altQuantity ?? 0
                      )?.packed?.value ?? 0
                    }
                    disabled
                    precision={1}
                  />
                ) : (
                  <>
                    <InputNumber
                      addonAfter="매"
                      rootClassName="flex-1"
                      value={
                        PaperUtil.convertQuantity(
                          spec,
                          props.value.altQuantity ?? 0
                        )?.unpacked?.value ?? 0
                      }
                      onChange={(p) => changeQ("매")(p)}
                      precision={0}
                      disabled={props.disabled || spec.packaging.type === "BOX"}
                    />
                    <InputNumber
                      addonAfter={spec.packaging.type === "BOX" ? "BOX" : "R"}
                      rootClassName="flex-1"
                      value={
                        PaperUtil.convertQuantity(
                          spec,
                          props.value.altQuantity ?? 0
                        )?.packed?.value ?? 0
                      }
                      onChange={(p) =>
                        changeQ(spec.packaging.type === "BOX" ? "BOX" : "R")(p)
                      }
                      precision={spec.packaging.type === "BOX" ? 0 : 3}
                      disabled={props.disabled}
                    />
                  </>
                )}
                <InputNumber
                  addonAfter="T"
                  rootClassName="flex-1"
                  value={_.round(
                    PaperUtil.convertQuantity(
                      spec,
                      props.value.altQuantity ?? 0
                    )?.grams * 0.000001,
                    3
                  )}
                  onChange={(p) => changeQ("g")((ntz(p) ?? 0) * 1000000)}
                  disabled={props.disabled || spec.packaging.type !== "ROLL"}
                  precision={3}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
