import { Model } from "@/@shared";
import { Icon } from "..";
import { Util } from "@/common";
import { ColumnType } from "antd/lib/table/interface";

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
      title: "창고",
      dataIndex: [...path, "warehouse", "name"],
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
