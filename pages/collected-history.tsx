import { Model } from "@/@shared";
import { Enum } from "@/@shared/models";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Condition, Popup, Table, Toolbar } from "@/components";
import { accountedAtom } from "@/components/condition/accounted/accounted.state";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";
import { useRecoilValue } from "recoil";

const METHOD_OPTIONS = [
  {
    label: "계좌 이체",
    value: "ACCOUNT_TRANSFER" as Model.Enum.Method,
  },
  {
    label: "유가증권",
    value: "PROMISSORY_NOTE" as Model.Enum.Method,
  },
  {
    label: "카드입금",
    value: "CARD_PAYMENT" as Model.Enum.Method,
  },
  {
    label: "현금",
    value: "CASH" as Model.Enum.Method,
  },
  {
    label: "상계",
    value: "OFFSET" as Model.Enum.Method,
  },
  {
    label: "기타",
    value: "ETC" as Model.Enum.Method,
  },
];

const COLLECTED_OPTIONS = [
  {
    label: "외상 매입금",
    value: "COLLECTED_ACCOUNTS_RECEIVABLE" as Model.Enum.Subject,
  },
  {
    label: "미수금금",
    value: "COLLECTED_UNPAID_EXPENSES" as Model.Enum.Subject,
  },
  {
    label: "선수금금",
    value: "COLLECTED_PREPAID_EXPENSES" as Model.Enum.Subject,
  },
  {
    label: "잡손실",
    value: "COLLECTED_MISCELLANEOUS_LOSSES" as Model.Enum.Subject,
  },
  {
    label: "상품 매입",
    value: "COLLECTED_PRODUCT_PURCHASES" as Model.Enum.Subject,
  },
  {
    label: "기타",
    value: "ETC" as Model.Enum.Subject,
  },
];

export default function Component() {
  const condition = useRecoilValue(accountedAtom);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);
  const [method, setMethod] = useState<Enum.Method | null>(null);
  const [page, setPage] = usePage();
  const [selectedCollected, setSelectedCollected] = useState<Model.Accounted[]>([]);
  const [only, setOnly] = useState<Model.Accounted>();

  const list = ApiHook.Partner.Accounted.useAccountedList({
    query: {
      ...page,
      ...condition,
      accountedType: "COLLECTED",
    },
    successCallback: (data) => {
      if (data?.items.length === 0) {
        setOnly(undefined);
      }
    }
  });
  const apiByCashDelete = ApiHook.Partner.ByCash.useByCashDelete();
  const apiByEtcDelete = ApiHook.Partner.ByEtc.useByEtcDelete();

  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`해당 거래를(${only.partnerNickName})를 삭제하시겠습니까?`))
    ) {
      return;
    }

    const method: Enum.Method = only.accountedMethod;

    switch (method) {
      case 'ACCOUNT_TRANSFER':
        // TODO
        break;
      case 'CARD_PAYMENT':
        // TODO
        break;
      case 'PROMISSORY_NOTE':
        // TODO
        break;
      case 'OFFSET':
        // TODO
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

  }, [apiByCashDelete, apiByEtcDelete, only]);

  return (
    <Page title="수금 내역 조회">
      <Condition.Container>
        <Condition.Item accountedType="COLLECTED" />
      </Condition.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="수금 내역 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="수금 내역 상세"
            onClick={() => {
              setOpenUpdate(only.accountedId)
              setMethod(only.accountedMethod);
            }}
          />
        )}
        {only && (
          <Toolbar.ButtonPreset.Delete
            label="수금 내역 삭제"
            onClick={async () => await cmdDelete()}
          />
        )}
      </Toolbar.Container>
      <Table.Default<Model.Accounted>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.accountedId}
        selected={selectedCollected}
        onSelectedChange={(selected) => {
          setSelectedCollected(selected);
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
              <div className="text-right font-fixed">{`${COLLECTED_OPTIONS.filter((item) => item.value === value)[0].label}`}</div>
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
      <Popup.Accounted.Create accountedType="COLLECTED" open={openCreate} onClose={setOpenCreate} />
      <Popup.Accounted.Update accountedType="COLLECTED" method={method} open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
