import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, Table, Toolbar } from "@/components";
import { useCallback, useEffect, useState } from "react";
import { InvoiceConnection } from ".";
import _ from "lodash";
import { match } from "ts-pattern";

type OpenType = number | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const info = ApiHook.Auth.useGetMe();

  const [page, setPage] = usePage();
  const list = ApiHook.Shipping.Invoice.useGetList({
    query: {
      shippingId: props.open ? props.open : undefined,
    },
  });

  const [selected, setSelected] = useState<Model.Invoice[]>([]);
  const [openCreate, setOpenCreate] = useState<number | false>(false);

  const only = Util.only(selected);

  const apiDisconnect = ApiHook.Shipping.Invoice.useDisconnect();
  const cmdDisconnect = useCallback(async () => {
    if (!(await Util.confirm("송장을 연결 해제하시겠습니까?"))) {
      return;
    }

    await apiDisconnect.mutateAsync({
      data: { invoiceIds: selected.map((x) => x.id) },
    });

    setSelected([]);
  }, [apiDisconnect]);

  const apiForward = ApiHook.Shipping.Invoice.useForward();
  const cmdForward = useCallback(async () => {
    if (!(await Util.confirm("작업을 계속하시겠습니까?"))) {
      return;
    }

    await apiForward.mutateAsync({
      data: { invoiceIds: selected.map((x) => x.id) },
    });

    setSelected([]);
  }, [apiForward, selected]);

  const apiBackward = ApiHook.Shipping.Invoice.useBackward();
  const cmdBackward = useCallback(async () => {
    if (!(await Util.confirm("작업을 취소하시겠습니까?"))) {
      return;
    }

    await apiBackward.mutateAsync({
      data: { invoiceIds: selected.map((x) => x.id) },
    });

    setSelected([]);
  }, [apiBackward, selected]);

  useEffect(() => {
    if (!props.open) {
      setSelected([]);
    }
  }, [props.open]);

  const selectedStatusUnique = _.uniq(selected.map((x) => x.invoiceStatus));
  const selectedStatusUniqueOnly = Util.only(selectedStatusUnique);
  const invoiceForwardLabel = match(selectedStatusUniqueOnly)
    .with("WAIT_LOADING", () => "상차 대기")
    .with("WAIT_SHIPPING", () => "상차 시작")
    .with("ON_SHIPPING", () => "상차 완료")
    .otherwise(() => null);
  const invoiceBackwardLabel = match(selectedStatusUniqueOnly)
    .with("WAIT_SHIPPING", () => "상차 취소")
    .with("ON_SHIPPING", () => "상차 중지")
    .otherwise(() => null);

  return (
    <Popup.Template.Property
      title="배송 상세"
      width={"calc(100vw - 200px)"}
      height="500px"
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex-initial flex flex-row gap-2 justify-between">
          <Toolbar.Container>
            <Toolbar.ButtonPreset.Create
              label="송장 추가"
              onClick={() => setOpenCreate(props.open)}
            />
          </Toolbar.Container>
          <Toolbar.Container>
            {invoiceBackwardLabel && (
              <Toolbar.ButtonPreset.Continue
                label={invoiceBackwardLabel}
                onClick={cmdBackward}
              />
            )}
            {invoiceForwardLabel && (
              <Toolbar.ButtonPreset.Continue
                label={invoiceForwardLabel}
                onClick={cmdForward}
              />
            )}
            {only && (
              <Toolbar.ButtonPreset.Delete
                label="송장 연결 해제"
                onClick={cmdDisconnect}
              />
            )}
          </Toolbar.Container>
        </div>
        <div className="flex-1">
          <Table.Default<Model.Invoice>
            data={list.data}
            page={page}
            setPage={setPage}
            keySelector={(record) => record.id}
            selected={selected}
            onSelectedChange={setSelected}
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
              {
                title: "상태",
                dataIndex: "invoiceStatus",
                render: (value) => Util.formatInvoiceStatus(value),
              },
            ]}
          />
        </div>
      </div>
      <InvoiceConnection open={openCreate} onClose={setOpenCreate} />
    </Popup.Template.Property>
  );
}
