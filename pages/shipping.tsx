import { Api, Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import classNames from "classnames";
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

  const apiDelete = ApiHook.Shipping.Shipping.useDelete();
  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(
        `선택한 배송(${only.shippingNo})을 삭제하시겠습니까?`
      ))
    ) {
      return;
    }

    await apiDelete.mutateAsync({
      shippingId: only.id,
    });
  }, [apiDelete, only]);

  useEffect(() => {
    if (list.data && only) {
      const found = list.data.items.find((x) => x.id === only.id);
      setSelected(found ? [found] : []);
    }
  }, [list.data, only]);

  const progressColumn = useCallback((record: Model.ShippingItem) => {
    const preparing = record.invoice.filter(
      (p) => p.invoiceStatus === "WAIT_SHIPPING"
    );
    const progressing = record.invoice.filter(
      (p) => p.invoiceStatus === "ON_SHIPPING"
    );
    const progressed = record.invoice.filter(
      (p) => p.invoiceStatus === "DONE_SHIPPING"
    );
    return (
      <div className="flex gap-x-2 text-gray-400 select-none">
        <div
          className={classNames(
            "flex-initial border border-solid px-2 rounded-full",
            {
              "text-amber-600 border-amber-600": preparing.length > 0,
              "text-gray-300 border-gray-300": preparing.length === 0,
            }
          )}
        >
          {`상차 완료 ${preparing.length}`}
        </div>
        <div
          className={classNames(
            "flex-initial border border-solid px-2 rounded-full",
            {
              "text-green-600 border-green-600": progressing.length > 0,
              "text-gray-300 border-gray-300": progressing.length === 0,
            }
          )}
        >
          {`배송중 ${progressing.length}`}
        </div>
        <div
          className={classNames(
            "flex-initial border border-solid px-2 rounded-full",
            {
              "text-blue-600 border-blue-600": progressed.length > 0,
              "text-gray-300 border-gray-300": progressed.length === 0,
            }
          )}
        >
          {`배송 완료 ${progressed.length}`}
        </div>
      </div>
    );
  }, []);
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
            <Toolbar.ButtonPreset.Delete
              label="선택 배송 삭제"
              onClick={cmdDelete}
            />
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
            render: (record: Model.ShippingItem) => progressColumn(record),
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
