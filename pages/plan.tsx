import { Model } from "@/@shared";
import { PlanListItem } from "@/@shared/api";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import classNames from "classnames";
import { useCallback, useState } from "react";
import { TbHome, TbHomeShield } from "react-icons/tb";

type RecordType = PlanListItem;

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Working.Plan.useGetList({ query: page });
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

  return (
    <Page title="작업 계획 목록">
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
                : record.orderStock?.order.dstCompany.companyRegistrationNumber,
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
          },
          {
            title: "수급 예정일",
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
