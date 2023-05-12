import { Api, Model } from "@/@shared";
import { PriceUtil } from "@/common";
import { Select } from "antd";
import { useCallback, useMemo } from "react";
import { Number } from ".";

const OFFICIAL_PRICE_TYPE_OPTIONS = [
  {
    label: "고시가 미지정",
    value: "NONE" as Model.Enum.OfficialPriceType,
  },
  {
    label: "고시가",
    value: "MANUAL_NONE" as Model.Enum.OfficialPriceType,
  },
  {
    label: "고시가 × 할인율",
    value: "MANUAL_DEFAULT" as Model.Enum.OfficialPriceType,
  },
];
const PRICE_UNIT_OPTIONS = [
  {
    label: "/T",
    value: "WON_PER_TON" as Model.Enum.PriceUnit,
  },
  {
    label: "/BOX",
    value: "WON_PER_BOX" as Model.Enum.PriceUnit,
  },
  {
    label: "/R",
    value: "WON_PER_REAM" as Model.Enum.PriceUnit,
  },
];
const DISCOUNT_TYPE_OPTIONS = [
  {
    label: "기본 할인율",
    value: "DEFAULT" as Model.Enum.DiscountType,
  },
  {
    label: "특가 할인율",
    value: "SPECIAL" as Model.Enum.DiscountType,
  },
];

interface Props {
  spec: PriceUtil.Spec;
  value?: Api.StockCreateStockPriceRequest;
  onChange?: (value: Api.StockCreateStockPriceRequest) => void;
}

export default function Component(props: Props) {
  const unitOptions = useMemo(() => {
    switch (props.spec.packaging.type) {
      case "ROLL":
        return PRICE_UNIT_OPTIONS.filter(
          (option) => option.value === "WON_PER_TON"
        );
      case "BOX":
        return PRICE_UNIT_OPTIONS.filter(
          (option) => option.value === "WON_PER_BOX"
        );
      default:
        return PRICE_UNIT_OPTIONS.filter(
          (option) => option.value !== "WON_PER_BOX"
        );
    }
  }, [props.spec.packaging.type]);

  const calcDiscount = useCallback(
    (p: {
      officialPrice: number;
      officialPriceUnit: Model.Enum.PriceUnit;
      unitPrice: number;
      unitPriceUnit: Model.Enum.PriceUnit;
    }) => {
      const srcUnit = p.unitPriceUnit;
      const dstUnit = p.officialPriceUnit;
      const tempPrice = PriceUtil.convertPrice({
        srcUnit,
        dstUnit,
        origPrice: p.unitPrice ?? 0,
        spec: props.spec,
      });
      return (1 - tempPrice / p.officialPrice) * 100;
    },
    [props.spec]
  );

  const calcUnitPrice = useCallback(
    (p: {
      officialPrice: number;
      officialPriceUnit: Model.Enum.PriceUnit;
      discountPrice: number;
      unitPriceUnit: Model.Enum.PriceUnit;
    }) => {
      const srcUnit = p.officialPriceUnit;
      const dstUnit = p.unitPriceUnit;
      const tempPrice = PriceUtil.convertPrice({
        srcUnit,
        dstUnit,
        origPrice: p.officialPrice ?? 0,
        spec: props.spec,
      });
      return tempPrice * (1 - p.discountPrice / 100);
    },
    [props.spec]
  );

  const changeOfficialPrice = useCallback(
    (
      type: Model.Enum.OfficialPriceType,
      value: number,
      unit: Model.Enum.PriceUnit
    ) => {
      const isDiscount = type == "MANUAL_DEFAULT";

      const newDiscountValue = isDiscount
        ? props.value?.discountPrice ?? 0
        : calcDiscount({
            officialPrice: value,
            officialPriceUnit: unit,
            unitPrice: props.value?.unitPrice ?? 0,
            unitPriceUnit: props.value?.unitPriceUnit ?? "WON_PER_TON",
          });

      const newUnitPrice = isDiscount
        ? calcUnitPrice({
            officialPrice: value,
            officialPriceUnit: unit,
            discountPrice: props.value?.discountPrice ?? 0,
            unitPriceUnit: props.value?.unitPriceUnit ?? "WON_PER_TON",
          })
        : props.value?.unitPrice ?? 0;

      const newValue: Api.StockCreateStockPriceRequest = {
        officialPriceType: type,
        officialPrice: value,
        officialPriceUnit: unit,
        discountType: props.value?.discountType ?? "DEFAULT",
        discountPrice: newDiscountValue,
        unitPrice: newUnitPrice,
        unitPriceUnit: props.value?.unitPriceUnit ?? "WON_PER_TON",
      };

      props.onChange?.(newValue);
    },
    [props]
  );
  const changeDiscount = useCallback(
    (type: Model.Enum.DiscountType, value: number) => {
      const isDiscount = props.value?.officialPriceType == "MANUAL_DEFAULT";

      const newUnitPrice = isDiscount
        ? calcUnitPrice({
            officialPrice: props.value?.officialPrice ?? 0,
            officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
            discountPrice: value,
            unitPriceUnit: props.value?.unitPriceUnit ?? "WON_PER_TON",
          })
        : props.value?.unitPrice ?? 0;

      const newValue: Api.StockCreateStockPriceRequest = {
        officialPriceType: props.value?.officialPriceType ?? "NONE",
        officialPrice: props.value?.officialPrice ?? 0,
        officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
        discountType: type,
        discountPrice: value,
        unitPrice: newUnitPrice,
        unitPriceUnit: props.value?.unitPriceUnit ?? "WON_PER_TON",
      };
      props.onChange?.(newValue);
    },
    [props]
  );
  const changeUnitPrice = useCallback(
    (value: number, unit: Model.Enum.PriceUnit) => {
      const isDiscount = props.value?.officialPriceType == "MANUAL_DEFAULT";

      const newDiscountValue = isDiscount
        ? props.value?.discountPrice ?? 0
        : calcDiscount({
            officialPrice: props.value?.officialPrice ?? 0,
            officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
            unitPrice: value,
            unitPriceUnit: unit,
          });

      const newUnitPrice = isDiscount
        ? calcUnitPrice({
            officialPrice: props.value?.officialPrice ?? 0,
            officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
            discountPrice: props.value?.discountPrice ?? 0,
            unitPriceUnit: unit,
          })
        : value;

      const newValue: Api.StockCreateStockPriceRequest = {
        officialPriceType: props.value?.officialPriceType ?? "NONE",
        officialPrice: props.value?.officialPrice ?? 0,
        officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
        discountType: props.value?.discountType ?? "DEFAULT",
        discountPrice: newDiscountValue,
        unitPrice: newUnitPrice,
        unitPriceUnit: unit,
      };
      props.onChange?.(newValue);
    },
    [props]
  );

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <Select
          value={props.value?.officialPriceType}
          onChange={(value) =>
            changeOfficialPrice(
              value,
              props.value?.officialPrice ?? 0,
              "WON_PER_TON"
            )
          }
          options={OFFICIAL_PRICE_TYPE_OPTIONS}
          rootClassName="flex-1"
        />
        <Number
          value={props.value?.officialPrice}
          onChange={(p) =>
            changeOfficialPrice(
              props.value?.officialPriceType ?? "NONE",
              p ?? 0,
              props.value?.officialPriceUnit ?? "WON_PER_TON"
            )
          }
          min={0}
          max={9999999999}
          precision={0}
          unit="원"
          rootClassName="flex-1"
          disabled={props.value?.officialPriceType === "NONE"}
        />
        <Select
          value={props.value?.officialPriceUnit}
          onChange={(value) =>
            changeOfficialPrice(
              props.value?.officialPriceType ?? "NONE",
              props.value?.officialPrice ?? 0,
              value
            )
          }
          options={unitOptions}
          rootClassName="flex-1"
          disabled={props.value?.officialPriceType === "NONE"}
        />
      </div>
      <div className="flex gap-x-2">
        <Select
          value={props.value?.discountType}
          onChange={(value) =>
            changeDiscount(value, props.value?.discountPrice ?? 0)
          }
          options={DISCOUNT_TYPE_OPTIONS}
          rootClassName="flex-1"
          disabled={props.value?.officialPriceType !== "MANUAL_DEFAULT"}
        />
        <Number
          value={props.value?.discountPrice}
          onChange={(p) =>
            changeDiscount(props.value?.discountType ?? "DEFAULT", p ?? 0)
          }
          precision={3}
          unit="%"
          rootClassName="flex-[2_0_8px]"
          disabled={props.value?.officialPriceType !== "MANUAL_DEFAULT"}
        />
      </div>
      <div className="flex gap-x-2">
        <Number
          value={props.value?.unitPrice}
          onChange={(p) =>
            changeUnitPrice(p ?? 0, props.value?.unitPriceUnit ?? "WON_PER_TON")
          }
          min={0}
          max={9999999999}
          precision={0}
          unit="원"
          rootClassName="flex-[2_0_8px]"
          disabled={props.value?.officialPriceType === "MANUAL_DEFAULT"}
        />
        <Select
          value={props.value?.unitPriceUnit}
          onChange={(value) =>
            changeUnitPrice(props.value?.unitPrice ?? 0, value)
          }
          options={unitOptions}
          rootClassName="flex-1"
        />
      </div>
    </div>
  );
}
