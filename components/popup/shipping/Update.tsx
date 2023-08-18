import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Icon, Popup, Table, Toolbar } from "@/components";
import { useCallback, useEffect, useState } from "react";
import { InvoiceConnection } from ".";
import _ from "lodash";
import { match } from "ts-pattern";
import { Form, Input, Select } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { ShippingUpdateRequest } from "@/@shared/api";
import {
  Number,
  SelectCompanyRegistrationNumber,
  SelectUser,
} from "@/components/formControl";
import * as R from "@/common/rules";
import { TbCircleCheck } from "react-icons/tb";

type OpenType = number | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const info = ApiHook.Auth.useGetMe();

  const [form] = useForm<ShippingUpdateRequest>();

  const item = ApiHook.Shipping.Shipping.useGetItem({
    shippingId: props.open ? props.open : null,
  });
  const type = item.data?.type;

  const [page, setPage] = usePage();
  const list = ApiHook.Shipping.Invoice.useGetList({
    query: {
      shippingId: props.open ? props.open : undefined,
    },
  });

  const [selected, setSelected] = useState<Model.Invoice[]>([]);
  const [openCreate, setOpenCreate] = useState<number | false>(false);

  const only = Util.only(selected);

  const apiUpdate = ApiHook.Shipping.Shipping.useUpdate();
  const cmdUpdate = useCallback(async () => {
    if (!props.open) return;

    const values = await form.validateFields();
    await apiUpdate.mutateAsync({
      shippingId: props.open,
      data: values,
    });
  }, [apiUpdate, form, props.open]);

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

  useEffect(() => {
    if (item.data) {
      form.setFieldsValue({
        companyRegistrationNumber:
          item.data.companyRegistrationNumber ?? undefined,
        memo: item.data.memo,
        price: item.data.price ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [item.data]);

  const selectedStatusUnique = _.uniq(selected.map((x) => x.invoiceStatus));
  const selectedStatusUniqueOnly = Util.only(selectedStatusUnique);
  const invoiceForwardLabel = match(selectedStatusUniqueOnly)
    .with("WAIT_SHIPPING", () => "배송 시작")
    .with("ON_SHIPPING", () => "배송 완료")
    .otherwise(() => null);
  const invoiceBackwardLabel = match(selectedStatusUniqueOnly)
    .with("ON_SHIPPING", () => "배송 중지")
    .with("DONE_SHIPPING", () => "배송 취소")
    .otherwise(() => null);

  return (
    <Popup.Template.Property
      title="배송 상세"
      width={"calc(100vw - 200px)"}
      height="700px"
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 flex">
        <div className="flex-initial basis-[500px] p-4 overflow-y-scroll">
          <Form form={form} layout="vertical">
            <Form.Item label="배송 구분">
              <Select
                disabled
                value={item.data?.type}
                options={[
                  { label: "자사 배송", value: "INHOUSE" },
                  { label: "거래처 픽업", value: "PARTNER_PICKUP" },
                  { label: "외주 배송", value: "OUTSOURCE" },
                ]}
              />
            </Form.Item>
            <Form.Item label="배송 번호">
              <Input
                disabled
                value={Util.formatSerial(item.data?.shippingNo ?? null)}
              />
            </Form.Item>
            <Form.Item label="운송장 개수">
              <Input disabled value={item.data?.invoiceCount} />
            </Form.Item>
            <Form.Item label="배송 중량">
              <Input
                disabled
                value={`${Util.comma(item.data?.invoiceWeight, 3)}`}
                addonAfter="T"
              />
            </Form.Item>
            {type === "INHOUSE" && (
              <Form.Item label="배송 담당자">
                <Input disabled value={item.data?.manager?.name} />
              </Form.Item>
            )}
            {type !== "INHOUSE" && (
              <Form.Item label="거래처" name="companyRegistrationNumber">
                <SelectCompanyRegistrationNumber />
              </Form.Item>
            )}
            {type !== "INHOUSE" && (
              <Form.Item label="금액" name="price">
                <Number />
              </Form.Item>
            )}
            <Form.Item
              label="배송 메모"
              name="memo"
              rules={type === "INHOUSE" ? [] : [R.required()]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="생성자">
              <Input disabled value={item.data?.createdByUser.name} />
            </Form.Item>
            <Form.Item label="생성일시">
              <Input
                disabled
                value={
                  item.data
                    ? Util.formatIso8601ToLocalDateTime(item.data?.createdAt)
                    : ""
                }
              />
            </Form.Item>
            <div className="flex-initial flex gap-x-2 mt-4">
              <Button.Default
                label="저장"
                icon={<TbCircleCheck />}
                type="primary"
                onClick={cmdUpdate}
              />
            </div>
            <div className="h-32" />
          </Form>
        </div>
        <div className="flex-initial basis-px bg-gray-200" />
        <div className="flex-1 w-0 flex flex-col gap-y-4 p-4 ">
          <div className="flex-initial flex flex-row gap-2 justify-between">
            <Toolbar.Container>
              <Toolbar.ButtonPreset.Create
                label="송장 추가"
                onClick={() => setOpenCreate(props.open)}
              />
            </Toolbar.Container>
            <Toolbar.Container>
              {only && only.invoiceStatus === "WAIT_SHIPPING" && (
                <Toolbar.ButtonPreset.Delete
                  label="상차 취소"
                  onClick={cmdDisconnect}
                />
              )}
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
            </Toolbar.Container>
          </div>
          <div className="flex-1 overflow-y-scroll">
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
                {
                  title: "상태",
                  dataIndex: "invoiceStatus",
                  render: (value) => Util.formatInvoiceStatus(value),
                },
              ]}
            />
          </div>
        </div>
      </div>
      <InvoiceConnection open={openCreate} onClose={setOpenCreate} />
    </Popup.Template.Property>
  );
}
