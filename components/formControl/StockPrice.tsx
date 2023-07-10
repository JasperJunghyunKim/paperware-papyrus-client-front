import { Api, Model } from "@/@shared";
import { ApiHook, PriceUtil, Util } from "@/common";
import { Select } from "antd";
import classNames from "classnames";
import { useCallback, useMemo, useState } from "react";
import { TbSearch } from "react-icons/tb";
import { Number } from ".";
import { Popup } from "..";

const OFFICIAL_PRICE_TYPE_OPTIONS = [
  {
    label: "고시가 미지정",
    value: "NONE" as Model.Enum.OfficialPriceType,
  },
  {
    label: "고시가 입력",
    value: "MANUAL_NONE" as Model.Enum.OfficialPriceType,
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
    label: "단가 지정",
    value: "NONE" as Model.Enum.DiscountType,
  },
  {
    label: "할인율 지정",
    value: "MANUAL_NONE" as Model.Enum.DiscountType,
  },
  {
    label: (
      <div className="flex gap-x-2">
        <div className="flex-initial flex flex-col justify-center">
          <TbSearch />
        </div>
        <div className="flex-initial flex flex-col justify-center">
          프리셋 적용
        </div>
      </div>
    ),
    value: "CUSTOM",
  },
];

interface OfficialPriceSpec {
  productId: number;
  paperColorGroupId?: number | null;
  paperColorId?: number | null;
  paperPatternId?: number | null;
  paperCertId?: number | null;
}

interface DiscountSpec {
  productId: number;
  paperColorGroupId?: number;
  paperColorId?: number;
  paperPatternId?: number;
  paperCertId?: number;
  companyRegistrationNumber: string;
  discountRateType: "PURCHASE" | "SALES";
}

interface Props {
  spec: PriceUtil.Spec;
  officialSpec?: OfficialPriceSpec;
  discountSpec?: DiscountSpec;
  value?: Api.StockCreateStockPriceRequest;
  onChange?: (value: Api.StockCreateStockPriceRequest) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const [openFinder, setOpenFinder] = useState<boolean>(false);

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
      return p.officialPrice == 0 ? 0 : (1 - tempPrice / p.officialPrice) * 100;
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
      if (
        props.value?.discountType === "DEFAULT" ||
        props.value?.discountType === "SPECIAL"
      ) {
        props.onChange?.({
          officialPriceType: type,
          officialPrice: value,
          officialPriceUnit: unit,
          discountType: "NONE",
          discountPrice: 0,
          unitPrice: 0,
          unitPriceUnit: unit,
        });
        return;
      }

      const typeChanged = props.value?.officialPriceType !== type;
      const isDiscount =
        !typeChanged && props.value?.discountType === "MANUAL_NONE";

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
        discountType: typeChanged
          ? "NONE"
          : props.value?.discountType ?? "DEFAULT",
        discountPrice: newDiscountValue,
        unitPrice: newUnitPrice,
        unitPriceUnit: props.value?.unitPriceUnit ?? "WON_PER_TON",
      };

      props.onChange?.(newValue);
    },
    [props, calcDiscount, calcUnitPrice]
  );
  const changeDiscount = useCallback(
    (type: Model.Enum.DiscountType, value: number, skip?: boolean) => {
      const isDiscount = type === "MANUAL_NONE";

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
        discountPrice: skip ? props.value?.discountPrice ?? 0 : value,
        unitPrice: newUnitPrice,
        unitPriceUnit: props.value?.unitPriceUnit ?? "WON_PER_TON",
      };

      props.onChange?.(newValue);
    },
    [props, calcUnitPrice]
  );
  const changeUnitPrice = useCallback(
    (value: number, unit: Model.Enum.PriceUnit, skip?: boolean) => {
      const isDiscount = props.value?.discountType === "MANUAL_NONE";

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
        discountPrice: skip
          ? props.value?.discountPrice ?? 0
          : newDiscountValue,
        unitPrice: newUnitPrice,
        unitPriceUnit: unit,
      };
      props.onChange?.(newValue);
    },
    [props, calcDiscount, calcUnitPrice]
  );

  const changeByMapping = useCallback(
    (
      value: number,
      unit: Model.Enum.DiscountRateUnit,
      type: Model.Enum.DiscountRateMapType
    ) => {
      const discountType = type === "BASIC" ? "DEFAULT" : "SPECIAL";

      if (unit === "PERCENT") {
        const newUnitPriceValue = calcUnitPrice({
          officialPrice: props.value?.officialPrice ?? 0,
          officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
          discountPrice: value,
          unitPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
        });

        props.onChange?.({
          officialPriceType: props.value?.officialPriceType ?? "NONE",
          officialPrice: props.value?.officialPrice ?? 0,
          officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",

          discountPrice: value,
          discountType,

          unitPrice: newUnitPriceValue,
          unitPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
        });
      } else {
        const newDiscountValue = calcDiscount({
          officialPrice: props.value?.officialPrice ?? 0,
          officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",
          unitPrice: value,
          unitPriceUnit: unit,
        });

        props.onChange?.({
          officialPriceType: props.value?.officialPriceType ?? "NONE",
          officialPrice: props.value?.officialPrice ?? 0,
          officialPriceUnit: props.value?.officialPriceUnit ?? "WON_PER_TON",

          discountPrice: newDiscountValue,
          discountType,

          unitPrice: value,
          unitPriceUnit: unit,
        });
      }
    },
    [props, calcUnitPrice, calcDiscount]
  );

  const metadata = ApiHook.Static.PaperMetadata.useGetAll();
  const product = metadata.data?.products.find(
    (p) => p.id === props.discountSpec?.productId
  );

  const apiOfficialMapping = ApiHook.Inhouse.OfficialPrice.useGetMappingList({
    query: {
      productId: props.officialSpec?.productId,
      grammage: props.spec.grammage,
      sizeX: props.spec.sizeX,
      sizeY: props.spec.sizeY,
      paperColorGroupId: props.officialSpec?.paperColorGroupId ?? undefined,
      paperColorId: props.officialSpec?.paperColorId ?? undefined,
      paperPatternId: props.officialSpec?.paperPatternId ?? undefined,
      paperCertId: props.officialSpec?.paperCertId ?? undefined,
    },
  });

  const officialPriceTypeOptions = useMemo(() => {
    const options = [...OFFICIAL_PRICE_TYPE_OPTIONS];
    apiOfficialMapping.data
      ?.filter((p) => unitOptions.some((q) => q.value === p.officialPriceUnit))
      .forEach((item) => {
        switch (item.officialPriceMapType) {
          case "WHOLESALE":
            options.push({
              label: "도가",
              value: "WHOLESALE",
            });
            break;
          case "RETAIL":
            options.push({
              label: "실가",
              value: "RETAIL",
            });
            break;
        }
      });
    return options;
  }, [apiOfficialMapping.data, unitOptions]);

  const discountTypeOptions = useMemo(() => {
    const options = [...DISCOUNT_TYPE_OPTIONS];
    return options.filter((p) => p.value !== "CUSTOM" || props.discountSpec);
  }, [props.discountSpec]);

  const findOfficialPrice = useCallback(
    (type: Model.Enum.OfficialPriceType) => {
      const mapping = apiOfficialMapping.data?.find(
        (item) =>
          item.officialPriceMapType === type &&
          unitOptions.some((p) => p.value === item.officialPriceUnit)
      );

      const price = mapping?.officialPrice ?? props.value?.officialPrice ?? 0;
      const unit =
        mapping?.officialPriceUnit ??
        props.value?.officialPriceUnit ??
        "WON_PER_TON";

      return {
        price,
        unit,
      };
    },
    [
      apiOfficialMapping.data,
      unitOptions,
      props.value?.officialPrice,
      props.value?.officialPriceUnit,
    ]
  );

  const discountProduct = metadata.data?.products.find(
    (p) => p.id === props.discountSpec?.productId
  );

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex gap-x-2">
        <Select
          value={props.value?.officialPriceType}
          onChange={(value) =>
            changeOfficialPrice(
              value,
              findOfficialPrice(value).price,
              findOfficialPrice(value).unit
            )
          }
          options={officialPriceTypeOptions}
          rootClassName="flex-[1_0_0px]"
          disabled={props.disabled}
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
          rootClassName="flex-[1_0_0px]"
          disabled={
            props.disabled || props.value?.officialPriceType !== "MANUAL_NONE"
          }
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
          rootClassName="flex-[1_0_0px]"
          disabled={
            props.disabled || props.value?.officialPriceType !== "MANUAL_NONE"
          }
        />
      </div>
      <div className="flex gap-x-2">
        <Select
          value={
            props.value &&
            (Util.inc<Model.Enum.DiscountType | "CUSTOM">(
              props.value.discountType,
              "NONE",
              "MANUAL_NONE"
            )
              ? props.value?.discountType
              : "CUSTOM")
          }
          onSelect={(value) =>
            value === "NONE" || value === "MANUAL_NONE"
              ? changeDiscount(value, props.value?.discountPrice ?? 0)
              : setOpenFinder(true)
          }
          options={discountTypeOptions}
          rootClassName="flex-[1_0_0px] w-0"
          disabled={
            props.disabled ||
            (props.value?.officialPriceType !== "MANUAL_NONE" &&
              props.value?.officialPriceType !== "RETAIL" &&
              props.value?.officialPriceType !== "WHOLESALE")
          }
        />
        <Number
          value={Util.nanToZero(props.value?.discountPrice)}
          onChange={(p) =>
            changeDiscount(props.value?.discountType ?? "DEFAULT", p ?? 0)
          }
          precision={3}
          unit={
            <div
              className={classNames({
                "font-bold text-blue-800":
                  props.value?.discountType === "DEFAULT",
                "font-bold text-amber-800":
                  props.value?.discountType === "SPECIAL",
              })}
            >
              {`% ${
                props.value?.discountType === "DEFAULT"
                  ? "기본"
                  : props.value?.discountType === "SPECIAL"
                  ? "특가"
                  : ""
              }`.trim()}
            </div>
          }
          rootClassName="flex-[2_0_8px] w-0"
          disabled={
            props.disabled || props.value?.discountType !== "MANUAL_NONE"
          }
        />
      </div>
      <div className="flex gap-x-2">
        <Number
          value={Util.nanToZero(props.value?.unitPrice)}
          onChange={(p) =>
            changeUnitPrice(p ?? 0, props.value?.unitPriceUnit ?? "WON_PER_TON")
          }
          min={0}
          max={9999999999}
          precision={0}
          unit="원"
          rootClassName="flex-[2_0_8px]"
          disabled={
            props.disabled ||
            (props.value?.officialPriceType !== "NONE" &&
              props.value?.discountType !== "NONE")
          }
        />
        <Select
          value={props.value?.unitPriceUnit}
          onChange={(value) =>
            changeUnitPrice(props.value?.unitPrice ?? 0, value)
          }
          options={unitOptions}
          rootClassName="flex-[1_0_0px]"
          disabled={props.disabled}
        />
      </div>
      {props.discountSpec && (
        <Popup.DiscountFinder.default
          open={
            openFinder && props.discountSpec
              ? {
                  companyRegistrationNumber:
                    props.discountSpec.companyRegistrationNumber,
                  discountRateType: props.discountSpec.discountRateType,
                  paperDomainId: discountProduct?.paperDomain.id,
                  paperGroupId: discountProduct?.paperGroup.id,
                  paperTypeId: discountProduct?.paperType.id,
                  manufacturerId: discountProduct?.manufacturer.id,
                  grammage: props.spec.grammage,
                  sizeX: props.spec.sizeX,
                  sizeY: props.spec.sizeY,
                  packagingType: props.spec.packaging.type,
                  paperColorGroupId:
                    props.officialSpec?.paperColorGroupId ?? undefined,
                  paperColorId: props.officialSpec?.paperColorId ?? undefined,
                  paperPatternId:
                    props.officialSpec?.paperPatternId ?? undefined,
                  paperCertId: props.officialSpec?.paperCertId ?? undefined,
                }
              : false
          }
          onClose={setOpenFinder}
          onSelect={(value) => {
            changeByMapping(
              value.discountRate,
              value.discountRateUnit,
              value.discountRateMapType
            );
            setOpenFinder(false);
          }}
          type={props.discountSpec.discountRateType}
        />
      )}
    </div>
  );
}
