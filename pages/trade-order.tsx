import { Model } from "@/@shared";
import { Enum } from "@/@shared/models";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, Search, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { OrderUpsertOpen } from "@/components/popup/order/StockUpsert";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import { TbHome2 } from "react-icons/tb";

type RecordType = Model.Order;
type TempPlan = {
  status: Enum.PlanStatus;
  task: { type: Enum.TaskType; status: Enum.TaskStatus }[];
  invoice: { invoiceStatus: Enum.InvoiceStatus }[];
};

export default function Component() {
  const info = ApiHook.Auth.useGetMe();

  const [openStockUpsert, setOpenStockUpsert] =
    useState<OrderUpsertOpen>(false);

  const [search, setSearch] = useState<any>({});
  const [page, setPage] = usePage();
  const list = ApiHook.Trade.Common.useGetList({
    query: {
      ...search,
      ...page,
      srcCompanyId: info.data?.companyId,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  const apiDelete = ApiHook.Trade.Common.useDelete();
  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`선택한 매입(${only.orderNo})을 취소하시겠습니까?`))
    ) {
      return;
    }

    await apiDelete.mutateAsync({
      orderId: only.id,
    });

    setSelected([]);
  }, [apiDelete, only]);

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

    setSelected([]);
  }, [apiCancel, only]);

  const partnerColumn = Table.Preset.useColumnPartner<RecordType>(
    ["dstCompany", "companyRegistrationNumber"],
    { title: "매입처", fallback: (record) => record.dstCompany.businessName }
  );

  const findPlan = (record: Model.Order) => {
    return (record.orderStock ?? record.orderProcess)?.plan?.find(
      (p) => p.companyId === record.dstCompany.id
    ) as TempPlan | undefined;
  };

  const progressColumn = useCallback(
    (types: Model.Enum.TaskType[], record: TempPlan | undefined) => {
      if (!record) return null;

      const preparing = record.task.filter(
        (p) => types.some((q) => q === p.type) && p.status === "PREPARING"
      );
      const progressing = record.task.filter(
        (p) => types.some((q) => q === p.type) && p.status === "PROGRESSING"
      );
      const progressed = record.task.filter(
        (p) => types.some((q) => q === p.type) && p.status === "PROGRESSED"
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
            {`대기 ${preparing.length}`}
          </div>
          {types.every((p) => p !== "RELEASE") && (
            <div
              className={classNames(
                "flex-initial border border-solid px-2 rounded-full",
                {
                  "text-green-600 border-green-600": progressing.length > 0,
                  "text-gray-300 border-gray-300": progressing.length === 0,
                }
              )}
            >
              {`진행 ${progressing.length}`}
            </div>
          )}
          <div
            className={classNames(
              "flex-initial border border-solid px-2 rounded-full",
              {
                "text-blue-600 border-blue-600": progressed.length > 0,
                "text-gray-300 border-gray-300": progressed.length === 0,
              }
            )}
          >
            {`완료 ${progressed.length}`}
          </div>
        </div>
      );
    },
    []
  );

  const shippingStatusColumn = useCallback((record: TempPlan | undefined) => {
    if (!record) return null;

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

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  return (
    <Page title="매입 주문 목록" menu={Const.Menu.TRADE_PURCHASE}>
      <StatBar.Container>
        <StatBar.Item icon={<TbHome2 />} label="관리 매입처" value={"-"} />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="매입 등록"
          onClick={() => setOpenStockUpsert("CREATE_ORDER")}
        />
        <div className="flex-1" />
        {only &&
          (only.status === "OFFER_PREPARING" ||
            only.status === "OFFER_REJECTED" ||
            only.status === "ORDER_PREPARING" ||
            only.status === "ORDER_REJECTED") && (
            <Toolbar.ButtonPreset.Delete
              label="매입 삭제"
              onClick={cmdDelete}
            />
          )}
        {only &&
          only.status === "ACCEPTED" &&
          only.dstCompany.managedById !== null && (
            <Toolbar.ButtonPreset.Delete
              label="매입 취소"
              onClick={cmdCancel}
            />
          )}
        <Toolbar.ButtonPreset.Update
          label="매입 정보 상세"
          onClick={() => only && setOpenStockUpsert(only.id)}
          disabled={!only}
        />
      </Toolbar.Container>
      <Search
        items={[
          {
            type: "select-order-type",
            field: "orderTypes",
            label: "매입 유형",
            trade: "PURCHASE",
          },
          {
            type: "select-company-purchase",
            field: "dstCompanyId",
            label: "매입처",
          },
          {
            type: "text",
            field: "orderNo",
            label: "매입 번호",
          },
          {
            type: "date-range",
            field: "orderDate",
            label: "매입일",
          },
          {
            type: "date-range",
            field: "wantedDate",
            label: "도착 희망일",
          },
          {
            type: "select-order-status",
            field: "status",
            label: "매입 상태",
            trade: "PURCHASE",
          },
          {
            type: "select-order-process-status",
            field: "processStauts",
            label: "공정 상태",
          },
          {
            type: "select-order-release-status",
            field: "releaseStatus",
            label: "출고 상태",
          },
          {
            type: "select-order-shipping-status",
            field: "invoiceStatus",
            label: "배송 상태",
          },
          {
            type: "select-packaging",
            field: "packagingIds",
            label: "포장",
          },
          {
            type: "select-papertype",
            field: "paperTypeIds",
            label: "종이",
          },
          {
            type: "select-manufacturer",
            field: "manufacturerIds",
            label: "제지사",
          },
          {
            type: "range",
            field: "grammage",
            label: "평량",
            min: 0,
            max: 9999,
          },
          {
            type: "range",
            field: "sizeX",
            label: "지폭",
            min: 0,
            max: 9999,
          },
        ]}
        value={search}
        onSearch={setSearch}
      />
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => `${record.id}`}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "매입 유형",
            render: (_value, record) => (
              <div>
                {Util.orderTypeToString(
                  record.orderType,
                  !!record.depositEvent,
                  "PURCHASE"
                )}
              </div>
            ),
          },
          {
            title: "매입 번호",
            render: (record: RecordType) => (
              <div className="font-fixed">
                {Util.formatSerial(record.orderNo)}
              </div>
            ),
          },
          ...partnerColumn,
          {
            title: "매입일",
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
            title: "매입 상태",
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
          {
            title: "공정 상태",
            render: (record: Model.Order) =>
              record.dstCompany.managedById === null &&
              progressColumn(["CONVERTING", "GUILLOTINE"], findPlan(record)),
          },
          {
            title: "출고 상태",
            render: (record: Model.Order) =>
              record.dstCompany.managedById === null &&
              progressColumn(["RELEASE"], findPlan(record)),
          },
          {
            title: "배송 상태",
            render: (record: Model.Order) =>
              record.dstCompany.managedById === null &&
              shippingStatusColumn(findPlan(record)),
          },
          ...Table.Preset.columnStockGroup<Model.Order>((record) =>
            Util.assignStockFromOrder(record)
          ),
          ...Table.Preset.columnQuantity<Model.Order>(
            (record) => Util.assignStockFromOrder(record),
            (record) => Util.assignQuantityFromOrder(record),
            { prefix: "매입", negative: false }
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
