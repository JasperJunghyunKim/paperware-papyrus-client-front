import { Api, Model } from "@/@shared";
import { Button, FormControl, Popup, Table, Toolbar } from "@/components";
import { Form, Input, Steps } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Number } from "@/components/formControl";
import { ApiHook, Util } from "@/common";
import { OrderStatus } from "@/@shared/models/enum";
import { usePage } from "@/common/hook";
import { CreateArrival } from ".";
import {
  TbAB,
  TbBrandMixpanel,
  TbHandStop,
  TbInfoCircle,
  TbSend,
  TbSquare,
} from "react-icons/tb";
import _ from "lodash";

export type OrderId = number;
export type OrderUpsertOpen = "CREATE_ORDER" | "CREATE_OFFER" | OrderId | false;
const REQUIRED_RULES = [{ required: true }];

function title(open: OrderUpsertOpen) {
  return open === "CREATE_ORDER"
    ? "정상 매입 등록"
    : open === "CREATE_OFFER"
    ? "정상 매출 등록"
    : null;
}

export interface Props {
  open: OrderUpsertOpen;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const me = ApiHook.Auth.useGetMe();
  const [initialOrderId, setInitialOrderId] = useState<OrderId | null>(null);
  const order = ApiHook.Trade.OrderStock.useGetItem({ id: initialOrderId });

  const isOffer = props.open === "CREATE_OFFER";
  const isSales = isOffer || me.data?.companyId === order.data?.dstCompany.id;

  useEffect(() => {
    if (typeof props.open === "number") {
      setInitialOrderId(props.open);
    } else {
      setInitialOrderId(null);
    }
  }, [props.open]);

  const apiRequest = ApiHook.Trade.OrderStock.useRequest();
  const cmdRequest = useCallback(async () => {
    if (!order.data) return;
    if (!(await Util.confirm("주문을 요청하시겠습니까?"))) return;
    await apiRequest.mutateAsync({
      orderId: order.data.id,
    });
  }, [apiRequest, order.data]);

  const apiAccept = ApiHook.Trade.OrderStock.useAccept();
  const cmdAccept = useCallback(
    (virtual: boolean) => async () => {
      if (!order.data) return;
      if (
        !(await Util.confirm(
          virtual
            ? "가상 매입처 대상 주문은 즉시 승인됩니다. 계속하시겠습니까?"
            : "재고를 승인하시겠습니까?"
        ))
      )
        return;
      await apiAccept.mutateAsync({
        orderId: order.data.id,
      });
    },
    [apiAccept, order.data]
  );

  const apiReject = ApiHook.Trade.OrderStock.useReject();
  const cmdReject = useCallback(async () => {
    if (!order.data) return;
    if (!(await Util.confirm("재고를 거절하시겠습니까?"))) return;
    await apiReject.mutateAsync({
      orderId: order.data.id,
    });
  }, [apiReject, order.data]);

  const apiCancel = ApiHook.Trade.OrderStock.useCancel();
  const cmdCancel = useCallback(async () => {
    if (!order.data) return;
    if (!(await Util.confirm("주문을 삭제하시겠습니까?"))) return;
    await apiCancel.mutateAsync({
      orderId: order.data.id,
    });
  }, [apiCancel, order.data]);

  const apiReset = ApiHook.Trade.OrderStock.useReset();
  const cmdReset = useCallback(async () => {
    if (!order.data) return;
    if (!(await Util.confirm("주문 내용을 재입력하시겠습니까?"))) return;
    await apiReset.mutateAsync({
      orderId: order.data.id,
    });
  }, [apiReset, order.data]);

  const skeleton = useCallback(() => {
    const wordKind = isSales ? "매출" : "매입";

    if (!order.data) {
      return (
        <RightSideSkeleton
          icon={<TbInfoCircle />}
          title={`${wordKind} 정보를 입력한 후 등록하세요.`}
        />
      );
    }
    switch (order.data.status) {
      case "OFFER_PREPARING":
        return isSales ? (
          order.data.srcCompany.managedById !== null ? (
            <RightSideSkeleton
              icon={<TbAB />}
              title={`매출 재고를 선택하고 가상 매출처 대상 매출 등록을 완료하세요.`}
              buttons={[
                {
                  fn: cmdAccept(true),
                  label: `매입 등록 완료`,
                },
              ]}
            />
          ) : (
            <RightSideSkeleton
              icon={<TbAB />}
              title={`매출 원지 정보를 입력하고 재고 승인 요청을 보내세요.`}
              buttons={[
                {
                  fn: cmdRequest,
                  label: `재고 승인 요청`,
                },
              ]}
            />
          )
        ) : (
          <RightSideSkeleton />
        );
      case "OFFER_REQUESTED":
        return isSales ? (
          <RightSideSkeleton
            icon={<TbBrandMixpanel />}
            title={`매출처의 재고 승인을 기다리고 있습니다.`}
            phone={Util.formatPhoneNo(order.data.srcCompany.phoneNo)}
          />
        ) : (
          <RightSideSkeleton
            icon={<TbSend />}
            title={`재고 승인요청을 받았습니다. 거래를 계속하려면 주문을 승인하세요.`}
            phone={Util.formatPhoneNo(order.data.srcCompany.phoneNo)}
            buttons={[
              {
                fn: cmdAccept(order.data.srcCompany.managedById !== null),
                label: `주문 승인`,
              },
              {
                fn: cmdReject,
                label: `주문 거절`,
              },
            ]}
          />
        );
      case "OFFER_REJECTED":
        return isSales ? (
          <RightSideSkeleton
            icon={<TbHandStop />}
            title={`매출처의 재고 승인 요청이 거절되었습니다.`}
            phone={Util.formatPhoneNo(order.data.srcCompany.phoneNo)}
            buttons={[
              {
                fn: cmdReset,
                label: `수주 정보 재입력`,
              },
            ]}
          />
        ) : (
          <RightSideSkeleton title="재고 요청을 거절했습니다." />
        );
      case "ORDER_PREPARING":
        return !isSales ? (
          order.data.dstCompany.managedById !== null ? (
            <RightSideSkeleton
              icon={<TbAB />}
              title={`매입 재고를 선택하고 가상 매입처 대상 매입 등록을 완료하세요.`}
              buttons={[
                {
                  fn: cmdAccept(true),
                  label: `매입 등록 완료`,
                },
              ]}
            />
          ) : (
            <RightSideSkeleton
              icon={<TbAB />}
              title={`거래 하려는 매입처와 재고를 선택하고 발주 요청을 보내세요.`}
              buttons={[
                {
                  fn: cmdRequest,
                  label: `발주 요청`,
                },
              ]}
            />
          )
        ) : (
          <RightSideSkeleton />
        );
      case "ORDER_REQUESTED":
        return !isSales ? (
          <RightSideSkeleton
            icon={<TbBrandMixpanel />}
            title={`매입처의 주문 승인을 기다리고 있습니다.`}
            phone={Util.formatPhoneNo(order.data.dstCompany.phoneNo)}
          />
        ) : (
          <RightSideSkeleton
            icon={<TbSend />}
            title={`주문 승인요청을 받았습니다. 거래를 계속하려면 주문을 승인하세요.`}
            phone={Util.formatPhoneNo(order.data.dstCompany.phoneNo)}
            buttons={[
              {
                fn: cmdAccept(order.data.dstCompany.managedById !== null),
                label: `주문 승인`,
              },
              {
                fn: cmdReject,
                label: `주문 거절`,
              },
            ]}
          />
        );
      case "ORDER_REJECTED":
        return !isSales ? (
          <RightSideSkeleton
            icon={<TbHandStop />}
            title={`매입처의 주문 요청이 거절되었습니다.`}
            phone={Util.formatPhoneNo(order.data.dstCompany.phoneNo)}
            buttons={[
              {
                fn: cmdReset,
                label: `주문 재입력`,
              },
            ]}
          />
        ) : (
          <RightSideSkeleton title="주문 요청을 거절했습니다." />
        );
      case "ACCEPTED":
        return null;
      default:
        return null;
    }
  }, [order, isOffer, isSales]);

  return (
    <Popup.Template.Full
      title={title(props.open) ?? `${isSales ? "매출" : "매입"} 상세`}
      {...props}
      open={!!props.open}
      width="calc(100vw - 80px)"
      height="calc(100vh - 80px)"
    >
      <div className="w-full h-full flex">
        <div className="basis-[480px] flex-shrink-0 p-4 overflow-y-scroll">
          <DataForm
            isOffer={isOffer}
            isSales={isSales}
            initialOrder={order.data ?? null}
            onCreated={(p) => setInitialOrderId(p.id)}
          />
        </div>
        {skeleton() ??
          (isSales ? (
            <>
              <div className="basis-px bg-gray-200" />
              <RightSideSales order={order.data ?? null} />
            </>
          ) : (
            <>
              <div className="basis-px bg-gray-200" />
              <RightSideOrder order={order.data ?? null} />
            </>
          ))}
      </div>
    </Popup.Template.Full>
  );
}

interface DataFormProps {
  isOffer: boolean;
  isSales: boolean;
  initialOrder: Model.Order | null;
  onCreated: (order: Model.Order) => void;
}
function DataForm(props: DataFormProps) {
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();
  const me = ApiHook.Auth.useGetMe();

  const [form] = useForm<
    Api.OrderStockCreateRequest | Api.OrderStockUpdateRequest
  >();
  const [warehouse, setWarehouse] = useState<Partial<Model.Warehouse> | null>(
    null
  );
  const dstCompanyId = useWatch<number | null | undefined>(
    ["dstCompanyId"],
    form
  );
  const srcCompanyId = useWatch<number | null | undefined>(
    ["srcCompanyId"],
    form
  );
  const companies = ApiHook.Inhouse.BusinessRelationship.useGetList({
    query: {
      dstCompanyId: me.data?.companyId ?? undefined,
    },
  });

  const packagingId = useWatch(["packagingId"], form);
  const sizeX = useWatch(["sizeX"], form);
  const sizeY = useWatch(["sizeY"], form);
  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);

  const editable =
    props.initialOrder === null ||
    props.initialOrder.status === "OFFER_PREPARING" ||
    props.initialOrder.status === "ORDER_PREPARING";
  const manual =
    !props.isSales &&
    companies.data?.items.find((p) => p.srcCompany.id === dstCompanyId)
      ?.srcCompany.managedById !== null;

  useEffect(() => {
    if (props.initialOrder) {
      form.setFieldsValue({
        dstCompanyId: props.initialOrder.dstCompany.id,
        srcCompanyId: props.initialOrder.srcCompany.id,
        locationId: props.initialOrder.orderStock.dstLocation.id,
        wantedDate: props.initialOrder.wantedDate,
        warehouseId: props.initialOrder.orderStock.warehouse?.id,
        orderStockId: props.initialOrder.orderStock.orderStock?.id,
        productId: props.initialOrder.orderStock.product.id,
        packagingId: props.initialOrder.orderStock.packaging.id,
        grammage: props.initialOrder.orderStock.grammage,
        sizeX: props.initialOrder.orderStock.sizeX,
        sizeY: props.initialOrder.orderStock.sizeY,
        paperColorGroupId: props.initialOrder.orderStock.paperColorGroup?.id,
        paperColorId: props.initialOrder.orderStock.paperColor?.id,
        paperPatternId: props.initialOrder.orderStock.paperPattern?.id,
        paperCertId: props.initialOrder.orderStock.paperCert?.id,
        quantity: props.initialOrder.orderStock.quantity,
        memo: props.initialOrder.memo,
      });
      setWarehouse(props.initialOrder.orderStock.warehouse);
    } else {
      form.resetFields();
    }
  }, [form, props.initialOrder]);

  const apiCreate = ApiHook.Trade.OrderStock.useCreate();
  const cmdCreate = useCallback(async () => {
    const values = (await form.validateFields()) as Api.OrderStockCreateRequest;

    if (!me.data) {
      return;
    }

    if (props.isOffer) {
      return await apiCreate.mutateAsync({
        data: {
          ...values,
          dstCompanyId: me.data.companyId,
        },
      });
    } else {
      return await apiCreate.mutateAsync({
        data: {
          ...values,
          srcCompanyId: me.data.companyId,
        },
      });
    }
  }, [form, apiCreate, me, props.isOffer]);

  const apiUpdate = ApiHook.Trade.OrderStock.useUpdate();
  const cmdUpdate = useCallback(async () => {
    const values = (await form.validateFields()) as Api.OrderStockUpdateRequest;

    if (props.initialOrder === null) {
      return;
    }

    await apiUpdate.mutateAsync({
      orderId: props.initialOrder.id,
      data: {
        ...values,
      },
    });
  }, [form, apiUpdate, props.initialOrder]);

  const submit = useCallback(async () => {
    if (props.initialOrder) {
      await cmdUpdate();
    } else {
      const created = await cmdCreate();
      if (created) {
        props.onCreated(created);
      }
    }
  }, [cmdCreate, cmdUpdate, props.initialOrder]);

  return (
    <Form
      form={form}
      layout="vertical"
      rootClassName="w-full mb-32"
      onFinish={submit}
    >
      <FormControl.Util.Split
        label={props.isSales ? "매출 정보" : "매입 정보"}
      />
      {!props.isSales && (
        <Form.Item name="dstCompanyId" label="매입처" rules={REQUIRED_RULES}>
          <FormControl.SelectCompanyPurchase disabled={!editable} />
        </Form.Item>
      )}
      {props.isSales && (
        <Form.Item name="srcCompanyId" label="매출처" rules={REQUIRED_RULES}>
          <FormControl.SelectCompanySales disabled={!editable} />
        </Form.Item>
      )}
      {!props.isSales && dstCompanyId && (
        <Form.Item name="locationId" label="도착지" rules={REQUIRED_RULES}>
          <FormControl.SelectLocation disabled={!editable} />
        </Form.Item>
      )}
      {props.isSales && srcCompanyId && (
        <Form.Item name="locationId" label="도착지" rules={REQUIRED_RULES}>
          <FormControl.SelectLocationForSales
            companyId={srcCompanyId}
            disabled={!editable}
          />
        </Form.Item>
      )}
      <Form.Item name="wantedDate" label="도착 희망일" rules={REQUIRED_RULES}>
        <FormControl.DatePicker disabled={!editable} />
      </Form.Item>
      {(srcCompanyId || dstCompanyId) && (
        <>
          <FormControl.Util.Split
            label={props.isSales ? "수주 원지 정보" : "주문 원지 정보"}
          />
          {editable && props.isSales && (
            <div className="flex-initial flex mb-4">
              <Button.Preset.SelectStockGroupInhouse
                onSelect={(stockGroup) => {
                  setWarehouse(stockGroup.warehouse);
                  form.setFieldsValue({
                    warehouseId: stockGroup.warehouse?.id,
                    orderStockId: stockGroup.orderStock?.id,
                    productId: stockGroup.product.id,
                    packagingId: stockGroup.packaging.id,
                    grammage: stockGroup.grammage,
                    sizeX: stockGroup.sizeX,
                    sizeY: stockGroup.sizeY,
                    paperColorGroupId: stockGroup.paperColorGroup?.id,
                    paperColorId: stockGroup.paperColor?.id,
                    paperPatternId: stockGroup.paperPattern?.id,
                    paperCertId: stockGroup.paperCert?.id,
                  });
                }}
                rootClassName="flex-1"
              />
            </div>
          )}
          {editable && !props.isSales && !manual && (
            <div className="flex-initial flex mb-4">
              <Button.Preset.SelectPartnerStockGroup
                companyId={dstCompanyId ?? null}
                onSelect={(stockGroup) => {
                  setWarehouse(stockGroup.warehouse);
                  form.setFieldsValue({
                    warehouseId: stockGroup.warehouse?.id,
                    orderStockId: stockGroup.orderStock?.id,
                    productId: stockGroup.product.id,
                    packagingId: stockGroup.packaging.id,
                    grammage: stockGroup.grammage,
                    sizeX: stockGroup.sizeX,
                    sizeY: stockGroup.sizeY,
                    paperColorGroupId: stockGroup.paperColorGroup?.id,
                    paperColorId: stockGroup.paperColor?.id,
                    paperPatternId: stockGroup.paperPattern?.id,
                    paperCertId: stockGroup.paperCert?.id,
                  });
                }}
                rootClassName="flex-1"
              />
            </div>
          )}
          {!manual && (
            <>
              {props.isSales ? (
                <Form.Item name="warehouseId" label="창고">
                  <FormControl.SelectWarehouse disabled />
                </Form.Item>
              ) : (
                <Form.Item
                  name="warehouseId"
                  label="창고"
                  rules={[{ required: true }]}
                >
                  <Input value={warehouse?.name} disabled />
                </Form.Item>
              )}
              <Form.Item label="창고 주소" rules={[{ required: true }]}>
                <Input
                  value={Util.formatAddress(warehouse?.address)}
                  disabled
                />
              </Form.Item>
            </>
          )}
          <Form.Item name="productId" label="제품" rules={[{ required: true }]}>
            <FormControl.SelectProduct disabled={!editable || !manual} />
          </Form.Item>
          <Form.Item
            name="packagingId"
            label="포장"
            rules={[{ required: true }]}
          >
            <FormControl.SelectPackaging disabled={!editable || !manual} />
          </Form.Item>
          <Form.Item
            name="grammage"
            label="평량"
            rules={[{ required: true }]}
            rootClassName="flex-1"
          >
            <Number
              min={0}
              max={9999}
              precision={0}
              unit={Util.UNIT_GPM}
              disabled={!editable || !manual}
            />
          </Form.Item>
          {packaging && (
            <Form.Item>
              <div className="flex justify-between gap-x-2">
                {packaging.type !== "ROLL" && (
                  <Form.Item label="규격" rootClassName="flex-1">
                    <FormControl.Util.PaperSize
                      sizeX={sizeX}
                      sizeY={sizeY}
                      onChange={(sizeX, sizeY) =>
                        form.setFieldsValue({ sizeX, sizeY })
                      }
                      disabled={!editable || !manual}
                    />
                  </Form.Item>
                )}
                <Form.Item
                  name="sizeX"
                  label="지폭"
                  rules={[{ required: true }]}
                  rootClassName="flex-1"
                >
                  <Number
                    min={0}
                    max={9999}
                    precision={0}
                    unit="mm"
                    disabled={!editable || !manual}
                  />
                </Form.Item>
                {packaging.type !== "ROLL" && (
                  <Form.Item
                    name="sizeY"
                    label="지장"
                    rules={[{ required: true }]}
                    rootClassName="flex-1"
                  >
                    <Number
                      min={0}
                      max={9999}
                      precision={0}
                      unit="mm"
                      disabled={!editable || !manual}
                    />
                  </Form.Item>
                )}
              </div>
            </Form.Item>
          )}
          <Form.Item name="paperColorGroupId" label="색군">
            <FormControl.SelectColorGroup disabled={!editable || !manual} />
          </Form.Item>
          <Form.Item name="paperColorId" label="색상">
            <FormControl.SelectColor disabled={!editable || !manual} />
          </Form.Item>
          <Form.Item name="paperPatternId" label="무늬">
            <FormControl.SelectPattern disabled={!editable || !manual} />
          </Form.Item>
          <Form.Item name="paperCertId" label="인증">
            <FormControl.SelectCert disabled={!editable || !manual} />
          </Form.Item>
          <FormControl.Util.Split label="수량 정보" />
        </>
      )}
      {packaging && (
        <Form.Item name="quantity" label="매입 수량">
          <FormControl.Quantity packaging={packaging} disabled={!editable} />
        </Form.Item>
      )}
      <FormControl.Util.Split label="기타" />
      <Form.Item name="memo" label="기타 요청사항">
        <Input.TextArea maxLength={100} disabled={!editable} />
      </Form.Item>
      {editable && (
        <div className="flex-initial flex justify-end">
          <Button.Preset.Submit
            label={`${props.isSales ? "수주" : "주문"} 정보 ${
              props.initialOrder ? "수정" : "등록"
            }`}
          />
        </div>
      )}
    </Form>
  );
}

interface RightSideSkeletonProps {
  icon?: ReactNode;
  title?: string;
  phone?: string;
  buttons?: {
    fn: () => Promise<void>;
    label: string;
  }[];
}
function RightSideSkeleton(props: RightSideSkeletonProps) {
  return (
    <>
      <div className="basis-px bg-gray-200" />
      <div className="flex-1 w-0 flex flex-col justify-center select-none gap-y-4">
        <div className="flex-initial flex justify-center text-gray-400 text-8xl">
          {props.icon ?? <TbSquare />}
        </div>
        {props.title && (
          <div className="flex-initial flex justify-center text-gray-400">
            {props.title}
          </div>
        )}
        {props.phone && (
          <div className="flex-initial flex justify-center text-cyan-800">
            (거래처: {props.phone})
          </div>
        )}
        {props.buttons && (
          <div className="flex-initial flex justify-center gap-x-4">
            {props.buttons.map((button, i) => (
              <Button.Default
                key={i}
                type="secondary"
                label={button.label}
                onClick={button.fn}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

interface RightSideOrderProps {
  order: Model.Order | null;
}
function RightSideOrder(props: RightSideOrderProps) {
  const [open, setOpen] = useState<number | false>(false);

  const accepted =
    props.order && Util.inc<OrderStatus>(props.order.status, "ACCEPTED");

  const [page, setPage] = usePage();
  const list = ApiHook.Trade.OrderStock.useGetOrderStockArrivalList({
    orderId: props.order?.id ?? null,
    query: page,
  });

  const apiRequest = ApiHook.Trade.OrderStock.useRequest();
  const cmdRequest = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("주문을 요청하시겠습니까?"))) return;
    await apiRequest.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiRequest, props.order]);

  const apiAccept = ApiHook.Trade.OrderStock.useAccept();
  const cmdAccept = useCallback(
    (virtual: boolean) => async () => {
      if (!props.order) return;
      if (
        !(await Util.confirm(
          virtual
            ? "가상 매입처 대상 주문은 즉시 승인됩니다. 계속하시겠습니까?"
            : "재고를 승인하시겠습니까?"
        ))
      )
        return;
      await apiAccept.mutateAsync({
        orderId: props.order.id,
      });
    },
    [apiAccept, props.order]
  );

  const apiReject = ApiHook.Trade.OrderStock.useReject();
  const cmdReject = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("재고를 거절하시겠습니까?"))) return;
    await apiReject.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiReject, props.order]);

  const apiCancel = ApiHook.Trade.OrderStock.useCancel();
  const cmdCancel = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("주문을 삭제하시겠습니까?"))) return;
    await apiCancel.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiCancel, props.order]);

  const apiReset = ApiHook.Trade.OrderStock.useReset();
  const cmdReset = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("주문 내용을 재입력하시겠습니까?"))) return;
    await apiReset.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiReset, props.order]);

  const isVirtual = !!props.order?.dstCompany.managedById;
  const status = !props.order
    ? 0
    : Util.inc(props.order.status, "ORDER_PREPARING", "OFFER_PREPARING")
    ? 0
    : Util.inc(props.order.status, "ORDER_REQUESTED", "OFFER_REQUESTED")
    ? 1
    : Util.inc(props.order.status, "ACCEPTED")
    ? 2
    : 0;

  const steps = isVirtual
    ? [
        {
          title: "주문 작성중",
        },
        {
          title: "매입정보 입력",
        },
      ]
    : [
        {
          title: "주문 작성",
        },
        {
          title: "주문 승인 대기",
        },
        {
          title: "매입정보 입력",
        },
      ];

  return (
    <div className="flex-1 w-0 flex flex-col">
      <Toolbar.Container rootClassName="p-4">
        <Toolbar.ButtonPreset.Create
          label="입고 정보 추가"
          disabled={!accepted}
          tooltip={
            !accepted
              ? "입고 정보를 추가하려면 먼저 주문 승인을 받아야 합니다."
              : undefined
          }
          onClick={() => props.order && setOpen(props.order.id)}
        />
        <div className="flex-1 flex flex-col justify-center select-none mx-8">
          <Steps items={steps} current={status} />
        </div>
        {props.order?.status === "ORDER_PREPARING" && (
          <Toolbar.ButtonPreset.Delete label="주문 삭제" onClick={cmdCancel} />
        )}
        {!isVirtual && props.order?.status === "ORDER_PREPARING" && (
          <Toolbar.ButtonPreset.Send label="발주 요청" onClick={cmdRequest} />
        )}
        {isVirtual && props.order?.status === "ORDER_PREPARING" && (
          <Toolbar.ButtonPreset.Continue
            label="매입 등록"
            onClick={cmdAccept(isVirtual)}
          />
        )}
        {props.order?.status === "OFFER_REQUESTED" && (
          <Toolbar.ButtonPreset.Reject label="재고 거절" onClick={cmdReject} />
        )}
        {props.order?.status === "OFFER_REQUESTED" && (
          <Toolbar.ButtonPreset.Continue
            label="재고 승인"
            onClick={cmdAccept(isVirtual)}
          />
        )}
        {props.order?.status === "ORDER_REQUESTED" && (
          <Toolbar.ButtonPreset.Send label="발주 요청" disabled />
        )}
        {props.order?.status === "ORDER_REJECTED" && (
          <Toolbar.ButtonPreset.Continue
            label="주문 재입력"
            onClick={cmdReset}
          />
        )}
      </Toolbar.Container>
      <div className="flex-1 overflow-y-scroll px-4 pb-4">
        <div className="flex-1">
          <Table.Default<Model.StockEvent>
            data={list.data ?? undefined}
            page={page}
            setPage={setPage}
            keySelector={(record) => `${record.id}`}
            selection="none"
            columns={[
              {
                title: "#",
                dataIndex: "id",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )}`}</div>
                ),
              },
              ...Table.Preset.columnStock<Model.StockEvent>(
                (p) => p.stock,
                ["stock"]
              ),
              {
                title: "입고 수량",
                dataIndex: "change",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )}`}</div>
                ),
                fixed: "right",
              },
              {
                title: "입고 여부",
                dataIndex: "status",
                render: (value: Model.Enum.StockEventStatus) => (
                  <div className="font-bold">
                    {value === "NORMAL" ? "입고 완료" : "입고 대기중"}
                  </div>
                ),
                fixed: "right",
              },
            ]}
          />
        </div>
      </div>
      {props.order && (
        <>
          <div className="basis-px bg-gray-200" />
          <PricePanel order={props.order} />
        </>
      )}
      <CreateArrival open={open} onClose={setOpen} />
    </div>
  );
}

interface RightSideSalesProps {
  order: Model.Order | null;
}
function RightSideSales(props: RightSideSalesProps) {
  const apiRequest = ApiHook.Trade.OrderStock.useRequest();
  const cmdRequest = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("재고 승인을 요청하시겠습니까?"))) return;
    await apiRequest.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiRequest, props.order]);

  const apiAccept = ApiHook.Trade.OrderStock.useAccept();
  const cmdAccept = useCallback(
    (virtual: boolean) => async () => {
      if (!props.order) return;
      if (
        !(await Util.confirm(
          virtual
            ? "가상 매출처 대상 주문은 즉시 승인됩니다. 계속하시겠습니까?"
            : "주문을 승인하시겠습니까?"
        ))
      )
        return;
      await apiAccept.mutateAsync({
        orderId: props.order.id,
      });
    },
    [apiAccept, props.order]
  );

  const apiReject = ApiHook.Trade.OrderStock.useReject();
  const cmdReject = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("주문을 거절하시겠습니까?"))) return;
    await apiReject.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiReject, props.order]);

  const apiCancel = ApiHook.Trade.OrderStock.useCancel();
  const cmdCancel = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("수주를 삭제하시겠습니까?"))) return;
    await apiCancel.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiCancel, props.order]);

  const apiReset = ApiHook.Trade.OrderStock.useReset();
  const cmdReset = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("수주 내용을 재입력하시겠습니까?"))) return;
    await apiReset.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiReset, props.order]);

  const isVirtual = !!props.order?.srcCompany.managedById;
  const status = !props.order
    ? 0
    : Util.inc(props.order.status, "ORDER_PREPARING", "OFFER_PREPARING")
    ? 0
    : Util.inc(props.order.status, "ORDER_REQUESTED", "OFFER_REQUESTED")
    ? 1
    : Util.inc(props.order.status, "ACCEPTED")
    ? 2
    : 0;

  const steps = isVirtual
    ? [
        {
          title: "수주 내용 작성중",
        },
        {
          title: "매출정보 입력",
        },
      ]
    : [
        {
          title: "주문 작성",
        },
        {
          title: "주문 승인 대기",
        },
        {
          title: "매출정보 입력",
        },
      ];

  return (
    <div className="flex-1 w-0 flex flex-col">
      <Toolbar.Container rootClassName="p-4">
        <div className="flex-1 flex flex-col justify-center select-none mx-8">
          <Steps items={steps} current={status} />
        </div>
        {props.order?.status === "OFFER_PREPARING" && (
          <Toolbar.ButtonPreset.Delete label="주문 삭제" onClick={cmdCancel} />
        )}
        {!isVirtual && props.order?.status === "OFFER_PREPARING" && (
          <Toolbar.ButtonPreset.Send
            label="주문 승인 요청"
            onClick={cmdRequest}
          />
        )}
        {isVirtual && props.order?.status === "OFFER_PREPARING" && (
          <Toolbar.ButtonPreset.Continue
            label="매출 등록"
            onClick={cmdAccept(isVirtual)}
          />
        )}
        {props.order?.status === "ORDER_REQUESTED" && (
          <Toolbar.ButtonPreset.Reject label="주문 거절" onClick={cmdReject} />
        )}
        {props.order?.status === "ORDER_REQUESTED" && (
          <Toolbar.ButtonPreset.Continue
            label="주문 승인"
            onClick={cmdAccept(isVirtual)}
          />
        )}
        {props.order?.status === "OFFER_REQUESTED" && (
          <Toolbar.ButtonPreset.Send label="재고 승인" disabled />
        )}
        {props.order?.status === "OFFER_REJECTED" && (
          <Toolbar.ButtonPreset.Continue
            label="수주 내용 재입력"
            onClick={cmdReset}
          />
        )}
      </Toolbar.Container>
      <div className="flex-1 overflow-y-scroll px-4 pb-4">
        <div className="flex-1"></div>
      </div>
      {props.order && (
        <>
          <div className="basis-px bg-gray-200" />
          <PricePanel order={props.order} />
        </>
      )}
    </div>
  );
}

interface PricePanelProps {
  order: Model.Order;
}
function PricePanel(props: PricePanelProps) {
  const [form] = useForm();

  const processPrice = useWatch(["processPrice"], form);
  const suppliedPrice = useWatch(["suppliedPrice"], form);
  const vatPrice = useWatch(["vatPrice"], form);

  const data = ApiHook.Trade.OrderStock.useGetTradePrice({
    orderId: props.order.id,
  });

  const me = ApiHook.Auth.useGetMe();

  const apiUpdate = ApiHook.Trade.OrderStock.useUpdateTradePrice();
  const cmdUpdate = useCallback(async () => {
    if (!props.order || !me.data) return;
    await form.validateFields();
    const values = await form.getFieldsValue();

    await apiUpdate.mutateAsync({
      orderId: props.order.id,
      data: {
        companyId: me.data.companyId,
        orderId: props.order.id,
        orderStockTradePrice: {
          officialPriceType: values.stockPrice.officialPriceType,
          officialPrice: values.stockPrice.officialPrice,
          officialPriceUnit: values.stockPrice.officialPriceUnit,
          discountType: values.stockPrice.discountType,
          discountPrice: _.isFinite(values.stockPrice.discountPrice)
            ? values.stockPrice.discountPrice
            : 0,
          unitPrice: _.isFinite(values.stockPrice.unitPrice)
            ? values.stockPrice.unitPrice
            : 0,
          unitPriceUnit: values.stockPrice.unitPriceUnit,
          processPrice: values.processPrice ?? 0,
        },
        suppliedPrice: values.suppliedPrice ?? 0,
        vatPrice: values.vatPrice ?? 0,
      },
    });
  }, [props.order, form, apiUpdate]);

  useEffect(() => {
    console.log(data.data);
    if (data.data && data.data.orderStockTradePrice) {
      form.setFieldsValue({
        stockPrice: {
          officialPriceType: data.data.orderStockTradePrice.officialPriceType,
          officialPrice: data.data.orderStockTradePrice.officialPrice,
          officialPriceUnit: data.data.orderStockTradePrice.officialPriceUnit,
          discountType: data.data.orderStockTradePrice.discountType,
          discountPrice: data.data.orderStockTradePrice.discountPrice,
          unitPrice: data.data.orderStockTradePrice.unitPrice,
          unitPriceUnit: data.data.orderStockTradePrice.unitPriceUnit,
        },
        processPrice: data.data.orderStockTradePrice.processPrice,
        suppliedPrice: data.data.suppliedPrice,
        vatPrice: data.data.vatPrice,
      });
    } else {
      form.setFieldsValue({
        stockPrice: FormControl.Util.Price.initialStockPrice(
          props.order.orderStock.packaging.type
        ),
        processPrice: 0,
        suppliedPrice: 0,
        vatPrice: 0,
      });
    }
  }, [data.data, form, props.order.orderStock.packaging.type]);

  return (
    <div className="basis-[300px] overflow-y-scroll p-4 flex">
      <Form
        form={form}
        layout="vertical"
        rootClassName="flex-initial basis-[500px]"
        initialValues={{
          price: FormControl.Util.Price.initialStockPrice(
            props.order.orderStock.packaging.type
          ),
        }}
      >
        <Form.Item label="거래 금액" name={["stockPrice"]}>
          <FormControl.StockPrice
            spec={{
              grammage: props.order.orderStock.grammage,
              packaging: props.order.orderStock.packaging,
              sizeX: props.order.orderStock.sizeX,
              sizeY: props.order.orderStock.sizeY,
            }}
          />
        </Form.Item>
        <Form.Item name={"processPrice"} label="공정비">
          <FormControl.Number />
        </Form.Item>
        <Form.Item name={"suppliePrice"} label="공급가">
          <FormControl.Number />
        </Form.Item>
        <Form.Item name={"vatPrice"} label="부가세">
          <FormControl.Number />
        </Form.Item>
        <div className="flex-initial flex justify-end">
          <Button.Default type="secondary" label="저장" onClick={cmdUpdate} />
        </div>
        <div className="h-8" />
      </Form>
    </div>
  );
}
