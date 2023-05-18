import { Api } from "@/@shared";
import { InputNumber, Radio } from "antd";
import { useCallback } from "react";

interface Props {
  value?: Api.OrderStockTradeAltBundleUpdateRequest | null;
  onChange?: (value: Api.OrderStockTradeAltBundleUpdateRequest | null) => void;
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
          {!!(props.value && props.value.altSizeX && !props.value.altSizeY) && (
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
            />
          )}
          {!!(props.value && props.value.altSizeX && props.value.altSizeY) && (
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
            />
          )}
        </div>
      )}
    </div>
  );
}
