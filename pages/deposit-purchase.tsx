import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useState } from "react";
import { TbMapPin, TbMapPinFilled } from "react-icons/tb";

type RecordType = Model.Deposit;

export default function Component() {
  const [openCreate, setOpenCreate] = useState<"PURCHASE" | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Trade.Deposit.useGetList({
    query: {
      ...page,
      type: "PURCHASE",
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);

  const only = Util.only(selected);

  return (
    <Page title="매입 보관량 조회">
      <StatBar.Container>
        <StatBar.Item
          icon={<TbMapPinFilled />}
          label="공개 도착지"
          value={"-"}
        />
        <StatBar.Item
          icon={<TbMapPin />}
          label="비공개 도착지"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="보관량 등록"
          onClick={() => setOpenCreate("PURCHASE")}
        />
        <div className="flex-1" />
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "회사명",
            dataIndex: "partnerNickName",
          },
          ...Table.Preset.columnStockGroup<RecordType>((record) => record, []),
          ...Table.Preset.columnQuantity<RecordType>(
            (record) => record,
            ["quantity"]
          ),
        ]}
      />
      <Popup.Deposit.Create open={openCreate} onClose={setOpenCreate} />
    </Page>
  );
}
