import { Model } from "@/@shared";
import { PaperUtil, Util } from "@/common";
import _ from "lodash";

export interface StockBannerProps {
  spec: Model.StockGroup;
}

export default function Component(props: StockBannerProps) {
  const spec = (): PaperUtil.QuantitySpec | null => {
    const stock = props.spec;
    return stock
      ? {
          packaging: stock.packaging,
          grammage: stock.grammage,
          sizeX: stock.sizeX,
          sizeY: stock.sizeY,
        }
      : null;
  };

  const getQuantity = (value: number): PaperUtil.Quantity | null => {
    const stock = spec();
    return stock ? PaperUtil.convertQuantity(stock, value) : null;
  };

  const format =
    (type: "packed" | "unpacked" | "weight") =>
    (quantity: PaperUtil.Quantity | null) => {
      if (quantity === null) return null;

      switch (type) {
        case "packed":
          return quantity.packed
            ? `${Util.comma(
                quantity.packed.value,
                PaperUtil.recommendedPrecision(quantity.packed.unit)
              )} ${Util.padRightCJK(quantity.packed.unit, 3)}`
            : null;
        case "unpacked":
          return quantity.unpacked
            ? `${Util.comma(
                quantity.unpacked.value,
                PaperUtil.recommendedPrecision(quantity.unpacked.unit)
              )} ${Util.padRightCJK(quantity.unpacked.unit, 2)}`
            : null;
        case "weight":
          return _.isFinite(quantity.grams)
            ? `${Util.comma(
                quantity.grams * 0.000001,
                PaperUtil.recommendedPrecision("T")
              )} ${"T"}`
            : null;
      }
    };

  return (
    <div className="flex-initial flex gap-x-4 flex-wrap gap-y-4">
      <Item
        title="창고"
        value={
          props.spec.warehouse
            ? `${props.spec.warehouse?.name} (${
                props.spec.warehouse.isPublic ? "공개" : "비공개"
              })`
            : ""
        }
      />
      <div className="flex-initial basis-px bg-gray-200" />
      <Item
        title="포장"
        value={`${props.spec.packaging.type} ─ ${Util.formatPackaging(
          props.spec.packaging,
          true
        )}`}
      />

      <div className="flex-initial basis-px bg-gray-200" />
      <Item title="제품 유형" value={props.spec.product.paperDomain.name} />
      <Item title="지군" value={props.spec.product.paperGroup.name} />
      <Item title="지종" value={props.spec.product.paperType.name} />
      <Item title="제지사" value={props.spec.product.manufacturer.name} />
      <div className="flex-initial basis-px bg-gray-200" />
      <Item title="평량" value={`${props.spec.grammage} ${Util.UNIT_GPM}`} />
      <div className="flex-initial basis-px bg-gray-200" />
      <Item title="지폭" value={`${props.spec.sizeX} mm`} />
      {props.spec.packaging.type !== "ROLL" && (
        <Item title="지장" value={`${props.spec.sizeY} mm`} />
      )}
      <div className="flex-initial basis-px bg-gray-200" />
      <Item title="색군" value={props.spec.paperColorGroup?.name} />
      <Item title="색상" value={props.spec.paperColor?.name} />
      <Item title="무늬" value={props.spec.paperPattern?.name} />
      <Item title="인증" value={props.spec.paperCert?.name} />
      <div className="flex-initial basis-px bg-gray-200" />
      <Item
        title="가용 수량"
        value={`${
          _.isFinite(props.spec.availableQuantity)
            ? format("packed")(getQuantity(props.spec.availableQuantity ?? 0))
            : ""
        } ${
          props.spec.packaging.type !== "ROLL"
            ? ` (${
                _.isFinite(props.spec.availableQuantity)
                  ? format("unpacked")(
                      getQuantity(props.spec.availableQuantity ?? 0)
                    )
                  : ""
              })`
            : ""
        }`}
      />
      <Item
        title="가용 중량"
        value={
          _.isFinite(props.spec.availableQuantity)
            ? format("weight")(getQuantity(props.spec.availableQuantity ?? 0))
            : ""
        }
      />
      <div className="flex-initial basis-px bg-gray-200" />
      <Item
        title="실물 수량"
        value={`${
          _.isFinite(props.spec.totalQuantity)
            ? format("packed")(getQuantity(props.spec.totalQuantity ?? 0))
            : ""
        } ${
          props.spec.packaging.type !== "ROLL"
            ? ` (${
                _.isFinite(props.spec.totalQuantity)
                  ? format("unpacked")(
                      getQuantity(props.spec.totalQuantity ?? 0)
                    )
                  : ""
              })`
            : ""
        }`}
      />
      <Item
        title="실물 중량"
        value={
          _.isFinite(props.spec.totalQuantity)
            ? format("weight")(getQuantity(props.spec.totalQuantity ?? 0))
            : ""
        }
      />
    </div>
  );
}

interface ItemProps {
  title: string;
  value: string | null | undefined;
}

function Item(props: ItemProps) {
  return (
    <div className="flex-initial flex flex-col gap-y-1">
      <div className="flex-initial text-xs text-gray-400">{props.title}</div>
      <div className="flex-initial font-fixed">{props.value}</div>
    </div>
  );
}
