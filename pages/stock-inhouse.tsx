import { Model } from "@/@shared";
import { ApiHook, PriceUtil, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import classNames from "classnames";
import { useEffect, useState } from "react";
import {
  TbCheck,
  TbCircleCheckFilled,
  TbEyeCheck,
  TbMapPin,
  TbMapPinFilled,
  TbRefresh,
} from "react-icons/tb";
import { match } from "ts-pattern";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateArrival, setOpenCreateArrival] = useState(false);
  const [openModify, setOpenModify] = useState<number | false>(false);

  const [groupPage, setGroupPage] = usePage();
  const groupList = ApiHook.Stock.StockInhouse.useGetGroupList({
    query: groupPage,
  });
  const [selectedGroup, setSelectedGroup] = useState<Model.StockGroup[]>([]);

  const onlyGroup = Util.only(selectedGroup);
  const [page, setPage] = usePage();
  const list = ApiHook.Stock.StockInhouse.useGetList({
    query: {
      productId: onlyGroup?.product.id,
      packagingId: onlyGroup?.packaging?.id,
      sizeX: onlyGroup?.sizeX,
      sizeY: onlyGroup?.sizeY,
      grammage: onlyGroup?.grammage,
      paperColorGroupId: onlyGroup?.paperColorGroup?.id,
      paperColorId: onlyGroup?.paperColor?.id,
      paperPatternId: onlyGroup?.paperPattern?.id,
      paperCertId: onlyGroup?.paperCert?.id,
      warehouseId: onlyGroup?.warehouse?.id,
      planId: onlyGroup?.plan?.id,
    },
  });
  const [selected, setSelected] = useState<Model.Stock[]>([]);
  const only = Util.only(selected);

  useEffect(() => {
    setSelected([]);
  }, [selectedGroup]);

  return (
    <Page title="자사 재고 관리">
      <StatBar.Container>
        <StatBar.Item icon={<TbMapPinFilled />} label="자사 재고" value={"-"} />
        <StatBar.Item
          icon={<TbMapPin />}
          label="보관 재고"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="자사 재고 추가"
          onClick={() => setOpenCreate(true)}
        />
        <Toolbar.ButtonPreset.Create
          label="예정 재고 추가"
          onClick={() => setOpenCreateArrival(true)}
        />
        <div className="flex-1" />
        <Toolbar.ButtonPreset.Update
          label="재고 수량 수정"
          onClick={() => only && setOpenModify(only.id)}
          disabled={!only}
        />
      </Toolbar.Container>
      <Table.Default<Model.StockGroup>
        data={groupList.data}
        keySelector={(record) => Util.keyOfStockGroup(record)}
        selected={selectedGroup}
        onSelectedChange={setSelectedGroup}
        selection="single"
        columns={[
          {
            title: "거래처",
            dataIndex: [
              "plan",
              "orderStock",
              "order",
              "partnerCompany",
              "businessName",
            ],
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
          ...Table.Preset.columnStockGroup<Model.StockGroup>(
            (record) => record
          ),
          ...Table.Preset.columnQuantity<Model.StockGroup>(
            (record) => record,
            (record) => (record.warehouse ? record.totalQuantity : 0),
            { prefix: "실물" }
          ),
          ...Table.Preset.columnQuantity<Model.StockGroup>(
            (record) => record,
            (record) =>
              record.warehouse
                ? record.availableQuantity
                : record.storingQuantity,
            { prefix: "가용" }
          ),
        ]}
      />
      <Table.Default<Model.Stock>
        data={list.data}
        page={groupPage}
        setPage={setGroupPage}
        keySelector={(record) => `${record.id}`}
        selected={selected}
        onSelectedChange={setSelected}
        selection="single"
        columns={[
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
              <div>
                {match(record.initialPlan.type)
                  .with("INHOUSE_CREATE", () => "신규 등록")
                  .with("INHOUSE_MODIFY", () => "재고 수정")
                  .with("INHOUSE_PROCESS", () => "재부 재단")
                  .with("INHOUSE_RELOCATION", () => "재고 이고")
                  .with("INHOUSE_STOCK_QUANTITY_CHANGE", () => "재고 증감")
                  .with("TRADE_NORMAL_BUYER", () => "정상 매입")
                  .with("TRADE_NORMAL_SELLER", () => "정상 매출")
                  .with("TRADE_OUTSOURCE_PROCESS_BUYER", () => "외주 재단 매입")
                  .with(
                    "TRADE_OUTSOURCE_PROCESS_SELLER",
                    () => "외주 재단 매출"
                  )
                  .with("TRADE_WITHDRAW_BUYER", () => "보관 입고")
                  .with("TRADE_WITHDRAW_SELLER", () => "보관 출고")
                  .otherwise(() => "")}
              </div>
            ),
          },
          {
            title: "고시가",
            render: (_, record) =>
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
              record.stockPrice.officialPriceType !== "NONE" && (
                <div className="flex items-center gap-x-2">
                  <div
                    className={classNames(
                      "flex-initial rounded text-white px-1",
                      {
                        "bg-gray-500":
                          record.stockPrice.discountType === "NONE",
                        "bg-blue-500":
                          record.stockPrice.discountType !== "NONE",
                      }
                    )}
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
            render: (_, record) => (
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
            render: (_, record) => (
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
          {
            title: "공개 여부",
            render: (_, record) =>
              record.warehouse?.isPublic && (
                <div className="flex items-center gap-x-1">
                  <TbEyeCheck className="text-xl" />
                  공개
                </div>
              ),
          },
          ...Table.Preset.columnQuantity<Model.Stock>(
            (record) => record,
            (record) => record.cachedQuantity,
            { prefix: "실물" }
          ),
          ...Table.Preset.columnQuantity<Model.Stock>(
            (record) => record,
            (record) => record.cachedQuantityAvailable,
            { prefix: "가용" }
          ),
        ]}
      />
      <Popup.Stock.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.Stock.Create
        open={openCreateArrival}
        onClose={setOpenCreateArrival}
        arrival
      />
      <Popup.Stock.Modify open={openModify} onClose={setOpenModify} />
    </Page>
  );
}
