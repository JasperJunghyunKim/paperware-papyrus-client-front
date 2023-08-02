import { Model } from "@/@shared";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Search, StatBar, Table } from "@/components";
import { Page } from "@/components/layout";
import { useState } from "react";
import { TbMapPinFilled } from "react-icons/tb";

type RecordType = Model.StockGroup & {
  partnerCompanyRegistrationNumber: string;
};

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);

  const [search, setSearch] = useState<any>({});
  const [groupPage, setGroupPage] = usePage();
  const groupList = ApiHook.Stock.PartnerStock.useGetList({
    query: { ...groupPage, ...search },
  });
  const [selectedGroup, setSelectedGroup] = useState<RecordType[]>([]);

  return (
    <Page title="매입처 재고 조회" menu={Const.Menu.STOCK_PARTNER}>
      <StatBar.Container>
        <StatBar.Item icon={<TbMapPinFilled />} label="매입처" value={"-"} />
      </StatBar.Container>
      <Search
        items={[
          {
            type: "select-company-purchase",
            field: "companyId",
            label: "거래처",
          },
          {
            type: "select-packaging",
            field: "packagingIds",
            label: "포장",
          },
          {
            type: "select-papertype",
            field: "paperTypeIds",
            label: "지종",
          },
          {
            type: "select-manufacturer",
            field: "manufacturerIds",
            label: "제지사",
          },
          {
            type: "range",
            field: "grammage",
            label: "평량",
          },
          {
            type: "number",
            field: "sizeX",
            label: "지폭",
          },
          {
            type: "number",
            field: "sizeY",
            label: "지장",
          },
        ]}
        value={search}
        onSearch={setSearch}
      />
      <Table.Default<RecordType>
        data={groupList.data}
        keySelector={(record: RecordType) =>
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
        page={groupPage}
        setPage={setGroupPage}
        columns={[
          ...Table.Preset.useColumnPartner2<RecordType>({
            title: "매입처",
            getValue: (record: RecordType) =>
              record.partnerCompanyRegistrationNumber,
          }),
          {
            title: "창고",
            dataIndex: ["warehouse", "name"],
          },
          ...Table.Preset.columnStockGroup<RecordType>((record) => record),
          {
            title: "손실율",
            render: (record: RecordType) =>
              record.lossRate ? (
                <div className="font-fixed">
                  {Util.comma(record.lossRate ?? 0, 2)} %
                </div>
              ) : null,
          },
          ...Table.Preset.columnQuantity<RecordType>(
            (record) => record,
            (record) => record.availableQuantity,
            { prefix: "가용" }
          ),
          ...Table.Preset.columnQuantity<RecordType>(
            (record) => record,
            (record) => record.totalQuantity,
            { prefix: "실물" }
          ),
        ]}
      />
      <Popup.Stock.Create open={openCreate} onClose={setOpenCreate} />
    </Page>
  );
}
