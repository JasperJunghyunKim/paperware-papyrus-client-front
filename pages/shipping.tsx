import { Api, Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useEffect } from "react";
import { useCallback, useState } from "react";
import { TbHome, TbHomeShield } from "react-icons/tb";

export default function Component() {
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Shipping.Shipping.useGetList({ query: page });
  const [selected, setSelected] = useState<Model.Shipping[]>([]);

  const only = Util.only(selected);

  const apiCreate = ApiHook.Shipping.Shipping.useCreate();
  const cmdCreate = useCallback(
    async (data: Api.ShippingCreateRequest) => {
      if (!(await Util.confirm("배송을 생성하시겠습니까?"))) return;

      await apiCreate.mutateAsync({ data });
    },
    [apiCreate]
  );

  useEffect(() => {
    if (list.data && only) {
      const found = list.data.items.find((x) => x.id === only.id);
      setSelected(found ? [found] : []);
    }
  }, [list.data, only]);

  return (
    <Page title="배송 설정">
      <StatBar.Container>
        <StatBar.Item icon={<TbHome />} label="공개 배송" value={"-"} />
        <StatBar.Item
          icon={<TbHomeShield />}
          label="비공개 배송"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="배송 추가"
          onClick={() => cmdCreate({})}
        />
        <div className="flex-1" />
        {only && (
          <>
            <Toolbar.ButtonPreset.Update
              label="선택 배송 상세"
              onClick={() => setOpenUpdate(only.id)}
            />
          </>
        )}
      </Toolbar.Container>
      <Table.Default<Model.Shipping>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "배송 번호",
            dataIndex: "shippingNo",
            render: (value) => <div className="font-fixed">{value}</div>,
          },
          {
            title: "배송 상태",
            dataIndex: "status",
            render: (value) => <div>{Util.shippingStatusToString(value)}</div>,
          },
          {
            title: "운송장 개수",
            dataIndex: "invoiceCount",
            render: (value) => (
              <div className="font-fixed text-right">{value} 개</div>
            ),
          },
          {
            title: "배송 중량",
            dataIndex: "weight",
            render: (value) => <div className="font-fixed">{value}</div>,
          },
          {
            title: "배송 담당자",
            dataIndex: "manager",
            render: (value) => <div>{value}</div>,
          },
        ]}
      />
      <Popup.Shipping.Update open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
