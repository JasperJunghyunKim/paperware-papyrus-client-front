import { Model } from "@/@shared";
import { Enum } from "@/@shared/models";
import { ApiHook, Util } from "@/common";
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

  const partnerColumn = Table.Preset.useColumnPartner<RecordType>(
    ["srcCompany", "companyRegistrationNumber"],
    { title: "매출처", fallback: (record) => record.srcCompany.businessName }
  );
  const [search, setSearch] = useState<any>({});
  const [page, setPage] = usePage();
  const list = ApiHook.Trade.Common.useGetList({
    query: {
      ...page,
      ...search,
      dstCompanyId: info.data?.companyId,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  const apiDelete = ApiHook.Trade.Common.useDelete();
  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(`선택한 매출(${only.orderNo})을 취소하시겠습니까?`))
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
      !(await Util.confirm(`선택한 매출(${only.orderNo})을 취소하시겠습니까?`))
    ) {
      return;
    }

    await apiCancel.mutateAsync({
      orderId: only.id,
    });

    setSelected([]);
  }, [apiCancel, only]);

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
              onClick={cmdDelete}
            />
          )}
        {only && only.status === "ACCEPTED" && (
          <Toolbar.ButtonPreset.Delete label="매출 취소" onClick={cmdCancel} />
        )}
        <Toolbar.ButtonPreset.Update
          label="매출 정보 상세"
          onClick={() => only && setOpenStockUpsert(only.id)}
          disabled={!only}
        />
      </Toolbar.Container>
      <Search
        items={[
          {
            type: "select-order-type",
            field: "orderTypes",
            label: "매출 유형",
            trade: "SALES",
          },
          {
            type: "select-company-sales",
            field: "srcCompanyId",
            label: "매출처",
          },
          {
            type: "text",
            field: "orderNo",
            label: "매출 번호",
          },
          {
            type: "date-range",
            field: "orderDate",
            label: "매출일",
          },
          {
            type: "date-range",
            field: "wantedDate",
            label: "납품 요청일",
          },
          {
            type: "select-order-status",
            field: "orderStatus",
            label: "매출 상태",
            trade: "SALES",
          },
          {
            type: "select-order-process-status",
            field: "taskStatus",
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
            label: "지종",
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
            type: "number",
            field: "sizeX",
            label: "지폭",
            min: 0,
            max: 9999,
          },
          {
            type: "number",
            field: "sizeY",
            label: "지장",
            min: 0,
            max: 9999,
          },
          {
            type: "select-book-close-method",
            field: "bookCloseMethods",
            label: "마감",
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
            title: "매출 유형",
            render: (_value, record) => (
              <div>
                {Util.orderTypeToString(
                  record.orderType,
                  !!record.depositEvent,
                  "SALES"
                )}
              </div>
            ),
          },
          {
            title: "매출 번호",
            render: (record: RecordType) => (
              <div className="font-fixed">
                {Util.formatSerial(record.orderNo)}
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
          {
            title: "공정 상태",
            render: (record: Model.Order) =>
              progressColumn(["CONVERTING", "GUILLOTINE"], findPlan(record)),
          },
          {
            title: "출고 상태",
            render: (record: Model.Order) =>
              progressColumn(["RELEASE"], findPlan(record)),
          },
          {
            title: "배송 상태",
            render: (record: Model.Order) =>
              shippingStatusColumn(findPlan(record)),
          },
          ...Table.Preset.columnStockGroup<Model.Order>((record) =>
            Util.assignStockFromOrder(record)
          ),
          ...Table.Preset.columnQuantity<Model.Order>(
            (record) => Util.assignStockFromOrder(record),
            (record) => Util.assignQuantityFromOrder(record),
            { prefix: "매출", negative: false }
          ),
          {
            title: "매입 공급가",
            render: (record: Model.Order) =>
              record.purchaseSuppliedPrice ? (
                <div className="font-fixed text-right">
                  {Util.comma(record.purchaseSuppliedPrice)} 원
                </div>
              ) : null,
          },
          {
            title: "매출 공급가",
            render: (record: Model.Order) =>
              record.salesSuppliedPrice ? (
                <div className="font-fixed text-right">
                  {Util.comma(record.salesSuppliedPrice)} 원
                </div>
              ) : null,
          },
          {
            title: "매출 이익",
            render: (record: Model.Order) =>
              record.salesProfit ? (
                <div className="font-fixed text-right">
                  {Util.comma(record.salesProfit)} 원
                </div>
              ) : null,
          },
          {
            title: "매출 이익율",
            render: (record: Model.Order) =>
              record.salesProfitRate ? (
                <div className="font-fixed text-right">
                  {Util.comma(record.salesProfitRate, 3)} %
                </div>
              ) : null,
          },
          {
            title: "마감",
            render: (record: Model.Order) => (
              <div>{record.taxInvoice ? "전자세금계산서" : ""}</div>
            ),
          },
        ]}
      />
      <Popup.Order.StockUpsert
        open={openStockUpsert}
        onClose={setOpenStockUpsert}
      />
    </Page>
  );
}
