import { OrderRequestItem } from "@/@shared/models";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";
import { TbMapPin, TbMapPinFilled } from "react-icons/tb";
import { match } from "ts-pattern";

type RecordType = OrderRequestItem & {
  orderRequest: {
    id: number;
    srcCompany: {
      id: number;
      businessName: string;
      companyRegistrationNumber: string;
      phoneNo: string;
      faxNo: string;
      representative: string;
      invoiceCode: string;
      bizType: string;
      bizItem: string;
      address: string;
    };
    dstCompany: {
      id: number;
      businessName: string;
      companyRegistrationNumber: string;
      phoneNo: string;
      faxNo: string;
      representative: string;
      invoiceCode: string;
      bizType: string;
      bizItem: string;
      address: string;
    };
    ordererName: string;
    ordererPhoneNo: string;
    location: {
      id: number;
      name: string;
      isPublic: boolean;
      address: string;
    } | null;
    wantedDate: string | null;
    memo: string;
    createdAt: string;
  };
};
export default function Component() {
  const me = ApiHook.Auth.useGetMe();

  const [openCreate, setOpenCreate] = useState(false);

  const [page, setPage] = usePage();
  const list = ApiHook.OrderRequest.OrderRequest.useGetList({
    query: { ...page, srcCompanyId: me.data?.companyId ?? undefined },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);

  const only = Util.only(selected);

  const apiCancel = ApiHook.OrderRequest.OrderRequest.useCancel();
  const cmdCancel = useCallback(async () => {
    if (!only || !(await Util.confirm(`선택한 주문을 취소하시겠습니까?`))) {
      return;
    }

    await apiCancel.mutateAsync({ id: only.id });
    setSelected([]);
  }, [apiCancel, only]);

  return (
    <Page title="퀵 주문 발신함" menu={Const.Menu.ORDER_REQUEST_SENT}>
      <StatBar.Container>
        <StatBar.Item
          icon={<TbMapPinFilled />}
          label="확인된 주문"
          value={"-"}
        />
        <StatBar.Item
          icon={<TbMapPin />}
          label="미확인 주문"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="퀵 주문 등록"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && only.status == "REQUESTED" && (
          <Toolbar.ButtonPreset.Delete
            label="주문 취소"
            onClick={async () => await cmdCancel()}
          />
        )}
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "퀵 주문번호",
            render: (record: RecordType) => (
              <div className="font-fixed">
                {Util.formatSerial(record.serial)}
              </div>
            ),
          },
          ...Table.Preset.useColumnPartner2<RecordType>({
            getValue: (record) =>
              record.orderRequest.dstCompany.companyRegistrationNumber,
          }),
          {
            title: "상품명",
            render: (record: RecordType) => record.item,
          },
          {
            title: "수량",
            render: (record: RecordType) => record.quantity,
          },
          {
            title: "메모",
            render: (record: RecordType) => record.orderRequest.memo,
          },
          {
            title: "도착지",
            render: (record: RecordType) => record.orderRequest.location?.name,
          },
          {
            title: "도착 희망일",
            render: (record: RecordType) =>
              Util.formatIso8601ToLocalDate(record.orderRequest.wantedDate),
          },
          {
            title: "상태",
            render: (record: RecordType) =>
              match(record.status)
                .with("REQUESTED", () => "주문 접수")
                .with("DONE", () => "주문 종료")
                .with("CANCELLED", () => "주문 취소")
                .with("ON_CHECKING", () => "확인중(읽음)")
                .exhaustive(),
          },
          {
            title: "발주자",
            render: (record: RecordType) => record.orderRequest.ordererName,
          },
          {
            title: "발신일시",
            render: (record: RecordType) =>
              Util.formatIso8601ToLocalDateTime(record.orderRequest.createdAt),
          },
        ]}
      />
      <Popup.QuickOrder.Create open={openCreate} onClose={setOpenCreate} />
    </Page>
  );
}
