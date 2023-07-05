import { Model } from "@/@shared";
import DiscountRate from "@/@shared/models/discount-rate";
import { ApiHook, PaperUtil, PriceUtil, Util } from "@/common";
import { Quantity } from "@/common/paperUtil";
import { ColumnType } from "antd/lib/table/interface";
import classNames from "classnames";
import _ from "lodash";
import { TbHome, TbHomeLink, TbRefresh } from "react-icons/tb";
import { Icon } from "..";
import { match } from "ts-pattern";

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
        sizeX: number | null;
        sizeY: number | null;
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
      render: (_value: any, record: T) =>
        getStock(record) && (
          <div className="text-right font-fixed">{`${Util.comma(
            getStock(record)?.grammage
          )} ${Util.UNIT_GPM}`}</div>
        ),
    },
    {
      title: "규격",
      render: (_value: any, record: T) =>
        getStock(record) && (
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
      render: (_value: any, record: T) =>
        getStock(record) &&
        getStock(record)?.sizeX && (
          <div className="text-right font-fixed">{`${Util.comma(
            getStock(record)?.sizeX
          )} mm`}</div>
        ),
    },
    {
      title: "지장",
      render: (_value: any, record: T) =>
        getStock(record) &&
        getStock(record)?.packaging?.type !== "ROLL" &&
        getStock(record)?.sizeY ? (
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

export function columnQuantity<T>(
  getStock: (record: T) => null | undefined | PaperUtil.QuantitySpec,
  getValue: (record: T) => null | undefined | number,
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
      render: (_value: any, record: T) => (
        <div className="text-right font-fixed whitespace-pre">
          {_.isFinite(getValue(record)) && record
            ? format("packed")(getQuantity(getValue(record) ?? 0, record))
            : ""}
        </div>
      ),
    },
    {
      title: ``,
      render: (_value: any, record: T) => (
        <div className="text-right font-fixed whitespace-pre">
          {_.isFinite(getValue(record)) && record
            ? format("unpacked")(getQuantity(getValue(record) ?? 0, record))
            : ""}
        </div>
      ),
    },
    {
      title: `${options?.prefix ?? ""} 중량`.trim(),
      render: (_value: any, record: T) => (
        <div className="text-right font-fixed whitespace-pre">
          {_.isFinite(getValue(record)) && record
            ? format("weight")(getQuantity(getValue(record) ?? 0, record))
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
          value && (
            <div className="font-fixed flex gap-x-1">
              <div className="flex-initial flex flex-col justify-center text-lg">
                <Icon.PackagingType packagingType={value.type} />
              </div>
              <div className="flex-initial flex flex-col justify-center whitespace-pre">
                {value.type.padEnd(4)}
              </div>
              {value?.type !== "SKID" && (
                <div className="flex-initial text-gray-400 mx-1">─</div>
              )}
              <div className="flex-initial flex flex-col justify-center text-gray-500">
                {Util.formatPackaging(value, true)}
              </div>
            </div>
          )
        );
      },
    },
  ];
}

export function columnStock<T extends Model.Stock>(): ColumnType<T>[] {
  return [
    {
      title: "거래처",
      dataIndex: ["initialOrder", "dstCompany", "businessName"],
    },
    {
      title: "금액 동기화",
      render: (_, record) =>
        record.isSyncPrice && (
          <div className="flex items-center text-green-600 gap-x-1">
            <TbRefresh />
            금액 동기화
          </div>
        ),
    },
    {
      title: "재고 번호",
      dataIndex: "serial",
      render: (value) => (
        <div className="flex">
          <div className="flex font-fixed bg-yellow-100 px-1 text-yellow-800 rounded-md border border-solid border-yellow-300">
            {Util.formatSerial(value)}
          </div>
        </div>
      ),
    },
    {
      title: "작업 구분",
      render: (_, record) => (
        <div>{Util.formatPlanType(record.initialPlan.type)}</div>
      ),
    },
    {
      title: "고시가",
      render: (_, record) =>
        record.stockPrice &&
        record.stockPrice.officialPriceType !== "NONE" && (
          <div className="flex items-center gap-x-2">
            <div className="flex-initial rounded text-white px-1 bg-blue-500">
              {Util.formatOfficialPriceType(
                record.stockPrice.officialPriceType
              )}
            </div>
            <div className="flex-1 font-fixed text-right whitespace-pre">
              {`${Util.comma(
                record.stockPrice.officialPrice
              )} ${Util.formatPriceUnit(
                record.stockPrice.officialPriceUnit
              ).padEnd(6)}`}
            </div>
          </div>
        ),
    },
    {
      title: "할인율",
      render: (_, record) =>
        record.stockPrice &&
        record.stockPrice.officialPriceType !== "NONE" && (
          <div className="flex items-center gap-x-2">
            <div
              className={classNames("flex-initial rounded text-white px-1", {
                "bg-gray-500": record.stockPrice.discountType === "NONE",
                "bg-blue-500": record.stockPrice.discountType !== "NONE",
              })}
            >
              {Util.formatDiscountType(record.stockPrice.discountType)}
            </div>
            <div className="flex-1 font-fixed text-right whitespace-pre">
              {`${Util.comma(
                record.stockPrice.discountType === "MANUAL_NONE"
                  ? record.stockPrice.discountPrice
                  : (1 -
                      PriceUtil.convertPrice({
                        srcUnit: record.stockPrice.unitPriceUnit,
                        dstUnit: record.stockPrice.officialPriceUnit,
                        origPrice: record.stockPrice.unitPrice,
                        spec: record,
                      }) /
                        record.stockPrice.officialPrice) *
                      100
              )} %`}
            </div>
          </div>
        ),
    },
    {
      title: "단가",
      render: (_, record) =>
        record.stockPrice && (
          <div className="font-fixed text-right">
            {`${Util.comma(
              record.stockPrice.discountType === "NONE"
                ? record.stockPrice.unitPrice
                : PriceUtil.convertPrice({
                    srcUnit: record.stockPrice.officialPriceUnit,
                    dstUnit: record.stockPrice.unitPriceUnit,
                    origPrice: record.stockPrice.officialPrice,
                    spec: record,
                  }) *
                    (1 - record.stockPrice.discountPrice / 100)
            )} ${Util.formatPriceUnit(record.stockPrice.unitPriceUnit)}`}
          </div>
        ),
    },
    {
      title: "공급가",
      render: (_, record) =>
        record.stockPrice && (
          <div className="font-fixed text-right">
            {`${Util.comma(
              PriceUtil.calcSupplyPrice({
                spec: record,
                price: record.stockPrice,
                quantity: record.cachedQuantity,
              })
            )} 원`}
          </div>
        ),
    },
    ...columnQuantity<T>(
      (record) => record,
      (record) => record.cachedQuantity,
      { prefix: "실물" }
    ),
  ];
}

export function stockGroup<T extends Model.StockGroup>(): ColumnType<T>[] {
  const partners = ApiHook.Inhouse.Partner.useGetList({ query: {} });

  return [
    {
      title: "거래처",
      dataIndex: [
        "plan",
        "orderStock",
        "order",
        "partnerCompany",
        "businessName",
      ],
      render: (_, record) =>
        partners.data?.items.find(
          (p) =>
            p.companyRegistrationNumber ===
            record.plan?.orderStock?.order.partnerCompany
              .companyRegistrationNumber
        )?.partnerNickName ??
        record.plan?.orderStock?.order.partnerCompany.businessName,
    },
    {
      title: "도착지",
      render: (_, record) =>
        record.plan?.orderStock?.dstLocation.name ??
        record.plan?.planShipping?.dstLocation.name,
    },
    {
      title: "예정일",
      render: (_, record) => (
        <div className="font-fixed">
          {Util.formatIso8601ToLocalDate(
            record.plan?.orderStock?.wantedDate ??
              record.plan?.planShipping?.wantedDate ??
              null
          )}
        </div>
      ),
    },
    {
      title: "창고",
      dataIndex: ["warehouse", "name"],
    },
    ...columnStockGroup<T>((record) => record),
    ...columnQuantity<T>(
      (record) => record,
      (record) =>
        record.warehouse ? record.availableQuantity : record.storingQuantity,
      { prefix: "가용" }
    ),
    ...columnQuantity<T>(
      (record) => record,
      (record) => (record.warehouse ? record.totalQuantity : 0),
      { prefix: "실물" }
    ),
  ];
}
