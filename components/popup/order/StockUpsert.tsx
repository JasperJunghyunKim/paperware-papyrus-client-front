import { Api, Model } from "@/@shared";
import { OrderStatus } from "@/@shared/models/enum";
import { ApiHook, PaperUtil, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, FormControl, Popup, Table, Toolbar } from "@/components";
import { Number } from "@/components/formControl";
import { Alert, Form, Input, Select, Steps, Switch } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import classNames from "classnames";
import _ from "lodash";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  TbAB,
  TbBrandMixpanel,
  TbHandStop,
  TbInfoCircle,
  TbRubberStamp,
  TbSend,
  TbSquare,
} from "react-icons/tb";
import { CreateArrival } from ".";
import { TaskMap } from "../plan/common";
import { mine } from "@/common/util";

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
  const order = ApiHook.Trade.OrderStock.useGetItem({
    id: initialOrderId,
  });

  const isOffer = props.open === "CREATE_OFFER";
  const isSales = isOffer || me.data?.companyId === order.data?.dstCompany.id;

  useEffect(() => {
    if (typeof props.open === "number") {
      setInitialOrderId(props.open);
    } else {
      setInitialOrderId(null);
      order.remove();
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
            ? "비연결 매입처 대상 주문은 즉시 승인됩니다. 계속하시겠습니까?"
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
              title={`매출 재고를 선택하고 비연결 매출처 대상 매출 등록을 완료하세요.`}
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
              title={`매입 재고를 선택하고 비연결 매입처 대상 매입 등록을 완료하세요.`}
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
        <div className="basis-[460px] flex-shrink-0 p-4 overflow-y-scroll">
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
    | Api.OrderStockCreateRequest
    | (Api.OrderStockUpdateRequest & Api.OrderStockAssignStockUpdateRequest)
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

  const productId = useWatch(["productId"], form);
  const packagingId = useWatch(["packagingId"], form);
  const grammage = useWatch(["grammage"], form);
  const sizeX = useWatch(["sizeX"], form);
  const sizeY = useWatch(["sizeY"], form);
  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);
  const paperColorGroupId = useWatch(["paperColorGroupId"], form);
  const paperColorId = useWatch(["paperColorId"], form);
  const paperPatternId = useWatch(["paperPatternId"], form);
  const paperCertId = useWatch(["paperCertId"], form);
  const quantity = useWatch(["quantity"], form);

  const editable =
    props.initialOrder === null ||
    props.initialOrder.status === "OFFER_PREPARING" ||
    props.initialOrder.status === "ORDER_PREPARING";
  const manual =
    !props.isSales &&
    companies.data?.items.find((p) => p.srcCompany.id === dstCompanyId)
      ?.srcCompany.managedById !== null;

  const stockGroupQuantity = ApiHook.Stock.StockInhouse.useGetGroupQuantity({
    query: {
      initialOrderId: null, // TODO
      warehouseId: warehouse?.id ?? null,
      productId: productId ?? null,
      packagingId: packagingId ?? null,
      grammage: grammage ?? null,
      sizeX: sizeX ?? null,
      sizeY: sizeY ?? null,
      paperColorGroupId: paperColorGroupId ?? null,
      paperColorId: paperColorId ?? null,
      paperPatternId: paperPatternId ?? null,
      paperCertId: paperCertId ?? null,
    },
  });

  useEffect(() => {
    if (props.initialOrder) {
      const assignStockEvent = props.initialOrder.orderStock.plan.find(
        (p) => p.companyId === props.initialOrder?.dstCompany.id
      )?.assignStockEvent;
      const assignStock = assignStockEvent?.stock;

      console.log(assignStockEvent);

      form.setFieldsValue({
        dstCompanyId: props.initialOrder.dstCompany.id,
        srcCompanyId: props.initialOrder.srcCompany.id,
        locationId: props.initialOrder.orderStock.dstLocation.id,
        wantedDate: props.initialOrder.wantedDate,
        warehouseId: assignStock?.warehouse?.id,
        planId: assignStock?.planId,
        productId: assignStock?.product.id,
        packagingId: assignStock?.packaging.id,
        grammage: assignStock?.grammage,
        sizeX: assignStock?.sizeX,
        sizeY: assignStock?.sizeY,
        paperColorGroupId: assignStock?.paperColorGroup?.id,
        paperColorId: assignStock?.paperColor?.id,
        paperPatternId: assignStock?.paperPattern?.id,
        paperCertId: assignStock?.paperCert?.id,
        quantity: -(assignStockEvent?.change ?? 0),
        memo: props.initialOrder.memo,
      });
      setWarehouse(assignStock?.warehouse ?? null);
    } else {
      form.resetFields();
    }
  }, [form, props.initialOrder, me.data?.companyId]);

  const apiCreate = ApiHook.Trade.OrderStock.useCreate();
  const cmdCreate = useCallback(async () => {
    const values = (await form.validateFields()) as Api.OrderStockCreateRequest;

    if (!me.data) {
      return;
    }

    if (props.isOffer) {
      const created = await apiCreate.mutateAsync({
        data: {
          ...values,
          warehouseId: warehouse?.id ?? null,
          dstCompanyId: me.data.companyId,
        },
      });
      if (created) {
        props.onCreated(created);
      }
    } else {
      const created = await apiCreate.mutateAsync({
        data: {
          ...values,
          warehouseId: warehouse?.id ?? null,
          srcCompanyId: me.data.companyId,
        },
      });
      if (created) {
        props.onCreated(created);
      }
    }
  }, [form, apiCreate, me, props.isOffer, warehouse]);

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

  const apiUpdateAssign = ApiHook.Trade.OrderStock.useUpdateStock();
  const cmdUpdateAssign = useCallback(async () => {
    const values =
      (await form.validateFields()) as Api.OrderStockAssignStockUpdateRequest;

    if (props.initialOrder === null) {
      return;
    }

    await apiUpdateAssign.mutateAsync({
      orderId: props.initialOrder.id,
      data: {
        ...values,
      },
    });
  }, [form, apiUpdateAssign, props.initialOrder]);

  return (
    <Form form={form} layout="vertical" rootClassName="w-full mb-32">
      <FormControl.Util.Split
        label={props.isSales ? "매출 정보" : "매입 정보"}
      />
      <Form.Item label="거래 구분" required>
        <Select
          options={[
            {
              label: "정상 거래",
              value: "NORMAL",
            },
            {
              label: "보관 거래",
              value: "DEPOSIT",
            },
          ]}
        />
      </Form.Item>
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
      {!props.isSales &&
        dstCompanyId &&
        (editable ? (
          <Form.Item name="locationId" label="도착지" rules={REQUIRED_RULES}>
            <FormControl.SelectLocation />
          </Form.Item>
        ) : (
          <Form.Item label="도착지" required>
            <Input
              value={props.initialOrder?.orderStock.dstLocation.name}
              disabled={!editable}
            />
            <div className="text-gray-400 text-sm mt-2">
              {`주소: ${Util.formatAddress(
                props.initialOrder?.orderStock.dstLocation.address
              )}`}
            </div>
          </Form.Item>
        ))}
      {props.isSales && srcCompanyId && (
        <Form.Item name="locationId" label="도착지" rules={REQUIRED_RULES}>
          <FormControl.SelectLocationForSales
            companyId={srcCompanyId}
            disabled={!editable}
          />
        </Form.Item>
      )}
      <Form.Item
        name="wantedDate"
        label={props.isSales ? "납품 요청일" : "도착 희망일"}
        rules={REQUIRED_RULES}
      >
        <FormControl.DatePicker disabled={!editable} />
      </Form.Item>
      <Form.Item name="memo" label="기타 요청사항">
        <Input.TextArea maxLength={100} disabled={!editable} />
      </Form.Item>
      {props.initialOrder && editable && (
        <div className="flex-initial flex justify-end">
          <Button.Preset.Edit
            label={`${props.isSales ? "수주" : "주문"} 정보 ${
              props.initialOrder ? "수정" : "등록"
            }`}
            onClick={cmdUpdate}
          />
        </div>
      )}
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
                    planId: stockGroup.plan?.id,
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
                    planId: stockGroup.plan?.id,
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
              <Form.Item
                name="warehouseId"
                label="창고"
                hidden={!props.isSales}
              >
                <FormControl.SelectWarehouse disabled />
              </Form.Item>
              {!props.isSales && (
                <Form.Item label="창고" rules={[{ required: true }]}>
                  <Input value={warehouse?.name} disabled />
                </Form.Item>
              )}
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
        <>
          {(props.isSales || !manual) && (
            <>
              <Form.Item label={"실물 수량"}>
                <FormControl.Quantity
                  spec={{
                    grammage,
                    sizeX,
                    sizeY,
                    packaging,
                  }}
                  value={stockGroupQuantity.data?.totalQuantity ?? 0}
                  disabled
                />
              </Form.Item>
              <Form.Item label={"가용 수량"}>
                <FormControl.Quantity
                  spec={{
                    grammage,
                    sizeX,
                    sizeY,
                    packaging,
                  }}
                  value={
                    (stockGroupQuantity.data?.availableQuantity ?? 0) - quantity
                  }
                  disabled
                />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="quantity"
            label={props.isSales ? "매출 수량" : "매입 수량"}
          >
            <FormControl.Quantity
              spec={{
                grammage,
                sizeX,
                sizeY,
                packaging,
              }}
              disabled={!editable}
            />
          </Form.Item>
        </>
      )}
      {packaging && editable && (
        <div className="flex-initial flex justify-end">
          <Button.Preset.Edit
            label={`${props.isSales ? "수주" : "주문"} 재고 ${
              props.initialOrder ? "수정" : "등록"
            }`}
            onClick={async () =>
              props.initialOrder ? await cmdUpdateAssign() : await cmdCreate()
            }
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
            ? "비연결 매입처 대상 주문은 즉시 승인됩니다. 계속하시겠습니까?"
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
    <div className="flex-1 w-0 flex">
      <div className="flex-1 flex flex-col w-0">
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
            <Toolbar.ButtonPreset.Delete
              label="주문 삭제"
              onClick={cmdCancel}
            />
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
            <Toolbar.ButtonPreset.Reject
              label="재고 거절"
              onClick={cmdReject}
            />
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
            <Table.Default<Model.StockGroup>
              data={list.data ?? undefined}
              page={page}
              setPage={setPage}
              keySelector={(record) => `${record.plan?.id}`}
              selection="none"
              columns={[
                {
                  title: "작업 구분",
                  render: (value: Model.StockGroup) => (
                    <div>{value.plan?.orderStock ? "정상 매입" : ""}</div>
                  ),
                },
                {
                  title: "작업 번호",
                  dataIndex: ["stock", "initialOrder", "orderNo"],
                  render: (value) => (
                    <div className="flex">
                      <div className="font-fixed bg-sky-100 px-1 text-sky-800 rounded-md">
                        {value}
                      </div>
                    </div>
                  ),
                },
                {
                  title: "거래처",
                  dataIndex: ["orderCompanyInfo", "businessName"],
                },
                {
                  title: "도착 예정일",
                  dataIndex: ["orderInfo", "wantedDate"],
                  render: (value) => Util.formatIso8601ToLocalDate(value),
                },
                {
                  title: "도착지",
                  dataIndex: ["orderStock", "dstLocation", "name"],
                },
                ...Table.Preset.columnStockGroup<Model.StockGroup>(
                  (p) => p, // TODO
                  []
                ),
                ...Table.Preset.columnQuantity<Model.StockGroup>(
                  (p) => p, // TODO
                  ["nonStoringQuantity"],
                  { prefix: "배정" }
                ),
                ...Table.Preset.columnQuantity<Model.StockGroup>(
                  (p) => p, // TODO
                  ["storingQuantity"],
                  { prefix: "입고" }
                ),
                ...Table.Preset.columnQuantity<Model.StockGroup>(
                  (p) => p, // TODO
                  ["totalQuantity"],
                  { prefix: "전체" }
                ),
              ]}
            />
          </div>
        </div>
      </div>
      {props.order && (
        <>
          <div className="basis-px bg-gray-200" />
          <PricePanel order={props.order} orderId={props.order.id} />
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
            ? "비연결 매출처 대상 주문은 즉시 승인됩니다. 계속하시겠습니까?"
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

  const me = ApiHook.Auth.useGetMe();

  const plan = ApiHook.Working.Plan.useGetItem({
    id: props.order?.orderStock.plan.find(mine(me.data))?.id ?? null,
  });

  return (
    <div className="flex-1 w-0 flex">
      <div className="flex-1 flex flex-col w-0">
        <Toolbar.Container rootClassName="flex-1 p-4">
          <div className="flex-1 flex flex-col justify-center select-none mx-8">
            <Steps items={steps} current={status} />
          </div>
          {props.order?.status === "OFFER_PREPARING" && (
            <Toolbar.ButtonPreset.Delete
              label="주문 삭제"
              onClick={cmdCancel}
            />
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
            <Toolbar.ButtonPreset.Reject
              label="주문 거절"
              onClick={cmdReject}
            />
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
        <div className="basis-px bg-gray-200" />
        <div className="flex-1 flex h-0">
          <div className="flex-1 bg-slate-100">
            {plan.data?.assignStockEvent && (
              <TaskMap
                plan={plan.data}
                packagingType={plan.data.assignStockEvent.stock.packaging.type}
              />
            )}
          </div>
        </div>
      </div>
      {props.order && (
        <>
          <div className="basis-px bg-gray-200" />
          <PricePanel order={props.order} orderId={props.order.id} />
        </>
      )}
    </div>
  );
}

interface PricePanelProps {
  order: Model.Order;
  orderId: number | null;
}
function PricePanel(props: PricePanelProps) {
  const [form] = useForm();

  const altSizeX = useWatch<number>(
    ["orderStockTradeAltBundle", "altSizeX"],
    form
  );
  const altSizeY = useWatch<number>(
    ["orderStockTradeAltBundle", "altSizeY"],
    form
  );
  const altQuantity = useWatch<number>(
    ["orderStockTradeAltBundle", "altQuantity"],
    form
  );
  const unitPrice = useWatch<number>(["stockPrice", "unitPrice"], form);
  const unitPriceUnit = useWatch<Model.Enum.PriceUnit>(
    ["stockPrice", "unitPriceUnit"],
    form
  );

  const me = ApiHook.Auth.useGetMe();

  const assignStockEvent = props.order.orderStock.plan.find(
    (p) => p.companyId === props.order.dstCompany.id
  )!.assignStockEvent;

  const stockSuppliedPrice = useMemo(() => {
    const quantity = altQuantity ?? assignStockEvent.change;
    const convert = (unit: "T" | "BOX" | "매") =>
      PaperUtil.convertQuantityWith(assignStockEvent.stock, unit, quantity);

    const converted =
      assignStockEvent.stock.packaging.type === "ROLL"
        ? convert("T")
        : assignStockEvent.stock.packaging.type === "BOX"
        ? convert("BOX")
        : convert("매");

    return !converted
      ? 0
      : unitPrice *
          (unitPriceUnit === "WON_PER_TON"
            ? converted.grams * 0.000001
            : unitPriceUnit === "WON_PER_BOX"
            ? converted.quantity
            : converted.packed?.value ?? 0);
  }, [props.order?.orderStock, unitPrice, unitPriceUnit, altQuantity]);

  const processPrice = useWatch<number | null>(["processPrice"], form);
  const suppliedPrice = useWatch<number | null>(["suppliedPrice"], form);
  const vatPrice = useWatch<number | null>(["vatPrice"], form);

  const data = ApiHook.Trade.OrderStock.useGetTradePrice({
    orderId: props.order.id,
  });

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
          orderStockTradeAltBundle: values.orderStockTradeAltBundle,
        },
        suppliedPrice: values.suppliedPrice ?? 0,
        vatPrice: values.vatPrice ?? 0,
      },
    });
  }, [props.order, form, apiUpdate]);

  const defaultSuppliedPrice = stockSuppliedPrice + (processPrice ?? 0);
  const defaultVatPrice = (suppliedPrice ?? 0) * 0.1;

  useEffect(() => {
    form.setFieldValue(
      "stockPrice",
      FormControl.Util.Price.initialStockPrice(
        altSizeX && altSizeY
          ? "SKID"
          : altSizeX
          ? "ROLL"
          : assignStockEvent.stock.packaging.type
      )
    );
  }, [altSizeX, altSizeY, assignStockEvent.stock.packaging.type]);

  const positiveCompany = [props.order.srcCompany, props.order.dstCompany]
    .filter((_) => me.data)
    .find((p) => p.id !== me.data?.companyId);

  const isSales = props.order.dstCompany.id === me.data?.companyId;

  useEffect(() => {
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
          assignStockEvent.stock.packaging.type
        ),
        processPrice: 0,
        suppliedPrice: 0,
        vatPrice: 0,
      });
    }
  }, [props.orderId, data.data, form, assignStockEvent.stock.packaging.type]);

  return (
    <div className="flex-[0_0_460px] overflow-y-scroll p-4 flex">
      <Form
        form={form}
        layout="vertical"
        rootClassName="flex-initial basis-[500px]"
        initialValues={{
          price: FormControl.Util.Price.initialStockPrice(
            assignStockEvent.stock.packaging.type
          ),
        }}
      >
        <FormControl.Util.Split label="단가 대체" />
        <Form.Item label="단가 대체" name={["orderStockTradeAltBundle"]}>
          <FormControl.Alt />
        </Form.Item>
        <Alert
          message="단가 대체 규격을 수정하면 거래 금액정보가 초기화됩니다."
          type="info"
        />
        <FormControl.Util.Split label="거래 금액 정보" />
        <Form.Item label="거래 단가" name={["stockPrice"]}>
          {positiveCompany && (
            <FormControl.StockPrice
              spec={{
                grammage: assignStockEvent.stock.grammage,
                packaging:
                  altSizeX && altSizeY
                    ? {
                        packA: 0,
                        packB: 0,
                        type: "SKID",
                      }
                    : altSizeX
                    ? {
                        packA: 0,
                        packB: 0,
                        type: "ROLL",
                      }
                    : assignStockEvent.stock.packaging,
                sizeX: altSizeX ?? assignStockEvent.stock.sizeX,
                sizeY: altSizeY ?? assignStockEvent.stock.sizeY,
              }}
              officialSpec={{
                productId: assignStockEvent.stock.product.id,
                paperColorGroupId: assignStockEvent.stock.paperColorGroup?.id,
                paperColorId: assignStockEvent.stock.paperColor?.id,
                paperPatternId: assignStockEvent.stock.paperPattern?.id,
                paperCertId: assignStockEvent.stock.paperCert?.id,
              }}
              discountSpec={{
                companyRegistrationNumber:
                  positiveCompany?.companyRegistrationNumber,
                productId: assignStockEvent.stock.product.id,
                discountRateType: isSales ? "SALES" : "PURCHASE",
                paperColorGroupId: assignStockEvent.stock.paperColorGroup?.id,
                paperColorId: assignStockEvent.stock.paperColor?.id,
                paperPatternId: assignStockEvent.stock.paperPattern?.id,
                paperCertId: assignStockEvent.stock.paperCert?.id,
              }}
            />
          )}
        </Form.Item>
        <Form.Item name={"processPrice"} label="공정비">
          <FormControl.Number unit="원" />
        </Form.Item>
        <Form.Item name={"suppliedPrice"} label="공급가">
          <FormControl.Number unit="원" />
        </Form.Item>
        <div className="flex-initial flex justify-end">
          <div className="flex-1 flex gap-x-2 font-fixed text-xs">
            <div className="flex flex-col text-gray-500">
              {`기준공급가: ${Util.comma(
                stockSuppliedPrice + (processPrice ?? 0)
              )}원`}
            </div>
            {suppliedPrice &&
            Math.abs(suppliedPrice - defaultSuppliedPrice) >= 1 ? (
              <div
                className={classNames("flex flex-col", {
                  "text-orange-600": suppliedPrice > defaultSuppliedPrice,
                  "text-green-600": suppliedPrice < defaultSuppliedPrice,
                })}
              >
                {`(${Util.comma(
                  Math.abs(suppliedPrice - defaultSuppliedPrice)
                )}원 ${
                  suppliedPrice > defaultSuppliedPrice ? "절상" : "절사"
                })`}
              </div>
            ) : null}
          </div>
          <Button.Default
            type="default"
            label="기준공급가 적용"
            onClick={() =>
              form.setFieldValue("suppliedPrice", defaultSuppliedPrice)
            }
          />
        </div>
        <Form.Item name={"vatPrice"} label="부가세">
          <FormControl.Number unit="원" />
        </Form.Item>
        <div className="flex-initial flex justify-end">
          <div className="flex-1 flex gap-x-2 font-fixed text-xs">
            <div className="flex flex-col text-gray-500">
              {`10%부가세: ${Util.comma(defaultVatPrice)}원`}
            </div>
            {vatPrice && Math.abs(vatPrice - defaultVatPrice) >= 1 ? (
              <div
                className={classNames("flex flex-col", {
                  "text-orange-600": vatPrice > defaultVatPrice,
                  "text-green-600": vatPrice < defaultVatPrice,
                })}
              >
                {`(${Util.comma(Math.abs(vatPrice - defaultVatPrice))}원 ${
                  vatPrice > defaultVatPrice ? "절상" : "절사"
                })`}
              </div>
            ) : null}
          </div>
          <Button.Default
            type="default"
            label="10%부가세 적용"
            onClick={() => form.setFieldValue("vatPrice", defaultVatPrice)}
          />
        </div>
        <Form.Item label="합계">
          <FormControl.Number
            unit="원"
            value={(suppliedPrice ?? 0) + (vatPrice ?? 0)}
            disabled
          />
        </Form.Item>
        <div className="flex-initial flex justify-end mt-4 gap-x-2">
          <Button.Default type="secondary" label="저장" onClick={cmdUpdate} />
          <Button.Default
            type="primary"
            icon={<TbRubberStamp />}
            label="거래 마감"
          />
        </div>
        <div className="h-8" />
      </Form>
    </div>
  );
}
