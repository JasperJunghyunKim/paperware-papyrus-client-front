import { Model } from "@/@shared";
import { Enum } from "@/@shared/models";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Condition, Popup, Table, Toolbar } from "@/components";
import { accountedAtom } from "@/components/condition/accounted/accounted.state";
import { METHOD_OPTIONS } from "@/components/formControl/SelectMethod";
import { SUBJECT_OPTIONS } from "@/components/formControl/SelectSubject";
import { Page } from "@/components/layout";
import { message } from "antd";
import { useCallback, useState } from "react";
import { useRecoilValue } from "recoil";

export default function Component() {
  const condition = useRecoilValue(accountedAtom);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);
  const [method, setMethod] = useState<Enum.Method | null>(null);
  const [page, setPage] = usePage();
  const [selectedPaid, setSelectedPaid] = useState<Model.Accounted[]>([]);
  const [only, setOnly] = useState<Model.Accounted>();
  const [messageApi, contextHolder] = message.useMessage();

  const list = ApiHook.Partner.Accounted.useAccountedList({
    query: {
      ...page,
      ...condition,
      companyRegistrationNumber: condition.companyRegistrationNumber === '전체' ? '' : condition.companyRegistrationNumber,
      accountedType: "PAID",
    },
    successCallback: (data) => {
      if (data?.items.length === 0) {
        setOnly(undefined);
      }
    }
  });

  const apiByCashDelete = ApiHook.Partner.ByCash.useByCashDelete();
  const apiByEtcDelete = ApiHook.Partner.ByEtc.useByEtcDelete();
  const apiByBankAccountDelete = ApiHook.Partner.ByBankAccount.useByBankAccountDelete();
  const apiByCardDelete = ApiHook.Partner.ByCard.useByCardDelete();
  const apiByOffsetDelete = ApiHook.Partner.ByOffset.useByOffsetDelete();
  const apiBySecurityDelete = ApiHook.Partner.BySecurity.useBySecurityDelete();

  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`해당 거래를 삭제하시겠습니까?`))
    ) {
      return;
    }

    const method: Enum.Method = only.accountedMethod;

    switch (method) {
      case 'ACCOUNT_TRANSFER':
        await apiByBankAccountDelete.mutateAsync({
          id: only.accountedId,
          accountedType: only.accountedType,
        });
        break;
      case 'CARD_PAYMENT':
        await apiByCardDelete.mutateAsync({
          id: only.accountedId,
          accountedType: only.accountedType,
        });
        break;
      case 'PROMISSORY_NOTE':
        if (only.securityStatus !== 'NONE') {
          return messageApi.open({
            type: 'error',
            content: '해당 유가증권이 사용중에 있습니다.'
          })
        }

        await apiBySecurityDelete.mutateAsync({
          id: only.accountedId,
          accountedType: only.accountedType,
        });
        break;
      case 'OFFSET':
        await apiByOffsetDelete.mutateAsync({
          id: only.accountedId,
          accountedType: only.accountedType,
        });
        break;
      case 'CASH':
        await apiByCashDelete.mutateAsync({
          id: only.accountedId,
          accountedType: only.accountedType,
        });
        break;
      case 'ETC':
        await apiByEtcDelete.mutateAsync({
          id: only.accountedId,
          accountedType: only.accountedType,
        });
        break;
    }

  }, [apiByBankAccountDelete, apiByCardDelete, apiByCashDelete, apiByEtcDelete, apiByOffsetDelete, apiBySecurityDelete, messageApi, only]);

  return (
    <Page title="지급 내역 조회">
      {contextHolder}
      <Condition.Container>
        <Condition.Item accountedType="PAID" />
      </Condition.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="지급 내역 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="지급 내역 상세"
            onClick={() => {
              setOpenUpdate(only.accountedId)
              setMethod(only.accountedMethod);
            }}
          />
        )}
        {only && (
          <Toolbar.ButtonPreset.Delete
            label="지급 내역 삭제"
            onClick={async () => await cmdDelete()}
          />
        )}
      </Toolbar.Container>
      <Table.Default<Model.Accounted>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.accountedId}
        selected={selectedPaid}
        onSelectedChange={(selected) => {
          setSelectedPaid(selected);
          setOnly(Util.only(selected));
        }}
        selection="single"
        columns={[
          {
            title: "거래처",
            dataIndex: ["partnerNickName"],
          },
          {
            title: "수금일",
            dataIndex: ["accountedDate"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.formatIso8601ToLocalDate(value)}`}</div>
            ),
          },
          {
            title: "수금 금액",
            dataIndex: ["amount"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(value)}`}</div>
            ),
          },
          {
            title: "계정 과목",
            dataIndex: ["accountedSubject"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.accountedSubject('PAID', SUBJECT_OPTIONS.filter((item) => item.value === value)[0].value)}`}</div>
            ),
          },
          {
            title: "수금 수단",
            dataIndex: ["accountedMethod"],
            render: (value) => (
              <div className="text-right font-fixed">{`${METHOD_OPTIONS.filter((item) => item.value === value)[0].label}`}</div>
            ),
          },
          {
            title: "구분",
            dataIndex: ["gubun"],
          },
        ]}
      />
      <Popup.Accounted.Create accountedType="PAID" open={openCreate} onClose={setOpenCreate} />
      <Popup.Accounted.Update accountedType="PAID" method={method} open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
