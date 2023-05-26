import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);
  const [page, setPage] = usePage();
  const [selected, setSelected] = useState<Model.Security[]>([]);

  const only = Util.only(selected);

  const list = ApiHook.Inhouse.Security.useGetSecurityList({ query: page });
  const api = ApiHook.Inhouse.Security.useSecurityDelete();

  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`해당 유가증권을 (${only.securitySerial})를 삭제하시겠습니까?`))
    ) {
      return;
    }

    await api.mutateAsync({
      id: only.securityId,
    });

  }, [api, only]);

  return (
    <Page title="유가증권 조회">
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="유가증권 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="유가증권 상세"
            onClick={() => setOpenUpdate(only.securityId)}
          />
        )}
        {only && (
          <Toolbar.ButtonPreset.Delete
            label="유가증권 삭제"
            onClick={async () => await cmdDelete()}
          />
        )}
      </Toolbar.Container>
      <Table.Default<Model.Security>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.securityId}
        selected={selected}
        onSelectedChange={setSelected}
        selection="single"
        columns={[
          {
            title: "생성구분",
            dataIndex: ["drawedStatus"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.drawedStatusToSTring(value)}`}</div>
            ),
          },
          {
            title: "유형",
            dataIndex: ["securityType"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.securityTypeToSTring(value)}`}</div>
            ),
          },
          {
            title: "번호",
            dataIndex: ["securitySerial"],
          },
          {
            title: "금액",
            dataIndex: ["securityAmount"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(value)}`}</div>
            ),
          },
          {
            title: "발행일",
            dataIndex: ["drawedDate"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.formatIso8601ToLocalDate(value)}`}</div>
            ),
          },
          {
            title: "만기일",
            dataIndex: ["maturedDate"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.formatIso8601ToLocalDate(value)}`}</div>
            ),
          },
          {
            title: "상태",
            dataIndex: ["securityStatus"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.securityStatusToSTring(value)}`}</div>
            ),
          },
        ]}
      />
      <Popup.Security.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.Security.Update open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
