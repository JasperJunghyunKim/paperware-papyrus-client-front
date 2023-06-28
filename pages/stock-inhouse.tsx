import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useEffect, useState } from "react";
import { TbMapPin, TbMapPinFilled } from "react-icons/tb";

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
            title: "#",
            dataIndex: "id",
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )}`}</div>
            ),
          },
          {
            title: "거래처",
            dataIndex: ["initialOrder", "dstCompany", "businessName"],
          },
          {
            title: "재고 번호",
            dataIndex: "serial",
            render: (value, record) => (
              <div className="flex">
                <div className="flex font-fixed bg-yellow-100 px-1 text-yellow-800 rounded-md border border-solid border-yellow-300">
                  {Util.formatSerial(value)}
                </div>
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
