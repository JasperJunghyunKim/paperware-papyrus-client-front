import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table } from "@/components";
import { Page } from "@/components/layout";
import { useState } from "react";
import { TbMapPinFilled } from "react-icons/tb";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);

  const [groupPage, setGroupPage] = usePage();
  const groupList = ApiHook.Stock.PartnerStock.useGetList({
    query: groupPage,
  });
  const [selectedGroup, setSelectedGroup] = useState<Model.StockGroup[]>([]);

  return (
    <Page title="매입처 재고 조회">
      <StatBar.Container>
        <StatBar.Item icon={<TbMapPinFilled />} label="매입처" value={"-"} />
      </StatBar.Container>
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
        page={groupPage}
        setPage={setGroupPage}
        columns={[
          {
            title: "매입처",
            dataIndex: ["warehouse", "company", "businessName"],
          },
          {
            title: "창고",
            dataIndex: ["warehouse", "name"],
          },
          {
            title: "창고 주소",
            dataIndex: ["warehouse", "address"],
            render: (value) => (
              <div className="flex flex-col">{Util.formatAddress(value)}</div>
            ),
          },

          ...Table.Preset.columnStockGroup<Model.StockGroup>(
            (record) => record
          ),
          ...Table.Preset.columnQuantity<Model.StockGroup>(
            (record) => record,
            (record) => record.totalQuantity,
            { prefix: "실물" }
          ),
          ...Table.Preset.columnQuantity<Model.StockGroup>(
            (record) => record,
            (record) => record.availableQuantity,
            { prefix: "가용" }
          ),
        ]}
      />
      <Popup.Stock.Create open={openCreate} onClose={setOpenCreate} />
    </Page>
  );
}
