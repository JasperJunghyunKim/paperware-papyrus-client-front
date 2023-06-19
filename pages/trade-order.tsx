import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { OrderUpsertOpen } from "@/components/popup/order/StockUpsert";
import classNames from "classnames";
import { useCallback, useState } from "react";
import { TbHome2 } from "react-icons/tb";

type RecordType = Model.Order;

export default function Component() {
  const info = ApiHook.Auth.useGetMe();

  const [openStockUpsert, setOpenStockUpsert] =
    useState<OrderUpsertOpen>(false);

  const partnerColumn = Table.Preset.useColumnPartner<RecordType>(
    ["dstCompany", "companyRegistrationNumber"],
    { title: "매입처", fallback: (record) => record.dstCompany.businessName }
  );
  const [page, setPage] = usePage();
  const list = ApiHook.Trade.Common.useGetList({
    query: {
      ...page,
      srcCompanyId: info.data?.companyId,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  const getStock = useCallback(
    (record: RecordType) => {
      return (
        record.orderStock?.plan.find(
          (p) => p.companyId === info.data?.companyId
        )?.assignStockEvent?.stock ?? record.orderDeposit
      );
    },
    [info.data?.companyId]
  );

  const apiCancel = ApiHook.Trade.Common.useCancel();
  const cmdCancel = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`선택한 매입(${only.orderNo})을 취소하시겠습니까?`))
    ) {
      return;
    }

    await apiCancel.mutateAsync({
      orderId: only.id,
    });
  }, [apiCancel, only]);

  return (
    <Page title="매입 주문 목록">
      <StatBar.Container>
        <StatBar.Item icon={<TbHome2 />} label="관리 매입처" value={"-"} />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="정상 매입 등록"
          onClick={() => setOpenStockUpsert("CREATE_ORDER")}
        />
        <div className="flex-1" />
        {only &&
          (only.status === "OFFER_PREPARING" ||
            only.status === "OFFER_REJECTED" ||
            only.status === "ORDER_PREPARING" ||
            only.status === "ORDER_REJECTED") && (
            <Toolbar.ButtonPreset.Delete
              label="매출 삭제"
              onClick={cmdCancel}
            />
          )}
        <Toolbar.ButtonPreset.Update
          label="매입 정보 상세"
          onClick={() => only && setOpenStockUpsert(only.id)}
          disabled={!only}
        />
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => `${record.id}`}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "매출 유형",
            render: (_value, record) => (
              <div>
                {record.orderStock
                  ? record.srcDepositEvent
                    ? "보관 입고"
                    : "정상 매입"
                  : record.orderDeposit
                  ? "매입 보관"
                  : ""}
              </div>
            ),
          },
          ...partnerColumn,
          {
            title: "사업자등록번호",
            dataIndex: ["dstCompany", "companyRegistrationNumber"],
          },
          ...Table.Preset.columnConnection<RecordType>([
            "dstCompany",
            "managedById",
          ]),
          {
            title: "주문 번호",
            dataIndex: "orderNo",
            render: (value, record) => (
              <div className="flex">
                <div className="font-fixed bg-sky-100 px-1 text-sky-800 rounded-md">
                  {value}
                </div>
              </div>
            ),
          },
          {
            title: "도착 희망일",
            dataIndex: "wantedDate",
            render: (value) => Util.formatIso8601ToLocalDate(value),
          },
          {
            title: "도착지",
            dataIndex: ["orderStock", "dstLocation", "name"],
          },
          {
            title: "도착지 주소",
            dataIndex: ["orderStock", "dstLocation", "address"],
            render: (value) => <div>{Util.formatAddress(value)}</div>,
          },
          {
            title: "주문 상태",
            dataIndex: "status",
            render: (value: Model.Enum.OrderStatus) => (
              <div
                className={classNames("flex gap-x-2", {
                  "text-amber-600": Util.inc(
                    value,
                    "OFFER_PREPARING",
                    "ORDER_PREPARING"
                  ),
                  "text-green-600": Util.inc(
                    value,
                    "OFFER_REQUESTED",
                    "ORDER_REQUESTED"
                  ),
                  "text-red-600": Util.inc(
                    value,
                    "OFFER_REJECTED",
                    "ORDER_REJECTED"
                  ),
                  "text-black": Util.inc(value, "ACCEPTED"),
                })}
              >
                <div className="flex-initial flex flex-col justify-center">
                  <Icon.OrderStatus value={value} />
                </div>
                <div className="flex-initial flex flex-col justify-center">
                  {Util.orderStatusToSTring(value)}
                </div>
              </div>
            ),
          },
          ...Table.Preset.columnStockGroup<Model.Order>(
            (record) =>
              record.orderStock?.plan.find(
                (p) => p.companyId === record.dstCompany.id
              )?.assignStockEvent?.stock ?? record.orderDeposit
          ),
          ...Table.Preset.columnQuantity<Model.Order>(
            (record) =>
              record.orderStock?.plan.find(
                (p) => p.companyId === record.dstCompany.id
              )?.assignStockEvent?.stock ?? record.orderDeposit,
            (record) =>
              record.orderStock?.plan.find(
                (p) => p.companyId === record.dstCompany.id
              )?.assignStockEvent?.change ?? record.orderDeposit?.quantity,
            { prefix: "매입" }
          ),
        ]}
      />
      <Popup.Order.StockUpsert
        open={openStockUpsert}
        onClose={setOpenStockUpsert}
      />
    </Page>
  );
}
