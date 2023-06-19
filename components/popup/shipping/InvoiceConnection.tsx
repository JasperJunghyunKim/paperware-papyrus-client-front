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
                render: (value: string) => (
                  <div className="font-fixed">{value}</div>
                ),
              },
              {
                title: "포장",
                dataIndex: ["packaging", "type"],
                render: (value, record) => (
                  <div className="font-fixed flex gap-x-1">
                    <div className="flex-initial flex flex-col justify-center text-lg">
                      <Icon.PackagingType
                        packagingType={record.packaging.type}
                      />
                    </div>
                    <div className="flex-initial flex flex-col justify-center">
                      {value}
                    </div>
                  </div>
                ),
              },
              {
                title: "제품 유형",
                dataIndex: ["product", "paperDomain", "name"],
              },
              {
                title: "제지사",
                dataIndex: ["product", "manufacturer", "name"],
              },
              {
                title: "지군",
                dataIndex: ["product", "paperGroup", "name"],
              },
              {
                title: "지종",
                dataIndex: ["product", "paperType", "name"],
              },
              {
                title: "평량",
                dataIndex: "grammage",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )} ${Util.UNIT_GPM}`}</div>
                ),
              },
              {
                title: "지폭",
                dataIndex: "sizeX",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )} mm`}</div>
                ),
              },
              {
                title: "지장",
                dataIndex: "sizeY",
                render: (value, record) =>
                  record.packaging.type !== "ROLL" ? (
                    <div className="text-right font-fixed">{`${Util.comma(
                      value
                    )} mm`}</div>
                  ) : null,
              },
              {
                title: "색군",
                dataIndex: ["paperColorGroup", "name"],
              },
              {
                title: "색상",
                dataIndex: ["paperColor", "name"],
              },
              {
                title: "무늬",
                dataIndex: ["paperPattern", "name"],
              },
              {
                title: "인증",
                dataIndex: ["paperCert", "name"],
              },
              {
                title: "수량",
                dataIndex: "quantity",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )}`}</div>
                ),
              },
            ]}
          />
        </div>
        <div className="basis-px bg-gray-200" />
        <div className="flex-initial flex justify-center gap-x-2 p-4">
          <Button.Default
            label="송장 등록"
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
