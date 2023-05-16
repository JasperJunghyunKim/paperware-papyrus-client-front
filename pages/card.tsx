import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);
  const [page, setPage] = usePage();
  const [selectedCard, setSelectedCard] = useState<Model.Card[]>([]);

  const only = Util.only(selectedCard);

  const list = ApiHook.Inhouse.Card.useGetCardList({ query: page });
  const cardDelete = ApiHook.Inhouse.Card.useCardDelete();

  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`해당 카드를 (${only.cardName})를 삭제하시겠습니까?`))
    ) {
      return;
    }

    await cardDelete.mutateAsync({
      id: only.cardId,
    });

  }, [cardDelete, only]);

  return (
    <Page title="카드 조회">
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="카드 내역 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="카드 내역 상세"
            onClick={() => setOpenUpdate(only.cardId)}
          />
        )}
        {only && (
          <Toolbar.ButtonPreset.Delete
            label="카드 내역 삭제"
            onClick={async () => await cmdDelete()}
          />
        )}
      </Toolbar.Container>
      <Table.Default<Model.Card>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.cardId}
        selected={selectedCard}
        onSelectedChange={setSelectedCard}
        selection="single"
        columns={[
          {
            title: "카드명",
            dataIndex: ["cardName"],
          },
          {
            title: "수금일",
            dataIndex: ["cardCompany"],
          },
          {
            title: "수금 금액",
            dataIndex: ["cardNumber"],
          },
          {
            title: "계정 과목",
            dataIndex: ["cardHolder"],
          },
        ]}
      />
      {/* <Popup.Accounted.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.Accounted.Update open={openUpdate} onClose={setOpenUpdate} /> */}
    </Page>
  );
}
