import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import classNames from "classnames";
import { useCallback, useState } from "react";
import { TbHome, TbHomeShield } from "react-icons/tb";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Working.Plan.useGetList({ query: page });
  const [selected, setSelected] = useState<Model.Plan[]>([]);

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
      <Table.Default<Model.Plan>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "주문 번호",
            render: (record: Model.Plan) => (
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
            title: "상태",
            dataIndex: "status",
            render: (value: Model.Enum.PlanStatus) => (
              <div
                className={classNames("flex gap-x-2", {
                  "text-amber-600": value === "PREPARING",
                  "text-green-600": value === "PROGRESSING",
                  "text-black": value === "PROGRESSED",
                })}
              >
                <div className="flex-initial flex flex-col justify-center">
                  <Icon.PlanStatus value={value} />
                </div>
                <div className="flex-initial flex flex-col justify-center">
                  {Util.planStatusToString(value)}
                </div>
              </div>
            ),
          },
          {
            title: "작업 유형",
            render: (_value: any, record: Model.Plan) =>
              Util.formatPlanType(record.type),
          },
          ...Table.Preset.useColumnPartner2({
            title: "납품처",
            getValue: (record: Model.Plan) =>
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
            render: (_, record) =>
              record.type === "TRADE_OUTSOURCE_PROCESS_SELLER"
                ? record.orderProcess?.srcLocation.name
                : record.type === "TRADE_OUTSOURCE_PROCESS_BUYER"
                ? record.orderProcess?.dstLocation.name
                : record.orderStock?.dstLocation.name ?? "",
          },
          {
            title: "납품 요청일",
            render: (_, record) => (
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
          ...Table.Preset.columnStockGroup<Model.Plan>(
            (record) => record.assignStockEvent?.stock
          ),
          ...Table.Preset.columnQuantity<Model.Plan>(
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
