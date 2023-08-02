import { Model } from "@/@shared";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";
import { TbMapPin, TbMapPinFilled } from "react-icons/tb";

type RecordType = Model.OfficialPriceCondition;
const PRICE_UNIT_OPTIONS = [
  {
    label: "/T",
    value: "WON_PER_TON" as Model.Enum.PriceUnit,
  },
  {
    label: "/BOX",
    value: "WON_PER_BOX" as Model.Enum.PriceUnit,
  },
  {
    label: "/R",
    value: "WON_PER_REAM" as Model.Enum.PriceUnit,
  },
];

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Inhouse.OfficialPrice.useGetList({ query: page });
  const [selected, setSelected] = useState<RecordType[]>([]);

  const only = Util.only(selected);

  const apiDelete = ApiHook.Inhouse.OfficialPrice.useDelete();
  const cmdDelete = useCallback(async () => {
    if (!only || !(await Util.confirm("선택한 고시가를 삭제하시겠습니까?")))
      return;

    await apiDelete.mutateAsync({
      id: only.id,
    });

    setSelected([]);
    list.refetch();
  }, [apiDelete, list, only]);

  return (
    <Page title="고시가 설정" menu={Const.Menu.SETTING_OFFICIAL_PRICE}>
      <StatBar.Container>
        <StatBar.Item
          icon={<TbMapPinFilled />}
          label="공개 고시가"
          value={"-"}
        />
        <StatBar.Item
          icon={<TbMapPin />}
          label="비공개 고시가"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="고시가 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="선택 고시가 상세"
            onClick={() => setOpenUpdate(only.id)}
          />
        )}
        {only && (
          <Toolbar.ButtonPreset.Delete
            label="선택 고시가 삭제"
            onClick={cmdDelete}
          />
        )}
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selection="single"
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          ...Table.Preset.columnStockGroup<RecordType>((record) => record, {
            excludePackaging: true,
          }),
          {
            title: "도가",
            dataIndex: ["wholesalesPrice", "officialPrice"],
            render: (value, record) => (
              <div className="font-fixed text-right whitespace-pre">
                {`${Util.comma(value)} 원${
                  PRICE_UNIT_OPTIONS.find(
                    (p) => p.value === record.wholesalesPrice.officialPriceUnit
                  )?.label
                }`.padEnd(5)}
              </div>
            ),
          },
          {
            title: "실가",
            dataIndex: ["retailPrice", "officialPrice"],
            render: (value, record) => (
              <div className="font-fixed text-right whitespace-pre">
                {`${Util.comma(value)} 원${
                  PRICE_UNIT_OPTIONS.find(
                    (p) => p.value === record.wholesalesPrice.officialPriceUnit
                  )?.label
                }`.padEnd(5)}
              </div>
            ),
          },
        ]}
      />
      <Popup.OfficialPrice.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.OfficialPrice.Update open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
