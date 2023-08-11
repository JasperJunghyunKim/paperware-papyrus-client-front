import { Accounted } from "@/@shared/models";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Search, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useEffect, useState } from "react";

type RecordType = Accounted;
export default function Component() {
  const [openUpsert, setOpenUpsert] = useState<
    number | "PAID" | "COLLECTED" | false
  >(false);

  const [search, setSearch] = useState<any>({});
  const [page, setPage] = usePage();
  const list = ApiHook.Setting.Accounted.useGetList({
    ...page,
    ...search,
    accountedType: "COLLECTED",
  });

  const me = ApiHook.Auth.useGetMe();

  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  const apiDelete = ApiHook.Setting.Accounted.useDelete();
  const cmdDelete = async () => {
    if (
      !only ||
      !(await Util.confirm("선택한 수금 내역을 삭제하시겠습니까?"))
    ) {
      return;
    }

    await apiDelete.mutateAsync({ path: { id: only.id } });
  };

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  return (
    <Page title="수금 관리" menu={Const.Menu.SETTING_USER}>
      <Toolbar.Container>
        {me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Create
            label="수금 내역 추가"
            onClick={() => setOpenUpsert("COLLECTED")}
          />
        )}
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Delete label="항목 삭제" onClick={cmdDelete} />
        )}
        {only && me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Update
            label="상세 정보"
            onClick={() => only && setOpenUpsert(only.id)}
          />
        )}
      </Toolbar.Container>
      <Search
        items={[
          {
            type: "select-company-registration-number",
            field: "companyRegistrationNumber",
            label: "거래처",
          },
          {
            type: "date-range",
            field: "accountedDate",
            label: "수금일",
          },
          {
            type: "select-account-subject",
            field: "accountedSubject",
            label: "계정 과목",
          },
          {
            type: "select-account-method",
            field: "accountedMethod",
            label: "수금 수단",
            accountedType: "COLLECTED",
          },
        ]}
        value={search}
        onSearch={setSearch}
      />
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(item) => item.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          ...Table.Preset.useColumnPartner2<RecordType>({
            getValue: (record) => record.companyRegistrationNumber,
          }),
          {
            title: "수금일",
            render: (record: RecordType) =>
              Util.formatIso8601ToLocalDate(record.accountedDate),
          },
          {
            title: "수금 금액",
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {`${Util.comma(
                  record.byBankAccount?.amount ??
                    record.byCard?.cardAmount ??
                    record.byCash?.amount ??
                    record.byEtc?.amount ??
                    record.byOffset?.amount ??
                    record.bySecurity?.security.securityAmount ??
                    0
                )} 원`}
              </div>
            ),
          },
          {
            title: "계정 과목",
            render: (record: RecordType) =>
              Util.accountSubjectToString(record.accountedSubject),
          },
          {
            title: "수금 수단",
            render: (record: RecordType) =>
              Util.accountMethodToString(record.accountedMethod, "COLLECTED"),
          },
          {
            title: "구분",
            render: (record: RecordType) =>
              record.byBankAccount?.bankAccount.accountName ??
              record.byCard?.bankAccount?.accountName ??
              (record.bySecurity
                ? `${Util.securityTypeToString(
                    record.bySecurity.security.securityType
                  )} ${record.bySecurity.security.securitySerial}`
                : null),
          },
        ]}
      />
      <Popup.Accounting.Upsert open={openUpsert} onClose={setOpenUpsert} />
    </Page>
  );
}
