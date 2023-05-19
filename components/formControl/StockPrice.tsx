import { Api, Model } from "@/@shared";
import { ApiHook, PriceUtil } from "@/common";
import { Select } from "antd";
import { useCallback, useMemo } from "react";
import { Number } from ".";

const OFFICIAL_PRICE_TYPE_OPTIONS = [
  {
    label: "고시가 미지정",
    value: "NONE" as Model.Enum.OfficialPriceType,
  },
  {
    label: "직접 입력",
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
    label: "할인 없음",
    value: "NONE" as Model.Enum.DiscountType,
  },
  {
    label: "직접 입력",
    value: "MANUAL_NONE" as Model.Enum.DiscountType,
  },
  {
    label: "기본 할인율",
    value: "DEFAULT" as Model.Enum.DiscountType,
  },
  {
    label: "특가 할인율",
    value: "SPECIAL" as Model.Enum.DiscountType,
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
  paperColorGroupId?: number | null;
  paperColorId?: number | null;
  paperPatternId?: number | null;
  paperCertId?: number | null;
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
      const typeChanged = props.value?.officialPriceType !== type;
      const isDiscount = !typeChanged && type == "MANUAL_NONE";

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
          ? ("NONE" as any)
          : props.value?.discountType ?? "DEFAULT",
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
      const isDiscount = type === ("MANUAL" as any);

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
      const isDiscount = props.value?.discountType === ("MANUAL" as any);

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

  const apiDiscountMapping = ApiHook.Inhouse.Discount.useGetMapping({
    query: {
      companyRegistrationNumber:
        props.discountSpec?.companyRegistrationNumber ?? "",
      discountRateType: props.discountSpec?.discountRateType,
      paperDomainId: product?.paperDomain.id,
      paperGroupId: product?.paperGroup.id,
      paperTypeId: product?.paperType.id,
      manufacturerId: product?.manufacturer.id,
      packagingType: props.spec.packaging.type,
      grammage: props.spec.grammage,
      sizeX: props.spec.sizeX,
      sizeY: props.spec.sizeY,
      paperColorGroupId: props.discountSpec?.paperColorGroupId ?? undefined,
      paperColorId: props.discountSpec?.paperColorId ?? undefined,
      paperPatternId: props.discountSpec?.paperPatternId ?? undefined,
      paperCertId: props.discountSpec?.paperCertId ?? undefined,
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
    return options;
  }, []);

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
          rootClassName="flex-1"
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
          rootClassName="flex-1"
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
          rootClassName="flex-1"
          disabled={
            props.disabled || props.value?.officialPriceType !== "MANUAL_NONE"
          }
        />
      </div>
      <div className="flex gap-x-2">
        <Select
          value={props.value?.discountType}
          onChange={(value) =>
            changeDiscount(value, props.value?.discountPrice ?? 0)
          }
          options={discountTypeOptions}
          rootClassName="flex-1"
          disabled={
            props.disabled ||
            (props.value?.officialPriceType !== "MANUAL_NONE" &&
              props.value?.officialPriceType !== "RETAIL" &&
              props.value?.officialPriceType !== "WHOLESALE")
          }
        />
        <Number
          value={props.value?.discountPrice}
          onChange={(p) =>
            changeDiscount(props.value?.discountType ?? "DEFAULT", p ?? 0)
          }
          precision={3}
          unit="%"
          rootClassName="flex-[2_0_8px]"
          disabled={
            props.disabled || props.value?.discountType !== ("MANUAL" as any)
          }
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
          disabled={
            props.disabled ||
            (props.value?.officialPriceType !== "NONE" &&
              props.value?.discountType !== ("NONE" as any))
          }
        />
        <Select
          value={props.value?.unitPriceUnit}
          onChange={(value) =>
            changeUnitPrice(props.value?.unitPrice ?? 0, value)
          }
          options={unitOptions}
          rootClassName="flex-1"
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}
