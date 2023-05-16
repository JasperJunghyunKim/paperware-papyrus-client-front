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
  const [selected, setSelected] = useState<Model.BankAccount[]>([]);

  const only = Util.only(selected);

  const list = ApiHook.Inhouse.BankAccount.useGetBankAccountList({ query: page });
  const api = ApiHook.Inhouse.BankAccount.useBankAccountDelete();

  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`해당 계좌를 (${only.accountName})를 삭제하시겠습니까?`))
    ) {
      return;
    }

    await api.mutateAsync({
      id: only.accountId,
    });

  }, [api, only]);

  return (
    <Page title="계좌 조회">
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="계좌 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="계좌 상세"
            onClick={() => setOpenUpdate(only.accountId)}
          />
        )}
        {only && (
          <Toolbar.ButtonPreset.Delete
            label="계좌 삭제"
            onClick={async () => await cmdDelete()}
          />
        )}
      </Toolbar.Container>
      <Table.Default<Model.BankAccount>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.accountId}
        selected={selected}
        onSelectedChange={setSelected}
        selection="single"
        columns={[
          {
            title: "은행 이름",
            dataIndex: ["bankComapny"],
          },
          {
            title: "계좌 이름",
            dataIndex: ["accountName"],
          },
          {
            title: "계좌 종류",
            dataIndex: ["accountType"],
          },
          {
            title: "계좌 번호",
            dataIndex: ["accountNumber"],
          },
          {
            title: "계좌 소유자",
            dataIndex: ["accountHolder"],
          },
        ]}
      />
      <Popup.BankAccount.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.BankAccount.Update open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
