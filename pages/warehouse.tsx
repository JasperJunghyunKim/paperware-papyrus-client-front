import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";
import { TbHome, TbHomeShield } from "react-icons/tb";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Inhouse.Warehouse.useGetList({ query: page });
  const [selected, setSelected] = useState<Record.Warehouse[]>([]);

  const only = Util.only(selected);

  const apiDelete = ApiHook.Inhouse.Warehouse.useDelete();
  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`선택한 창고(${only.name})를 삭제하시겠습니까?`))
    ) {
      return;
    }

    await apiDelete.mutateAsync(only.id);
  }, [apiDelete, only]);

  return (
    <Page title="창고 설정">
      <StatBar.Container>
        <StatBar.Item icon={<TbHome />} label="공개 창고" value={"-"} />
        <StatBar.Item
          icon={<TbHomeShield />}
          label="비공개 창고"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="창고 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="선택 창고 상세"
            onClick={() => setOpenUpdate(only.id)}
          />
        )}
        {only && (
          <Toolbar.ButtonPreset.Delete
            label="선택 창고 삭제"
            onClick={async () => await cmdDelete()}
          />
        )}
      </Toolbar.Container>
      <Table.Default<Record.Warehouse>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "창고 이름",
            dataIndex: "name",
          },
          {
            title: "창고 코드",
            dataIndex: "code",
            render: (value) => <div className="font-fixed">{value}</div>,
          },
          {
            title: "공개 여부",
            dataIndex: "isPublic",
            render: (value) => (value ? "공개" : "비공개"),
          },
          {
            title: "주소",
            dataIndex: "address",
            render: (value) => <div>{Util.formatAddress(value)}</div>,
          },
        ]}
      />
      <Popup.Warehouse.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.Warehouse.Update open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
