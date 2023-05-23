import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useEffect, useState } from "react";
import { TbMapPinFilled } from "react-icons/tb";

export default function Component() {
  const [page, setPage] = usePage();
  const list = ApiHook.Stock.StockArrival.useGetList({
    query: page,
  });
  const [selected, setSelected] = useState<Model.StockEvent[]>([]);
  const only = Util.only(selected);

  const [openApply, setOpenApply] = useState<number | false>(false);

  useEffect(() => {
    if (list.data) {
      setSelected([]);
    }
  }, [list.data]);

  return (
    <Page title="도착 예정 목록">
      <StatBar.Container>
        <StatBar.Item
          icon={<TbMapPinFilled />}
          label="도착 예정 재고"
          value={"-"}
        />
      </StatBar.Container>
      <Toolbar.Container>
        <div className="flex-1" />
        <Toolbar.ButtonPreset.Continue
          label="재고 입고"
          disabled={!only}
          onClick={() => only && setOpenApply(only.id)}
        />
      </Toolbar.Container>
      <Table.Default<Model.StockEvent>
        data={list.data}
        page={page}
        setPage={setPage}
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
            title: "주문 번호",
            dataIndex: ["stock", "initialOrder", "orderNo"],
            render: (value, record) => (
              <div className="flex">
                <div className="font-fixed bg-sky-100 px-1 text-sky-800 rounded-md">
                  {value}
                </div>
              </div>
            ),
          },
          {
            title: "거래처",
            dataIndex: ["stock", "initialOrder", "dstCompany", "businessName"],
          },
          {
            title: "도착 예정일",
            dataIndex: ["stock", "initialOrder", "wantedDate"],
            render: (value) => Util.formatIso8601ToLocalDate(value),
          },
          {
            title: "도착지",
            dataIndex: [
              "stock",
              "initialOrder",
              "orderStock",
              "dstLocation",
              "name",
            ],
          },
          {
            title: "예정일",
          },
          ...Table.Preset.columnStockGroup<Model.StockEvent>(
            (p) => (p as any).stockGroup, // TODO
            ["stockGroup"]
          ),
          { title: "배정 수량" },
          { title: "" },
          { title: "배정 중량" },
          { title: "입고 수량" },
          { title: "" },
          { title: "입고 중량" },
          ...Table.Preset.columnQuantity<Model.StockEvent>(
            (p) => (p as any).stockGroup, // TODO
            ["change"],
            { prefix: "전체" }
          ),
        ]}
      />
      <Popup.Stock.ApplyArrival open={openApply} onClose={setOpenApply} />
    </Page>
  );
}
