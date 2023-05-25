import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useEffect, useState } from "react";
import { TbMapPinFilled } from "react-icons/tb";

type RecordType = Model.ArrivalStockGroup;

export default function Component() {
  const [page, setPage] = usePage();
  const list = ApiHook.Stock.StockArrival.useGetList({
    query: page,
  });
  const [selected, setSelected] = useState<RecordType[]>([]);
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
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => `${record.id}`}
        selected={selected}
        onSelectedChange={setSelected}
        selection="single"
        columns={[
          {
            title: "작업 구분",
            render: (value: RecordType) => (
              <div>{value.orderStock ? "정상 매입" : ""}</div>
            ),
          },
          {
            title: "작업 번호",
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
            dataIndex: ["orderCompanyInfo", "businessName"],
          },
          {
            title: "도착 예정일",
            dataIndex: ["orderInfo", "wantedDate"],
            render: (value) => Util.formatIso8601ToLocalDate(value),
          },
          {
            title: "도착지",
            dataIndex: ["orderStock", "dstLocation", "name"],
          },
          ...Table.Preset.columnStockGroup<RecordType>(
            (p) => p, // TODO
            []
          ),
          ...Table.Preset.columnQuantity<RecordType>(
            (p) => p, // TODO
            ["nonStoringQuantity"],
            { prefix: "배정" }
          ),
          ...Table.Preset.columnQuantity<RecordType>(
            (p) => p, // TODO
            ["storingQuantity"],
            { prefix: "입고" }
          ),
          ...Table.Preset.columnQuantity<RecordType>(
            (p) => p, // TODO
            ["totalQuantity"],
            { prefix: "전체" }
          ),
        ]}
      />
      <Popup.Stock.ApplyArrival open={openApply} onClose={setOpenApply} />
    </Page>
  );
}
