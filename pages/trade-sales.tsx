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
    ["srcCompany", "companyRegistrationNumber"],
    { title: "매출처", fallback: (record) => record.srcCompany.businessName }
  );
  const [page, setPage] = usePage();
  const list = ApiHook.Trade.Common.useGetList({
    query: {
      ...page,
      dstCompanyId: info.data?.companyId,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  const apiCancel = ApiHook.Trade.Common.useCancel();
  const cmdCancel = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`선택한 매출(${only.orderNo})을 취소하시겠습니까?`))
    ) {
      return;
    }

    await apiCancel.mutateAsync({
      orderId: only.id,
    });

    setSelected([]);
  }, [apiCancel, only]);

  return (
    <Page title="매출 주문 목록">
      <StatBar.Container>
        <StatBar.Item icon={<TbHome2 />} label="관리 매출처" value={"-"} />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="매출 등록"
          onClick={() => setOpenStockUpsert("CREATE_OFFER")}
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
          label="매출 정보 상세"
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
              <div>{Util.orderTypeToString(record.orderType, "SALES")}</div>
            ),
          },
          {
            title: "매출 번호",
            dataIndex: "orderNo",
            render: (value) => (
              <div className="flex">
                <div className="font-fixed bg-sky-100 px-1 text-sky-800 rounded-md">
                  {value}
                </div>
              </div>
            ),
          },
          ...partnerColumn,
          {
            title: "매출일",
            dataIndex: "orderDate",
            render: (value) => Util.formatIso8601ToLocalDate(value),
          },
          {
            title: "납품 요청일",
            render: (_, record) =>
              Util.formatIso8601ToLocalDate(
                record.orderStock?.wantedDate ??
                  record.orderProcess?.srcWantedDate ??
                  null
              ),
          },
          {
            title: "납품 도착지",
            render: (_, record) =>
              record.orderStock?.dstLocation.name ??
              record.orderProcess?.srcLocation.name,
          },
          {
            title: "매출 상태",
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
                  {Util.orderStatusToString(value)}
                </div>
              </div>
            ),
          },
          ...Table.Preset.columnStockGroup<Model.Order>((record) =>
            Util.assignStockFromOrder(record)
          ),
          ...Table.Preset.columnQuantity<Model.Order>(
            (record) => Util.assignStockFromOrder(record),
            (record) => Util.assignQuantityFromOrder(record),
            { prefix: "매출", negative: false }
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
