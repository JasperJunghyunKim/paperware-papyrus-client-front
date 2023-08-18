import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Icon, Popup, Table } from "@/components";
import { useCallback, useEffect, useState } from "react";

type OpenType = number | false;
export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [groupPage, setGroupPage] = usePage();
  const groupList = ApiHook.Shipping.Invoice.useGetList({
    query: {
      ...groupPage,
      shippingId: null,
    },
  });
  const [selectedGroup, setSelectedGroup] = useState<Model.Invoice[]>([]);

  const apiConnect = ApiHook.Shipping.Shipping.useConnectInvoices();
  const cmdConnect = useCallback(async () => {
    if (!props.open) {
      return;
    }

    if (!(await Util.confirm("송장을 연결하시겠습니까?"))) {
      return;
    }

    await apiConnect.mutateAsync({
      shippingId: props.open,
      data: {
        invoiceIds: selectedGroup.map((x) => x.id),
      },
    });

    props.onClose(false);
  }, [apiConnect, props.open, selectedGroup]);

  useEffect(() => {
    if (props.open) {
      setSelectedGroup([]);
    }
  }, [props.open]);

  return (
    <Popup.Template.Full
      title="미상차 운송장 목록"
      {...props}
      open={!!props.open}
      width="calc(100vw - 200px)"
      height="600px"
    >
      <div className="flex flex-col w-full h-full">
        <div className="flex-1">
          <Table.Default<Model.Invoice>
            data={groupList.data}
            keySelector={(record) => `${record.id}`}
            selected={selectedGroup}
            onSelectedChange={setSelectedGroup}
            selection="multiple"
            columns={[
              {
                title: "송장 번호",
                dataIndex: "invoiceNo",
                render: (value) => (
                  <div className="flex">
                    <div className="flex font-fixed bg-red-100 px-1 text-red-800 rounded-md border border-solid border-red-300">
                      {Util.formatSerial(value)}
                    </div>
                  </div>
                ),
              },
              {
                title: "도착지",
                render: (_, record) =>
                  record.plan?.orderStock?.dstLocation.name ??
                  record.plan?.orderProcess?.srcLocation.name,
              },
              {
                title: "주소",
                render: (_, record) =>
                  Util.formatAddress(
                    record.plan.orderStock?.dstLocation.address ??
                      record.plan.orderProcess?.srcLocation.address
                  ),
              },
              {
                title: "예정일",
                render: (_, record) => (
                  <div className="font-fixed">
                    {Util.formatIso8601ToLocalDate(
                      record.plan?.orderStock?.wantedDate ??
                        record.plan?.orderProcess?.srcWantedDate ??
                        null
                    )}
                  </div>
                ),
              },
              ...Table.Preset.columnPackagingType<Model.Invoice>(
                (p) => p.packaging
              ),
              {
                title: "지종",
                render: (_value: any, record: Model.Invoice) =>
                  record.product.paperType.name,
              },
              {
                title: "제지사",
                render: (_value: any, record: Model.Invoice) =>
                  record.product.manufacturer.name,
              },
              {
                title: "평량",
                render: (_value: any, record: Model.Invoice) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    record.grammage
                  )} ${Util.UNIT_GPM}`}</div>
                ),
              },
              {
                title: "규격",
                render: (_value: any, record: Model.Invoice) => (
                  <div className="font-fixed">
                    {
                      Util.findPaperSize(record.sizeX ?? 1, record.sizeY ?? 1)
                        ?.name
                    }
                  </div>
                ),
              },
              {
                title: "지폭",
                render: (_value: any, record: Model.Invoice) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    record.sizeX
                  )} mm`}</div>
                ),
              },
              {
                title: "지장",
                render: (_value: any, record: Model.Invoice) =>
                  record.packaging?.type !== "ROLL" && record.sizeY ? (
                    <div className="text-right font-fixed">{`${Util.comma(
                      record.sizeY
                    )} mm`}</div>
                  ) : null,
              },
              {
                title: "색상",
                render: (_value: any, record: Model.Invoice) =>
                  record.paperColor?.name,
              },
              {
                title: "무늬",
                render: (_value: any, record: Model.Invoice) =>
                  record.paperPattern?.name,
              },
              {
                title: "인증",
                render: (_value: any, record: Model.Invoice) =>
                  record.paperCert?.name,
              },
              ...Table.Preset.columnQuantity<Model.Invoice>(
                (p) => p,
                (p) => p.quantity,
                {}
              ),
            ]}
          />
        </div>
        <div className="basis-px bg-gray-200" />
        <div className="flex-initial flex justify-center gap-x-2 p-4">
          <Button.Default
            label="상차"
            onClick={cmdConnect}
            type="primary"
            disabled={selectedGroup.length === 0}
          />
          <Button.Default label="취소" onClick={() => props.onClose(false)} />
        </div>
      </div>
    </Popup.Template.Full>
  );
}
