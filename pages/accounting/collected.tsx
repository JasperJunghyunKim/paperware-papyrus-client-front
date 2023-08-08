import { SettingUserResponse } from "@/@shared/api/setting/user.response";
import { Accounted, User } from "@/@shared/models";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useEffect, useState } from "react";
import { TbLock, TbLockOpen, TbUserCircle } from "react-icons/tb";

type RecordType = Accounted;
export default function Component() {
  const [openUpsert, setOpenUpsert] = useState<
    number | "PAID" | "COLLECTED" | false
  >(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Setting.Accounted.useGetList({
    ...page,
    accountedType: "COLLECTED",
  });

  const me = ApiHook.Auth.useGetMe();

  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  return (
    <Page title="수급 관리" menu={Const.Menu.SETTING_USER}>
      <Toolbar.Container>
        {me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Create
            label="수금 내역 추가"
            onClick={() => setOpenUpsert("COLLECTED")}
          />
        )}
        <div className="flex-1" />
        {only && (
          <Toolbar.Button
            icon={<TbUserCircle />}
            label="관리자 지정"
            onClick={() => {}}
          />
        )}
        {only && me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Update
            label="상세 정보"
            onClick={() => only && setOpenUpsert(only.id)}
          />
        )}
      </Toolbar.Container>
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
                    record.byCard?.amount ??
                    record.byCash?.amount ??
                    record.byEtc?.amount ??
                    record.byOffset?.amount ??
                    record.bySecurity?.amount ??
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
              Util.accountMethodToString(record.accountedMethod),
          },
          {
            title: "구분",
            render: (record: RecordType) => "TODO",
          },
        ]}
      />
      <Popup.Accounting.Upsert open={openUpsert} onClose={setOpenUpsert} />
    </Page>
  );
}
