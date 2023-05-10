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
            title: "창고",
            dataIndex: ["warehouse", "name"],
          },
          {
            title: "제품 유형",
            dataIndex: ["product", "paperDomain", "name"],
          },
          {
            title: "제지사",
            dataIndex: ["product", "manufacturer", "name"],
          },
          {
            title: "지군",
            dataIndex: ["product", "paperGroup", "name"],
          },
          {
            title: "지종",
            dataIndex: ["product", "paperType", "name"],
          },
          {
            title: "포장",
            dataIndex: ["packaging", "type"],
            render: (value, record) => (
              <div className="font-fixed flex gap-x-1">
                <div className="flex-initial flex flex-col justify-center text-lg">
                  <Icon.PackagingType packagingType={record.packaging.type} />
                </div>
                <div className="flex-initial flex flex-col justify-center">
                  {value}
                </div>
              </div>
            ),
          },
          {
            title: "평량",
            dataIndex: "grammage",
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(value)} ${
                Util.UNIT_GPM
              }`}</div>
            ),
          },
          {
            title: "지폭",
            dataIndex: "sizeX",
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )} mm`}</div>
            ),
          },
          {
            title: "지장",
            dataIndex: "sizeY",
            render: (value, record) =>
              record.packaging.type !== "ROLL" ? (
                <div className="text-right font-fixed">{`${Util.comma(
                  value
                )} mm`}</div>
              ) : null,
          },
          {
            title: "색군",
            dataIndex: ["paperColorGroup", "name"],
          },
          {
            title: "색상",
            dataIndex: ["paperColor", "name"],
          },
          {
            title: "무늬",
            dataIndex: ["paperPattern", "name"],
          },
          {
            title: "인증",
            dataIndex: ["paperCert", "name"],
          },
          {
            title: "실물 수량",
            dataIndex: "totalQuantity",
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )}`}</div>
            ),
          },
          {
            title: "가용 수량",
            dataIndex: "availableQuantity",
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )}`}</div>
            ),
          },
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
          {
            title: "실물 수량",
            dataIndex: "totalQuantity",
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )}`}</div>
            ),
          },
          {
            title: "가용 수량",
            dataIndex: "availableQuantity",
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )}`}</div>
            ),
          },
        ]}
      />
      <Popup.Stock.Create open={openCreate} onClose={setOpenCreate} />
    </Page>
  );
}
