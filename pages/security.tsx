import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Table, Toolbar } from "@/components";
import { CARD_OPTIONS } from "@/components/formControl/SelectCard";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);
  const [page, setPage] = usePage();
  const [selected, setSelected] = useState<Model.Card[]>([]);

  const only = Util.only(selected);

  const list = ApiHook.Inhouse.Card.useGetCardList({ query: page });
  const api = ApiHook.Inhouse.Card.useCardDelete();

  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`해당 유가증권을 (${only.cardName})를 삭제하시겠습니까?`))
    ) {
      return;
    }

    await api.mutateAsync({
      id: only.cardId,
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
            onClick={() => setOpenUpdate(only.cardId)}
          />
        )}
        {only && (
          <Toolbar.ButtonPreset.Delete
            label="유가증권 삭제"
            onClick={async () => await cmdDelete()}
          />
        )}
      </Toolbar.Container>
      <Table.Default<Model.Card>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.cardId}
        selected={selected}
        onSelectedChange={setSelected}
        selection="single"
        columns={[
          {
            title: "생성구분",
            dataIndex: ["cardName"],
          },
          {
            title: "유형",
            dataIndex: ["cardCompany"],
            render: (value) => CARD_OPTIONS.find((item) => item.value === value)?.label,
          },
          {
            title: "번호",
            dataIndex: ["cardNumber"],
          },
          {
            title: "금액",
            dataIndex: ["cardHolder"],
          },
          {
            title: "발행일",
            dataIndex: ["cardHolder"],
          },
          {
            title: "만기일",
            dataIndex: ["cardHolder"],
          },
          {
            title: "상태",
            dataIndex: ["cardHolder"],
          },
        ]}
      />
      <Popup.Card.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.Card.Update open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
