import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";
import { TbMapPin, TbMapPinFilled } from "react-icons/tb";

export default function Component() {
  const [page, setPage] = usePage();
  const list = ApiHook.Stock.StockArrival.useGetList({
    query: page,
  });
  const [selected, setSelected] = useState<Model.StockEvent[]>([]);
  const only = Util.only(selected);

  const apiApply = ApiHook.Stock.StockArrival.useApply();
  const cmdApply = useCallback(async () => {
    if (!only) return;
    if (!(await Util.confirm("선택한 재고를 입고하시겠습니까?"))) {
      return;
    }

    await apiApply.mutateAsync({
      stockEventId: only.id,
    });

    setSelected([]);
  }, [apiApply, only]);

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
        <div className="flex-1" />
        <Toolbar.ButtonPreset.Continue
          label="재고 입고"
          disabled={!only}
          onClick={cmdApply}
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
          ...Table.Preset.columnStock<Model.StockEvent>(
            (p) => p.stock,
            ["stock"]
          ),
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
    </Page>
  );
}
