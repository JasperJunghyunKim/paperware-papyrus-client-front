import { Model } from "@/@shared";
import { PaperUtil, Util } from "@/common";
import { Quantity } from "@/common/paperUtil";
import { ColumnType } from "antd/lib/table/interface";
import { Icon } from "..";
import { TbHome, TbHomeLink } from "react-icons/tb";
import classNames from "classnames";

export function columnStockGroup<T>(
  getStock: (
    record: T
  ) =>
    | Model.StockGroupBase
    | Model.OrderStockBase
    | Model.PartnerStockGroup
    | Model.StockGroup,
  path: string[]
): ColumnType<T>[] {
  return [
    {
      title: "포장",
      dataIndex: [...path, "packaging", "type"],
      render: (value: Model.Enum.PackagingType, record: T) => (
        <div className="font-fixed flex gap-x-1">
          <div className="flex-initial flex flex-col justify-center text-lg">
            <Icon.PackagingType
              packagingType={getStock(record).packaging.type}
            />
          </div>
          <div className="flex-initial flex flex-col justify-center">
            {value}
          </div>
        </div>
      ),
    },
    {
      title: "제품 유형",
      dataIndex: [...path, "product", "paperDomain", "name"],
    },
    {
      title: "제지사",
      dataIndex: [...path, "product", "manufacturer", "name"],
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
      title: "평량",
      dataIndex: [...path, "grammage"],
      render: (value: number) => (
        <div className="text-right font-fixed">{`${Util.comma(value)} ${
          Util.UNIT_GPM
        }`}</div>
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
        getStock(record).packaging.type !== "ROLL" ? (
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
      title: "제지사",
      dataIndex: [...path, "product", "manufacturer", "name"],
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
      title: "포장",
      dataIndex: [...path, "packaging", "type"],
      render: (value: Model.Enum.PackagingType, record: T) => (
        <div className="font-fixed flex gap-x-1">
          <div className="flex-initial flex flex-col justify-center text-lg">
            <Icon.PackagingType
              packagingType={getStock(record).packaging.type}
            />
          </div>
          <div className="flex-initial flex flex-col justify-center">
            {value}
          </div>
        </div>
      ),
    },
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
        getStock(record).packaging.type !== "ROLL" ? (
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
  getStock: (record: T) => PaperUtil.QuantitySpec,
  path: string[],
  options?: {
    prefix?: string;
    negative?: boolean;
  }
): ColumnType<T>[] {
  const spec = (record: T): PaperUtil.QuantitySpec => {
    const stock = getStock(record);
    return {
      packaging: stock.packaging,
      grammage: stock.grammage,
      sizeX: stock.sizeX,
      sizeY: stock.sizeY,
    };
  };

  const getQuantity = (value: number, record: T): PaperUtil.Quantity => {
    const stock = spec(record);
    return PaperUtil.convertQuantity(
      stock,
      (options?.negative ? -1 : 1) * value
    );
  };

  const format = (
    quantity: Quantity,
    type: "packed" | "unpacked" | "weight"
  ) => {
    switch (type) {
      case "packed":
        return quantity.packed
          ? `${Util.comma(
              quantity.packed.value,
              PaperUtil.recommendedPrecision(quantity.packed.unit)
            )} ${quantity.packed.unit}`
          : null;
      case "unpacked":
        return quantity.unpacked
          ? `${Util.comma(
              quantity.unpacked.value,
              PaperUtil.recommendedPrecision(quantity.unpacked.unit)
            )} ${quantity.unpacked.unit}`
          : null;
      case "weight":
        return quantity.grams
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
          {format(getQuantity(value, record), "packed")}
        </div>
      ),
    },
    {
      title: ``,
      dataIndex: [...path],
      render: (value: number, record: T) => (
        <div className="text-right font-fixed whitespace-pre">
          {format(getQuantity(value, record), "unpacked")}
        </div>
      ),
    },
    {
      title: `${options?.prefix ?? ""} 중량`.trim(),
      dataIndex: [...path],
      render: (value: number, record: T) => (
        <div className="text-right font-fixed whitespace-pre">
          {format(getQuantity(value, record), "weight")}
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
