import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useState } from "react";
import { TbMapPin, TbMapPinFilled } from "react-icons/tb";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);

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
    },
  });
  const [selected, setSelected] = useState<Model.Stock[]>([]);

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
        <div className="flex-1" />
      </Toolbar.Container>
      <Table.Default<Model.StockGroup>
        data={groupList.data}
        keySelector={(record) =>
          `${record.product.id} ${record.sizeX} ${record.sizeY} ${
            record.grammage
          } ${record.paperColorGroup?.id ?? "_"} ${
            record.paperColor?.id ?? "_"
          } ${record.paperPattern?.id ?? "_"} ${record.paperCert?.id ?? "_"} ${
            record.warehouse?.id ?? "_"
          }`
        }
        selected={selectedGroup}
        onSelectedChange={setSelectedGroup}
        selection="single"
        columns={[
          {
            title: "거래처",
            dataIndex: ["orderCompanyInfo", "businessName"],
          },
          {
            title: "도착지",
            dataIndex: ["orderStock", "dstLocation", "name"],
          },
          {
            title: "예정일",
            dataIndex: ["orderInfo", "wantedDate"],
            render: (value) => (
              <div className="font-fixed">
                {Util.formatIso8601ToLocalDate(value)}
              </div>
            ),
          },
          {
            title: "창고",
            dataIndex: ["warehouse", "name"],
          },
          ...Table.Preset.columnStockGroup<Model.StockGroup>(
            (record) => record,
            []
          ),
          ...Table.Preset.columnQuantity<Model.StockGroup>(
            (record) => record,
            ["totalQuantity"],
            { prefix: "실물" }
          ),
          ...Table.Preset.columnQuantity<Model.StockGroup>(
            (record) => record,
            ["availableQuantity"],
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
                <div className="flex font-fixed bg-yellow-100 px-1 text-yellow-800 rounded-md">
                  {value}
                </div>
              </div>
            ),
          },
          ...Table.Preset.columnQuantity<Model.Stock>(
            (record) => record,
            ["cachedQuantity"],
            { prefix: "실물" }
          ),
          ...Table.Preset.columnQuantity<Model.Stock>(
            (record) => record,
            ["cachedQuantityAvailable"],
            { prefix: "가용" }
          ),
        ]}
      />
      <Popup.Stock.Create open={openCreate} onClose={setOpenCreate} />
    </Page>
  );
}
