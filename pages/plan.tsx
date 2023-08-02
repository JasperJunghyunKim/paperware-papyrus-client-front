import { Model } from "@/@shared";
import { PlanListItem } from "@/@shared/api";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Search, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";
import { TbHome, TbHomeShield } from "react-icons/tb";

type RecordType = PlanListItem;

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [search, setSearch] = useState<any>({});
  const [page, setPage] = usePage();
  const list = ApiHook.Working.Plan.useGetList({
    query: {
      ...page,
      ...search,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);

  const only = Util.only(selected);

  const apiDelete = ApiHook.Inhouse.Warehouse.useDelete();
  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(
        `선택한 작업 계획(${only.planNo})을 삭제하시겠습니까?`
      ))
    ) {
      return;
    }

    await apiDelete.mutateAsync(only.id);
  }, [apiDelete, only]);

  const progressColumn = useCallback(
    (type: Model.Enum.TaskType, record: RecordType) => {
      const preparing = record.task.filter(
        (p) => p.type === type && p.status === "PREPARING"
      );
      const progressing = record.task.filter(
        (p) => p.type === type && p.status === "PROGRESSING"
      );
      const progressed = record.task.filter(
        (p) => p.type === type && p.status === "PROGRESSED"
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
          {type !== "RELEASE" && (
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

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  return (
    <Page title="작업 계획 목록" menu={Const.Menu.PLAN}>
      <StatBar.Container>
        <StatBar.Item icon={<TbHome />} label="작업 계획" value={"-"} />
        <StatBar.Item
          icon={<TbHomeShield />}
          label="작업 계획"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="상세 정보"
            onClick={() => setOpenUpdate(only.id)}
          />
        )}
      </Toolbar.Container>
      <Search
        items={[
          { type: "text", field: "planNo", label: "작업 번호" },
          {
            type: "select-converting-status",
            field: "convertingStatus",
            label: "컨버팅 상태",
          },
          {
            type: "select-guillotine-status",
            field: "guillotineStatus",
            label: "길로틴 상태",
          },
          {
            type: "select-release-status",
            field: "releaseStatus",
            label: "출고 상태",
          },
          {
            type: "select-company-registration-number",
            field: "partnerCompanyRegistrationNumbers",
            label: "납품처",
          },
          {
            type: "date-range",
            field: "wantedDate",
            label: "납품 요청일",
          },
          {
            type: "select-arrived",
            field: "arrived",
            label: "수급 여부",
          },
          {
            type: "select-warehouse",
            field: "warehouseIds",
            label: "창고",
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
        ]}
        value={search}
        onSearch={setSearch}
      />
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "주문 번호",
            render: (record: RecordType) => (
              <div className="font-fixed">
                {Util.formatSerial(
                  record.orderStock?.order.orderNo ??
                    record.orderProcess?.order.orderNo ??
                    record.planNo
                )}
              </div>
            ),
          },
          {
            title: "컨버팅 상태",
            render: (record: RecordType) =>
              progressColumn("CONVERTING", record),
          },
          {
            title: "길로틴 상태",
            render: (record: RecordType) =>
              progressColumn("GUILLOTINE", record),
          },
          {
            title: "출고 상태",
            render: (record: RecordType) => progressColumn("RELEASE", record),
          },
          {
            title: "작업 유형",
            render: (_value: any, record: RecordType) =>
              Util.formatPlanType(record.type),
          },
          ...Table.Preset.useColumnPartner2({
            title: "납품처",
            getValue: (record: RecordType) =>
              record.type === "TRADE_OUTSOURCE_PROCESS_SELLER"
                ? record.orderProcess?.order.srcCompany
                    .companyRegistrationNumber
                : record.type === "TRADE_OUTSOURCE_PROCESS_BUYER"
                ? record.orderProcess?.order.dstCompany
                    .companyRegistrationNumber
                : record.orderStock?.order.srcCompany.companyRegistrationNumber,
          }),
          {
            title: "납품 도착지",
            render: (_, record: RecordType) =>
              record.type === "TRADE_OUTSOURCE_PROCESS_SELLER"
                ? record.orderProcess?.srcLocation.name
                : record.type === "TRADE_OUTSOURCE_PROCESS_BUYER"
                ? record.orderProcess?.dstLocation.name
                : record.orderStock?.dstLocation.name ?? "",
          },
          {
            title: "납품 요청일",
            render: (_, record: RecordType) => (
              <div className="font-fixed">
                {Util.formatIso8601ToLocalDate(
                  record.type === "TRADE_OUTSOURCE_PROCESS_SELLER"
                    ? record.orderProcess?.srcWantedDate ?? null
                    : record.type === "TRADE_OUTSOURCE_PROCESS_BUYER"
                    ? record.orderProcess?.dstWantedDate ?? null
                    : record.orderStock?.wantedDate ?? null
                )}
              </div>
            ),
          },
          {
            title: "수급 도착지",
            render: (_, record: RecordType) =>
              (record.assignStockEvent?.stock as any).plan?.type ===
              "TRADE_OUTSOURCE_PROCESS_SELLER"
                ? (record.assignStockEvent?.stock as any).plan?.orderProcess
                    ?.dstLocation.name
                : (record.assignStockEvent?.stock as any).plan?.type ===
                  "TRADE_OUTSOURCE_PROCESS_BUYER"
                ? (record.assignStockEvent?.stock as any).plan?.orderProcess
                    ?.srcLocation.name
                : (record.assignStockEvent?.stock as any).plan?.orderStock
                    ?.dstLocation.name ??
                  (record.assignStockEvent?.stock as any).plan?.planShipping
                    ?.dstLocation.name,
          },
          {
            title: "수급 예정일",
            render: (_, record) => (
              <div className="font-fixed">
                {Util.formatIso8601ToLocalDate(
                  (record.assignStockEvent?.stock as any).plan?.type ===
                    "TRADE_OUTSOURCE_PROCESS_SELLER"
                    ? (record.assignStockEvent?.stock as any).plan.orderProcess
                        ?.dstWantedDate ?? null
                    : (record.assignStockEvent?.stock as any).plan?.type ===
                      "TRADE_OUTSOURCE_PROCESS_BUYER"
                    ? (record.assignStockEvent?.stock as any).plan.orderProcess
                        ?.srcWantedDate ?? null
                    : (record.assignStockEvent?.stock as any).plan?.orderStock
                        ?.wantedDate ??
                      (record.assignStockEvent?.stock as any).plan?.planShipping
                        ?.wantedDate ??
                      null
                )}
              </div>
            ),
          },
          {
            title: "창고",
            render: (_, record) =>
              record.assignStockEvent?.stock.warehouse?.name,
          },
          ...Table.Preset.columnStockGroup<RecordType>(
            (record) => record.assignStockEvent?.stock
          ),
          ...Table.Preset.columnQuantity<RecordType>(
            (record) => record.assignStockEvent?.stock,
            (record) => record.assignStockEvent?.change,
            { prefix: "사용 예정", negative: true }
          ),
        ]}
      />
      <Popup.Plan.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.Plan.Update open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}
