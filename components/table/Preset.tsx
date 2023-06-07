import { Model } from "@/@shared";
import { ApiHook, PaperUtil, Util } from "@/common";
import { Quantity } from "@/common/paperUtil";
import { ColumnType } from "antd/lib/table/interface";
import { Icon } from "..";
import { TbHome, TbHomeLink } from "react-icons/tb";
import classNames from "classnames";
import DiscountRate from "@/@shared/models/discount-rate";
import { useCallback } from "react";
import _ from "lodash";

export function columnStockGroup<T>(
  getStock: (record: T) =>
    | null
    | undefined
    | Model.StockGroup
    | Model.Stock
    | {
        product: Model.Product;
        packaging?: Model.Packaging;
        grammage: number;
        sizeX: number;
        sizeY: number;
        paperColorGroup: Model.PaperColorGroup | null;
        paperColor: Model.PaperColor | null;
        paperPattern: Model.PaperPattern | null;
        paperCert: Model.PaperCert | null;
      },
  options?: {
    excludePackaging?: boolean;
  }
): ColumnType<T>[] {
  return [
    ...(options?.excludePackaging
      ? []
      : [...columnPackagingType<T>((p) => getStock(p)?.packaging)]),
    {
      title: "제품 유형",
      render: (_value: any, record: T) =>
        getStock(record)?.product.paperDomain.name,
    },
    {
      title: "지군",
      render: (_value: any, record: T) =>
        getStock(record)?.product.paperGroup.name,
    },
    {
      title: "지종",
      render: (_value: any, record: T) =>
        getStock(record)?.product.paperType.name,
    },
    {
      title: "제지사",
      render: (_value: any, record: T) =>
        getStock(record)?.product.manufacturer.name,
    },
    {
      title: "평량",
      render: (_value: any, record: T) => (
        <div className="text-right font-fixed">{`${Util.comma(
          getStock(record)?.grammage
        )} ${Util.UNIT_GPM}`}</div>
      ),
    },
    {
      title: "규격",
      render: (_value: any, record: T) => (
        <div className="font-fixed">
          {
            Util.findPaperSize(
              getStock(record)?.sizeX ?? 1,
              getStock(record)?.sizeY ?? 1
            )?.name
          }
        </div>
      ),
    },
    {
      title: "지폭",
      render: (_value: any, record: T) => (
        <div className="text-right font-fixed">{`${Util.comma(
          getStock(record)?.sizeX
        )} mm`}</div>
      ),
    },
    {
      title: "지장",
      render: (_value: any, record: T) =>
        getStock(record)?.packaging?.type !== "ROLL" ? (
          <div className="text-right font-fixed">{`${Util.comma(
            getStock(record)?.sizeY
          )} mm`}</div>
        ) : null,
    },
    {
      title: "색군",
      render: (_value: any, record: T) =>
        getStock(record)?.paperColorGroup?.name,
    },
    {
      title: "색상",
      render: (_value: any, record: T) => getStock(record)?.paperColor?.name,
    },
    {
      title: "무늬",
      render: (_value: any, record: T) => getStock(record)?.paperPattern?.name,
    },
    {
      title: "인증",
      render: (_value: any, record: T) => getStock(record)?.paperCert?.name,
    },
  ];
}

export function columnStock<T>(
  getStock: (record: T) => Model.Stock,
  path: string[]
): ColumnType<T>[] {
  return [
    {
      title: "재고 번호",
      dataIndex: [...path, "serial"],
      render: (value) => <div className="font-fixed">{value}</div>,
    },
    {
      title: "제품 유형",
      dataIndex: [...path, "product", "paperDomain", "name"],
    },
    {
      title: "지군",
      dataIndex: [...path, "product", "paperGroup", "name"],
    },
    {
      title: "지종",
      dataIndex: [...path, "product", "paperType", "name"],
    },
    {
      title: "제지사",
      dataIndex: [...path, "product", "manufacturer", "name"],
    },
    ...columnPackagingType<T>((p: any) => p.packaging),
    {
      title: "평량",
      dataIndex: [...path, "grammage"],
      render: (value: number) => (
        <div className="text-right font-fixed">{`${Util.comma(value)} ${
          Util.UNIT_GPM
        }`}</div>
      ),
    },
    {
      title: "규격",
      render: (_value: any, record: T) => (
        <div className="text-right font-fixed">
          {
            Util.findPaperSize(getStock(record).sizeX, getStock(record).sizeY)
              ?.name
          }
        </div>
      ),
    },
    {
      title: "지폭",
      dataIndex: [...path, "sizeX"],
      render: (value: number) => (
        <div className="text-right font-fixed">{`${Util.comma(value)} mm`}</div>
      ),
    },
    {
      title: "지장",
      dataIndex: [...path, "sizeY"],
      render: (value: number, record: T) =>
        getStock(record)?.packaging.type !== "ROLL" ? (
          <div className="text-right font-fixed">{`${Util.comma(
            value
          )} mm`}</div>
        ) : null,
    },
    {
      title: "색군",
      dataIndex: [...path, "paperColorGroup", "name"],
    },
    {
      title: "색상",
      dataIndex: [...path, "paperColor", "name"],
    },
    {
      title: "무늬",
      dataIndex: [...path, "paperPattern", "name"],
    },
    {
      title: "인증",
      dataIndex: [...path, "paperCert", "name"],
    },
    {
      title: "고시가",
      dataIndex: [...path, "stockPrice", "price"],
      render: (value: number) => (
        <div className="text-right font-fixed">{`${Util.comma(value)} 원`}</div>
      ),
    },
    {
      title: "할인율",
      dataIndex: [...path, "stockPrice", "discountRate"],
      render: (value: number) => (
        <div className="text-right font-fixed">{`${Util.comma(value)} %`}</div>
      ),
    },
    {
      title: "단가",
      dataIndex: [...path, "stockPrice", "unitPrice"],
      render: (value: number) => (
        <div className="text-right font-fixed">{`${Util.comma(value)} 원`}</div>
      ),
    },
  ];
}

export function columnQuantity<T>(
  getStock: (record: T) => null | undefined | PaperUtil.QuantitySpec,
  path: string[],
  options?: {
    prefix?: string;
    negative?: boolean;
  }
): ColumnType<T>[] {
  const spec = (record: T): PaperUtil.QuantitySpec | null => {
    const stock = getStock(record);
    return stock
      ? {
          packaging: stock.packaging,
          grammage: stock.grammage,
          sizeX: stock.sizeX,
          sizeY: stock.sizeY,
        }
      : null;
  };

  const getQuantity = (value: number, record: T): PaperUtil.Quantity | null => {
    const stock = spec(record);
    return stock
      ? PaperUtil.convertQuantity(stock, (options?.negative ? -1 : 1) * value)
      : null;
  };

  const format =
    (type: "packed" | "unpacked" | "weight") => (quantity: Quantity | null) => {
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

  return [
    {
      title: `${options?.prefix ?? ""} 수량`.trim(),
      dataIndex: [...path],
      render: (value: number, record: T) => (
        <div className="text-right font-fixed whitespace-pre">
          {_.isFinite(value) && record
            ? format("packed")(getQuantity(value, record))
            : ""}
        </div>
      ),
    },
    {
      title: ``,
      dataIndex: [...path],
      render: (value: number, record: T) => (
        <div className="text-right font-fixed whitespace-pre">
          {_.isFinite(value) && record
            ? format("unpacked")(getQuantity(value, record))
            : ""}
        </div>
      ),
    },
    {
      title: `${options?.prefix ?? ""} 중량`.trim(),
      dataIndex: [...path],
      render: (value: number, record: T) => (
        <div className="text-right font-fixed whitespace-pre">
          {_.isFinite(value) && record
            ? format("weight")(getQuantity(value, record))
            : ""}
        </div>
      ),
    },
  ];
}

export function columnConnection<T>(path: string[]): ColumnType<T>[] {
  return [
    {
      title: "연결 거래처 여부",
      dataIndex: path,
      render: (value) => (
        <div
          className={classNames("flex flex-row gap-2", {
            "text-purple-800": value,
          })}
        >
          <div className="flex flex-col justify-center">
            {value ? (
              <TbHomeLink className="text-lg" />
            ) : (
              <TbHome className="text-lg" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            {value ? "비연결 거래처" : "연결 거래처"}
          </div>
        </div>
      ),
    },
  ];
}

export function useColumnPartner<T>(
  companyRegistrationNumberPath: string[],
  options?: {
    title?: string;
    fallback?: (record: T) => string;
  }
): ColumnType<T>[] {
  const partners = ApiHook.Partner.Partner.useGetList();

  return [
    {
      title: options?.title ?? "거래처",
      dataIndex: [...companyRegistrationNumberPath],
      render: (value: string, record: T) => {
        return (
          <div>
            {partners.data?.find((p) => p.companyRegistrationNumber == value)
              ?.partnerNickName ??
              options?.fallback?.(record) ??
              ""}
          </div>
        );
      },
    },
  ];
}

export function columnDiscountRate<T>(
  path: string[],
  options?: {
    prefix?: string;
  }
): ColumnType<T>[] {
  const unit = (value: DiscountRate) => {
    switch (value.discountRateUnit) {
      case "PERCENT":
        return "%";
      case "WON_PER_BOX":
        return "원/BOX";
      case "WON_PER_REAM":
        return "원/R";
      case "WON_PER_TON":
        return "원/T";
    }
  };
  return [
    {
      title: `${options?.prefix ?? ""} 할인율`.trim(),
      dataIndex: path,
      render: (value: DiscountRate) => (
        <div className={"flex flex-row gap-2 justify-end"}>
          <div className="flex text-right font-fixed">
            {Util.comma(
              value.discountRate,
              value.discountRateUnit === "PERCENT" ? 3 : 0
            )}{" "}
            {unit(value)}
          </div>
        </div>
      ),
    },
  ];
}

export function columnPackagingType<T>(
  getPackaging: (record: T) => Model.Packaging | null | undefined
): ColumnType<T>[] {
  return [
    {
      title: "포장",
      render: (_value: any, record: T) => {
        const value = getPackaging(record);
        return (
          <div className="font-fixed flex gap-x-1">
            <div className="flex-initial flex flex-col justify-center text-lg">
              <Icon.PackagingType packagingType={value?.type} />
            </div>
            <div className="flex-initial flex flex-col justify-center whitespace-pre">
              {value?.type.padEnd(4)}
            </div>
            {value?.type !== "SKID" && (
              <div className="flex-initial text-gray-400 mx-1">─</div>
            )}
            <div className="flex-initial flex flex-col justify-center text-gray-500">
              {value ? Util.formatPackaging(value, true) : ""}
            </div>
          </div>
        );
      },
    },
  ];
}
