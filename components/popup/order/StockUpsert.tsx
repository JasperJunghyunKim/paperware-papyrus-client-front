import { Api, Model } from "@/@shared";
import { Enum } from "@/@shared/models";
import { OrderStatus } from "@/@shared/models/enum";
import { ApiHook, PaperUtil, QuantityUtil, Util } from "@/common";
import { usePage } from "@/common/hook";
import { mine } from "@/common/util";
import { Button, FormControl, Popup, Table, Toolbar } from "@/components";
import { Number } from "@/components/formControl";
import { Alert, Checkbox, Form, Input, Select, Steps, Switch } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import classNames from "classnames";
import dayjs from "dayjs";
import _ from "lodash";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  TbAB,
  TbBrandMixpanel,
  TbCircleCheck,
  TbDots,
  TbHandStop,
  TbHistory,
  TbInfoCircle,
  TbRotateClockwise2,
  TbRubberStamp,
  TbSend,
  TbSquare,
  TbX,
} from "react-icons/tb";
import { CreateArrival, UpdateArrival, UpdateArrivalPrice } from ".";
import { TaskMap } from "../plan/common";
import { OrderRefundCreateRequest } from "@/@shared/api";

export type OrderId = number;
export type OrderUpsertOpen = "CREATE_ORDER" | "CREATE_OFFER" | OrderId | false;
const REQUIRED_RULES = [{ required: true }];

type OrderCreateMixType = Api.OrderStockCreateRequest &
  Api.OrderDepositCreateRequest &
  Api.OrderProcessCreateRequest &
  Api.OrderEtcCreateRequest &
  Api.OrderReturnCreateRequest &
  Api.OrderRefundCreateRequest;

type OrderUpdateMixType = Api.OrderStockUpdateRequest &
  Api.OrderProcessInfoUpdateRequest &
  Api.OrderEtcUpdateRequest &
  Api.OrderRefundUpdateRequest &
  Api.OrderReturnUpdateRequest;

function title(open: OrderUpsertOpen) {
  return open === "CREATE_ORDER"
    ? "매입 등록"
    : open === "CREATE_OFFER"
    ? "매출 등록"
    : null;
}

export interface Props {
  open: OrderUpsertOpen;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const me = ApiHook.Auth.useGetMe();
  const [initialOrderId, setInitialOrderId] = useState<OrderId | null>(null);
  const [openHistory, setOpenHistory] = useState(false);
  const order = ApiHook.Trade.Common.useGetItem({
    id: initialOrderId,
  });

  const isOffer = props.open === "CREATE_OFFER";
  const isSales = isOffer || me.data?.companyId === order.data?.dstCompany.id;

  useEffect(() => {
    if (typeof props.open === "number") {
      setInitialOrderId(props.open);
    } else {
      setInitialOrderId(null);
    }
  }, [props.open]);

  const apiRequest = ApiHook.Trade.Common.useRequest();
  const cmdRequest = useCallback(async () => {
    if (!order.data) return;
    if (!(await Util.confirm("주문을 요청하시겠습니까?"))) return;
    await apiRequest.mutateAsync({
      orderId: order.data.id,
    });
  }, [apiRequest, order.data]);

  const apiAccept = ApiHook.Trade.Common.useAccept();
  const cmdAccept = useCallback(
    (virtual: boolean) => async () => {
      if (!order.data) return;
      if (
        !(await Util.confirm(
          virtual
            ? "비연결 매입처 대상 주문은 즉시 승인됩니다. 계속하시겠습니까?"
            : "주문을 확정하시겠습니까?"
        ))
      )
        return;
      await apiAccept.mutateAsync({
        orderId: order.data.id,
      });
    },
    [apiAccept, order.data]
  );

  const apiReject = ApiHook.Trade.Common.useReject();
  const cmdReject = useCallback(async () => {
    if (!order.data) return;
    if (!(await Util.confirm("재고를 거절하시겠습니까?"))) return;
    await apiReject.mutateAsync({
      orderId: order.data.id,
    });
  }, [apiReject, order.data]);

  const apiCancel = ApiHook.Trade.Common.useDelete();
  const cmdCancel = useCallback(async () => {
    if (!order.data) return;
    if (!(await Util.confirm("주문을 삭제하시겠습니까?"))) return;
    await apiCancel.mutateAsync({
      orderId: order.data.id,
    });
  }, [apiCancel, order.data]);

  const apiReset = ApiHook.Trade.Common.useReset();
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
                  label: `${
                    order.data.orderType === "NORMAL"
                      ? "정상 매출"
                      : order.data.orderType === "DEPOSIT"
                      ? "매출 보관"
                      : order.data.orderType === "OUTSOURCE_PROCESS"
                      ? "외주 공정 매출"
                      : order.data.orderType === "REFUND"
                      ? "매출 환불"
                      : order.data.orderType === "RETURN"
                      ? "매출 환불"
                      : "기타 매출"
                  } 등록`,
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
                {
                  fn: cmdAccept(false),
                  label:
                    order.data.orderType === "NORMAL"
                      ? "정상 매출 확정"
                      : order.data.orderType === "DEPOSIT"
                      ? "매출 보관 확정"
                      : order.data.orderType === "OUTSOURCE_PROCESS"
                      ? "외주 공정 매출 확정"
                      : order.data.orderType === "REFUND"
                      ? "매출 환불 확정"
                      : order.data.orderType === "RETURN"
                      ? "매출 반품 확정"
                      : "기타 매출 확정",
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
            buttons={[
              {
                fn: cmdReset,
                label: `구매 제안 취소`,
              },
            ]}
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
                  label: `${
                    order.data.orderType === "NORMAL"
                      ? "정상 매입"
                      : order.data.orderType === "DEPOSIT"
                      ? "매입 보관"
                      : order.data.orderType === "OUTSOURCE_PROCESS"
                      ? "외주 공정 매입"
                      : order.data.orderType === "REFUND"
                      ? "매입 환불"
                      : order.data.orderType === "RETURN"
                      ? "매입 반품"
                      : "기타 매입"
                  } 등록`,
                },
              ]}
            />
          ) : (
            <RightSideSkeleton
              icon={<TbAB />}
              title={`거래 하려는 매입처와 재고를 선택하고 주문 요청을 보내세요.`}
              buttons={[
                {
                  fn: cmdRequest,
                  label: `주문 요청`,
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
            buttons={[
              {
                fn: cmdReset,
                label: `주문 요청 취소`,
              },
            ]}
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
  }, [isSales, order.data, cmdAccept, cmdRequest, cmdReject, cmdReset]);

  return (
    <Popup.Template.Full
      title={
        title(props.open) ?? (
          <div className="flex-initial flex gap-x-2">
            <div className="flex-initial">{isSales ? "매출" : "매입"} 상세</div>
            {order.data && (
              <div className="flex-initial font-fixed font-normal text-gray-300">
                ({isSales ? "매출" : "매입"} 번호:{" "}
                {Util.formatSerial(order.data.orderNo)}) ―{" "}
                {Util.orderStatusToString(order.data.status)}
              </div>
            )}
          </div>
        )
      }
      {...props}
      open={!!props.open}
      width="calc(100vw - 80px)"
      height="calc(100vh - 80px)"
      buttons={[
        {
          icon: <TbHistory />,
          onClick: () => setOpenHistory(true),
        },
      ]}
    >
      <div className="w-full h-full flex">
        <div className="basis-[460px] flex-shrink-0 p-4 overflow-y-scroll">
          <DataForm
            isOffer={isOffer}
            isSales={isSales}
            initialOrder={order.data ?? null}
            onCreated={(p) => {
              setInitialOrderId(p.id);
            }}
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
      {order.data && (
        <PopupHistory
          open={openHistory}
          onClose={setOpenHistory}
          order={order.data}
        />
      )}
    </Popup.Template.Full>
  );
}

interface DataFormProps {
  isOffer: boolean;
  isSales: boolean;
  initialOrder: Model.Order | null;
  onCreated: (order: { id: number }) => void;
}
function DataForm(props: DataFormProps) {
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();
  const me = ApiHook.Auth.useGetMe();

  const [form] = useForm<
    (
      | (Api.OrderStockCreateRequest &
          Api.OrderDepositCreateRequest &
          Api.OrderProcessCreateRequest &
          Api.OrderEtcCreateRequest &
          Api.OrderReturnCreateRequest &
          Api.OrderRefundCreateRequest)
      | (Api.OrderStockUpdateRequest & Api.OrderStockAssignStockUpdateRequest)
    ) & { orderType: Enum.OrderType }
  >();
  const [warehouse, setWarehouse] = useState<Partial<Model.Warehouse> | null>(
    null
  );
  const orderType = useWatch<Enum.OrderType>(["orderType"], form);
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

  const planId = useWatch<number | null | undefined>(["planId"], form);
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

  type Spec = {
    grammage: number;
    sizeX: number;
    sizeY: number;
    packaging: Model.Packaging;
  };
  const spec: Spec | null = packaging
    ? {
        grammage,
        sizeX,
        sizeY,
        packaging,
      }
    : null;

  const editable =
    props.initialOrder === null ||
    props.initialOrder.status === "OFFER_PREPARING" ||
    props.initialOrder.status === "ORDER_PREPARING";
  const metaEditable =
    editable ||
    (props.isSales
      ? props.initialOrder?.status === "ACCEPTED" ||
        props.initialOrder?.status === "CANCELLED"
      : props.initialOrder?.dstCompany.managedById === null
      ? false
      : (props.initialOrder?.status === "ACCEPTED" ||
          props.initialOrder?.status === "CANCELLED") &&
        props.initialOrder.orderType !== "DEPOSIT" &&
        props.initialOrder.orderType !== "ETC");

  const manual =
    (!props.isSales &&
      companies.data?.items.find((p) => p.srcCompany.id === dstCompanyId)
        ?.srcCompany.managedById !== null &&
      orderType !== "OUTSOURCE_PROCESS") ||
    orderType === "DEPOSIT" ||
    (props.isSales &&
      (orderType === "OUTSOURCE_PROCESS" || orderType === "RETURN"));

  const stockGroupQuantity = ApiHook.Stock.StockInhouse.useGetStockGroup({
    query: {
      planId: planId ?? null,
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
      const assignQuantity =
        Util.assignQuantityFromOrder(props.initialOrder) ?? 0;
      const assignStock = Util.assignStockFromOrder(props.initialOrder);

      form.setFieldsValue({
        orderType: props.initialOrder.orderType,
        originOrderNo:
          props.initialOrder.orderRefund?.originOrderNo ??
          props.initialOrder.orderReturn?.originOrderNo ??
          undefined,
        orderDate: props.initialOrder.orderDate,
        isDirectShipping: props.initialOrder.orderStock?.isDirectShipping,
        isSrcDirectShipping:
          props.initialOrder.orderProcess?.isSrcDirectShipping,
        isDstDirectShipping:
          props.initialOrder.orderProcess?.isDstDirectShipping,
        dstCompanyId: props.initialOrder.dstCompany.id,
        srcCompanyId: props.initialOrder.srcCompany.id,
        locationId:
          props.initialOrder.orderStock?.dstLocation.id ??
          props.initialOrder.orderReturn?.dstLocation.id,
        dstLocationId: props.initialOrder.orderProcess?.dstLocation.id,
        srcLocationId: props.initialOrder.orderProcess?.srcLocation.id,
        wantedDate:
          props.initialOrder.orderStock?.wantedDate ??
          props.initialOrder.orderReturn?.wantedDate,
        srcWantedDate: props.initialOrder.orderProcess?.srcWantedDate,
        dstWantedDate: props.initialOrder.orderProcess?.dstWantedDate,
        warehouseId: (assignStock as any)?.warehouse?.id,
        planId: (assignStock as any)?.planId,
        productId: assignStock?.product.id,
        packagingId: assignStock?.packaging.id,
        grammage: assignStock?.grammage,
        sizeX: assignStock?.sizeX,
        sizeY: assignStock?.sizeY,
        paperColorGroupId: assignStock?.paperColorGroup?.id,
        paperColorId: assignStock?.paperColor?.id,
        paperPatternId: assignStock?.paperPattern?.id,
        paperCertId: assignStock?.paperCert?.id,
        quantity: assignQuantity,
        item: props.initialOrder.orderEtc?.item,
        memo: props.initialOrder.memo,
      });
      setWarehouse((assignStock as any)?.warehouse ?? null);
    } else {
      form.resetFields();
    }
  }, [form, props.initialOrder, me.data?.companyId]);

  const apiCreateNormal = ApiHook.Trade.OrderStock.useCreate();
  const apiCreateDeposit = ApiHook.Trade.OrderDeposit.useCreate();
  const apiCreateProcess = ApiHook.Trade.OrderProcess.useCreate();
  const apiCreateEtc = ApiHook.Trade.OrderEtc.useCreate();
  const apiCreateRefund = ApiHook.Trade.OrderRefund.useCreate();
  const apiCreateReturn = ApiHook.Trade.OrderReturn.useCreate();
  const cmdCreate = useCallback(async () => {
    const values = (await form.validateFields()) as OrderCreateMixType;

    if (!me.data) {
      return;
    }

    const api =
      orderType === "DEPOSIT"
        ? apiCreateDeposit
        : orderType === "OUTSOURCE_PROCESS"
        ? apiCreateProcess
        : orderType === "ETC"
        ? apiCreateEtc
        : orderType === "REFUND"
        ? apiCreateRefund
        : orderType === "RETURN"
        ? apiCreateReturn
        : apiCreateNormal;

    const payload: OrderCreateMixType = props.isOffer
      ? {
          ...values,
          dstCompanyId: me.data.companyId,
          warehouseId: warehouse?.id ?? null,
        }
      : {
          ...values,
          srcCompanyId: me.data.companyId,
          warehouseId: warehouse?.id ?? null,
        };

    const created = await api.mutateAsync({
      data: payload,
    });

    props.onCreated(created);

    return created;
  }, [
    form,
    me.data,
    orderType,
    apiCreateDeposit,
    apiCreateProcess,
    apiCreateEtc,
    apiCreateRefund,
    apiCreateReturn,
    apiCreateNormal,
    props,
    warehouse?.id,
  ]);

  const apiUpdateStock = ApiHook.Trade.OrderStock.useUpdate();
  const apiUpdateDeposit = ApiHook.Trade.OrderDeposit.useUpdate();
  const apiUpdateProcess = ApiHook.Trade.OrderProcess.useUpdate();
  const apiUpdateEtc = ApiHook.Trade.OrderEtc.useUpdate();
  const apiUpdateRefund = ApiHook.Trade.OrderRefund.useUpdate();
  const apiUpdateReturn = ApiHook.Trade.OrderReturn.useUpdate();
  const cmdUpdate = useCallback(async () => {
    const values = form.getFieldsValue() as OrderUpdateMixType;

    if (props.initialOrder === null) {
      return;
    }

    const api =
      props.initialOrder.orderType === "DEPOSIT"
        ? apiUpdateDeposit
        : props.initialOrder.orderType === "OUTSOURCE_PROCESS"
        ? apiUpdateProcess
        : props.initialOrder.orderType === "ETC"
        ? apiUpdateEtc
        : props.initialOrder.orderType === "REFUND"
        ? apiUpdateRefund
        : props.initialOrder.orderType === "RETURN"
        ? apiUpdateReturn
        : apiUpdateStock;

    await api.mutateAsync({
      orderId: props.initialOrder.id,
      data: {
        ...values,
      },
    });
  }, [
    form,
    props.initialOrder,
    apiUpdateDeposit,
    apiUpdateProcess,
    apiUpdateEtc,
    apiUpdateRefund,
    apiUpdateReturn,
    apiUpdateStock,
  ]);

  const apiUpdateAssignNormal = ApiHook.Trade.OrderStock.useUpdateStock();
  const apiUpdateAssignDeposit = ApiHook.Trade.OrderDeposit.useUpdateStock();
  const apiUpdateAssignOutPro = ApiHook.Trade.OrderProcess.useUpdateStock();
  const apiUpdateAssignReturn = ApiHook.Trade.OrderReturn.useUpdateStock();
  const cmdUpdateAssign = useCallback(async () => {
    const values =
      (await form.validateFields()) as Api.OrderProcessStockUpdateRequest;

    if (props.initialOrder === null) {
      return;
    }

    const api =
      props.initialOrder.orderType === "OUTSOURCE_PROCESS"
        ? apiUpdateAssignOutPro
        : props.initialOrder.orderType === "DEPOSIT"
        ? apiUpdateAssignDeposit
        : props.initialOrder.orderType === "RETURN"
        ? apiUpdateAssignReturn
        : apiUpdateAssignNormal;

    await api.mutateAsync({
      orderId: props.initialOrder.id,
      data: {
        ...values,
      },
    });
  }, [
    form,
    props.initialOrder,
    apiUpdateAssignOutPro,
    apiUpdateAssignDeposit,
    apiUpdateAssignReturn,
    apiUpdateAssignNormal,
  ]);

  const compactQuantity = stockGroupQuantity.data
    ? QuantityUtil.compact(stockGroupQuantity.data, stockGroupQuantity.data)
    : null;

  useEffect(() => {
    if (compactQuantity) {
      form.setFieldsValue({
        locationId: undefined,
        wantedDate: undefined,
        productId: undefined,
        packagingId: undefined,
        grammage: undefined,
        sizeX: undefined,
        sizeY: undefined,
        paperColorGroupId: undefined,
        paperColorId: undefined,
        paperPatternId: undefined,
        paperCertId: undefined,
        quantity: undefined,
      });
    }
  }, [dstCompanyId, srcCompanyId, orderType]);

  return (
    <Form form={form} layout="vertical" rootClassName="w-full mb-32">
      <FormControl.Util.Split
        label={props.isSales ? "매출 정보" : "매입 정보"}
      />
      {props.initialOrder ? (
        <>
          <Form.Item name="orderType" hidden />
          <Form.Item label={props.isSales ? "매출 유형" : "매입 유형"} required>
            <Input
              disabled
              value={
                props.initialOrder.orderType === "NORMAL" &&
                props.initialOrder.depositEvent
                  ? `보관 ${props.isSales ? "출고" : "입고"}`
                  : props.initialOrder.orderType === "NORMAL"
                  ? `정상 ${props.isSales ? "매출" : "매입"}`
                  : props.initialOrder.orderType === "OUTSOURCE_PROCESS"
                  ? `외주 공정 ${props.isSales ? "매출" : "매입"}`
                  : props.initialOrder.orderType === "DEPOSIT"
                  ? `${props.isSales ? "매출" : "매입"} 보관`
                  : props.initialOrder.orderType === "REFUND"
                  ? `${props.isSales ? "매출 환불" : "매입 환불"}`
                  : props.initialOrder.orderType === "RETURN"
                  ? `${props.isSales ? "매출 반품" : "매입 반품"}`
                  : `기타 ${props.isSales ? "매출" : "매입"}`
              }
            />
          </Form.Item>
        </>
      ) : (
        <Form.Item
          name="orderType"
          label={props.isSales ? "매출 유형" : "매입 유형"}
          initialValue={"NORMAL"}
          required
        >
          <Select
            options={Array.from<{ label: string; value: Enum.OrderType }>([
              {
                label: props.isSales ? "정상 매출" : "정상 매입",
                value: "NORMAL",
              },
              {
                label: props.isSales ? "매출 보관" : "매입 보관",
                value: "DEPOSIT",
              },
              {
                label: props.isSales ? "외주 공정 매출" : "외주 공정 매입",
                value: "OUTSOURCE_PROCESS",
              },
              {
                label: props.isSales ? "기타 매출" : "기타 매입",
                value: "ETC",
              },
              {
                label: props.isSales ? "매출 환불" : "매입 환불",
                value: "REFUND",
              },
              {
                label: props.isSales ? "매출 반품" : "매입 반품",
                value: "RETURN",
              },
            ])}
            placeholder={props.isSales ? "매출 유형" : "매입 유형"}
            disabled={!!props.initialOrder}
            onChange={(_) =>
              form.setFieldsValue({
                srcCompanyId: undefined,
                dstCompanyId: undefined,
              })
            }
          />
        </Form.Item>
      )}
      {(orderType === "REFUND" || orderType === "RETURN") && (
        <Form.Item
          name="originOrderNo"
          label={props.isSales ? "원본 매출 번호" : "원본 매입 번호"}
        >
          <Input placeholder="원본 매출 번호" disabled={!!props.initialOrder} />
        </Form.Item>
      )}
      {!props.isSales && (
        <Form.Item name="dstCompanyId" label="매입처" rules={REQUIRED_RULES}>
          <FormControl.SelectCompanyPurchase
            disabled={!!props.initialOrder}
            virtual={
              orderType === "REFUND" || orderType === "RETURN"
                ? true
                : undefined
            }
          />
        </Form.Item>
      )}
      {props.isSales && !props.initialOrder && (
        <Form.Item name="srcCompanyId" label="매출처" rules={REQUIRED_RULES}>
          <FormControl.SelectCompanySales
            disabled={!!props.initialOrder}
            virtual={orderType === "OUTSOURCE_PROCESS" ? true : undefined}
          />
        </Form.Item>
      )}
      {props.isSales && props.initialOrder && (
        <Form.Item name="srcCompanyId" label="매출처" rules={REQUIRED_RULES}>
          <FormControl.SelectCompanySales disabled={!!props.initialOrder} />
        </Form.Item>
      )}
      <Form.Item
        name="orderDate"
        label={props.isSales ? "매출일" : "매입일"}
        rules={REQUIRED_RULES}
        initialValue={Util.dateToIso8601(dayjs())}
      >
        <FormControl.DatePicker disabled={!metaEditable || !props.isSales} />
      </Form.Item>

      {(orderType == "NORMAL" || orderType === "RETURN") &&
        (props.isSales && srcCompanyId ? (
          <Form.Item name="locationId" label="도착지" rules={REQUIRED_RULES}>
            <FormControl.SelectLocationForSales
              companyId={srcCompanyId}
              disabled={!metaEditable}
              initial={props.initialOrder?.orderStock?.dstLocation}
            />
          </Form.Item>
        ) : dstCompanyId ? (
          <Form.Item name="locationId" label="도착지" rules={REQUIRED_RULES}>
            <FormControl.SelectLocationForPurchase
              disabled={!metaEditable}
              initial={props.initialOrder?.orderStock?.dstLocation}
            />
          </Form.Item>
        ) : null)}
      {(orderType == "NORMAL" || orderType === "RETURN") && (
        <>
          <Form.Item
            name="wantedDate"
            label={props.isSales ? "납품 요청일" : "도착 희망일"}
            rules={REQUIRED_RULES}
          >
            <FormControl.DatePicker disabled={!metaEditable} />
          </Form.Item>
          {!props.isSales && orderType !== "RETURN" && (
            <Form.Item
              name="isDirectShipping"
              label="직송 여부"
              valuePropName="checked"
              rules={REQUIRED_RULES}
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          )}
        </>
      )}
      {orderType == "OUTSOURCE_PROCESS" && (srcCompanyId || dstCompanyId) && (
        <>
          <FormControl.Util.Split label="원지 배송 정보" />
          {props.isSales && srcCompanyId && (
            <Form.Item
              name="dstLocationId"
              label="원지 도착지"
              rules={REQUIRED_RULES}
            >
              <FormControl.SelectLocationForPurchase
                disabled={!metaEditable}
                initial={props.initialOrder?.orderProcess?.dstLocation}
              />
            </Form.Item>
          )}
          {!props.isSales && dstCompanyId && (
            <Form.Item
              name="dstLocationId"
              label="원지 도착지"
              rules={REQUIRED_RULES}
            >
              <FormControl.SelectLocationForSales
                companyId={dstCompanyId}
                disabled={!metaEditable}
                initial={props.initialOrder?.orderProcess?.dstLocation}
              />
            </Form.Item>
          )}
          <Form.Item
            name="dstWantedDate"
            label={props.isSales ? "원지 도착 예정일" : "원지 도착 예정일"}
            rules={REQUIRED_RULES}
          >
            <FormControl.DatePicker disabled={!metaEditable} />
          </Form.Item>
          <FormControl.Util.Split label="주문 배송 정보" />
          {props.isSales && srcCompanyId && (
            <Form.Item
              name="srcLocationId"
              label="최종 도착지"
              rules={REQUIRED_RULES}
            >
              <FormControl.SelectLocationForSales
                companyId={srcCompanyId}
                disabled={!metaEditable}
                initial={props.initialOrder?.orderProcess?.srcLocation}
              />
            </Form.Item>
          )}
          {!props.isSales && dstCompanyId && (
            <Form.Item
              name="srcLocationId"
              label="최종 도착지"
              rules={REQUIRED_RULES}
            >
              <FormControl.SelectLocationForPurchase
                disabled={!metaEditable}
                initial={props.initialOrder?.orderProcess?.srcLocation}
              />
            </Form.Item>
          )}
          <Form.Item
            name="srcWantedDate"
            label={props.isSales ? "최종 납품 요청일" : "최종 도착 희망일"}
            rules={REQUIRED_RULES}
          >
            <FormControl.DatePicker disabled={!metaEditable} />
          </Form.Item>
          {!props.isSales && (
            <Form.Item
              name="isSrcDirectShipping"
              label="최종 직송 여부"
              valuePropName="checked"
              rules={REQUIRED_RULES}
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          )}
        </>
      )}
      {(orderType == "ETC" || orderType === "REFUND") && (
        <Form.Item name="item" label="상품" rules={REQUIRED_RULES}>
          <Input />
        </Form.Item>
      )}
      <Form.Item name="memo" label="기타 요청사항">
        <Input.TextArea maxLength={100} disabled={!metaEditable} />
      </Form.Item>
      {props.initialOrder && metaEditable && (
        <div className="flex-initial flex justify-end">
          <Button.Preset.Edit
            label={`${props.isSales ? "수주" : "주문"} 정보 ${
              props.initialOrder ? "수정" : "등록"
            }`}
            onClick={cmdUpdate}
          />
        </div>
      )}
      {(srcCompanyId || dstCompanyId) &&
        (orderType === "NORMAL" ||
          orderType === "DEPOSIT" ||
          orderType === "OUTSOURCE_PROCESS" ||
          orderType === "RETURN") && (
          <>
            <FormControl.Util.Split
              label={
                props.isSales
                  ? orderType === "DEPOSIT"
                    ? "수주 보관 정보"
                    : orderType === "OUTSOURCE_PROCESS"
                    ? "입고 원지 정보"
                    : orderType === "RETURN"
                    ? "반품 원지 정보"
                    : "수주 원지 정보"
                  : orderType === "DEPOSIT"
                  ? "주문 보관 정보"
                  : orderType === "OUTSOURCE_PROCESS"
                  ? "출고 원지 정보"
                  : orderType === "RETURN"
                  ? "반품 원지 정보"
                  : "주문 원지 정보"
              }
            />
            {editable &&
              ((props.isSales && orderType === "NORMAL") ||
                (!props.isSales && orderType === "OUTSOURCE_PROCESS")) && (
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
            {editable &&
              !props.isSales &&
              !manual &&
              orderType === "NORMAL" && (
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
            {!manual && warehouse && (
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
                    <Input value={warehouse.name} disabled />
                  </Form.Item>
                )}
              </>
            )}

            <Form.Item name="planId" label="계획" hidden />
            <Form.Item
              name="packagingId"
              label="포장"
              rules={[{ required: true }]}
            >
              <FormControl.SelectPackaging disabled={!editable || !manual} />
            </Form.Item>
            <Form.Item
              name="productId"
              label="제품"
              rules={[{ required: true }]}
            >
              <FormControl.SelectProduct disabled={!editable || !manual} />
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
          {(props.isSales || !manual) && orderType === "NORMAL" && (
            <>
              <Form.Item label={"실물 수량"}>
                <FormControl.Quantity
                  spec={{
                    grammage,
                    sizeX,
                    sizeY,
                    packaging,
                  }}
                  value={compactQuantity?.totalQuantity}
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
                    (compactQuantity?.availableQuantity ?? 0) - (quantity ?? 0)
                  }
                  disabled
                />
              </Form.Item>
            </>
          )}
          {spec && (
            <Form.Item
              name="quantity"
              label={`${props.isSales ? "매출 " : "매입 "} ${
                orderType === "RETURN" ? "반품 " : ""
              }수량`}
            >
              <FormControl.Quantity spec={spec} disabled={!editable} />
            </Form.Item>
          )}
        </>
      )}
      {(((orderType === "ETC" || orderType === "REFUND") &&
        !props.initialOrder) ||
        packaging) &&
        editable && (
          <div className="flex-initial flex justify-end">
            <Button.Preset.Edit
              label={`다음`}
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
  const [openUpdate, setOpenUpdate] = useState<
    | {
        planId: number;
        productId: number;
        packagingId: number;
        grammage: number;
        sizeX: number;
        sizeY: number;
        paperColorGroupId: number | null;
        paperColorId: number | null;
        paperPatternId: number | null;
        paperCertId: number | null;
        quantity: number;
      }
    | false
  >(false);
  const [openUpdatePrice, setOpenUpdatePrice] = useState<
    | {
        planId: number;
        productId: number;
        packagingId: number;
        grammage: number;
        sizeX: number;
        sizeY: number;
        paperColorGroupId: number | null;
        paperColorId: number | null;
        paperPatternId: number | null;
        paperCertId: number | null;
      }
    | false
  >(false);
  const me = ApiHook.Auth.useGetMe();

  const accepted =
    props.order && Util.inc<OrderStatus>(props.order.status, "ACCEPTED");

  const [page, setPage] = usePage();
  const groupList = ApiHook.Trade.Common.useGetArrivalList({
    planId: props.order
      ? Util.planFromOrder(props.order, me.data?.companyId)?.id ?? null
      : null,
  });

  const [selectedGroup, setSelectedGroup] = useState<Model.PlanStockGroup[]>(
    []
  );
  const onlyGroup = Util.only(selectedGroup);

  const stockList = ApiHook.Stock.StockInhouse.useGetList({
    query: {
      initialPlanId: props.order
        ? Util.planFromOrder(props.order, me.data?.companyId)?.id
        : undefined,
      isZeroQuantityIncluded: "true",
      productId: onlyGroup?.product.id ?? undefined,
      packagingId: onlyGroup?.packaging.id ?? undefined,
      grammage: onlyGroup?.grammage ?? undefined,
      sizeX: onlyGroup?.sizeX ?? undefined,
      sizeY: onlyGroup?.sizeY ?? undefined,
      paperColorGroupId: onlyGroup?.paperColorGroup?.id ?? undefined,
      paperColorId: onlyGroup?.paperColor?.id ?? undefined,
      paperPatternId: onlyGroup?.paperPattern?.id ?? undefined,
      paperCertId: onlyGroup?.paperCert?.id ?? undefined,
    },
  });

  useEffect(() => {
    setSelectedGroup([]);
  }, [groupList.data]);

  const planId =
    (
      props.order?.orderStock ??
      props.order?.orderProcess ??
      props.order?.orderReturn
    )?.plan.find(mine(me.data))?.id ?? null;

  const plan = ApiHook.Working.Plan.useGetItem({
    id: planId,
  });

  const apiPlanStart = ApiHook.Working.Plan.useStart();
  const cmdPlanStart = useCallback(async () => {
    if (!plan.data) return;
    if (!(await Util.confirm("작업을 지시하시겠습니까?"))) return;
    await apiPlanStart.mutateAsync({
      id: plan.data.id,
    });
  }, [apiPlanStart, props.order, plan.data]);

  const apiPlanBackward = ApiHook.Working.Plan.useBackward();
  const cmdPlanBackward = useCallback(async () => {
    if (!plan.data) return;
    if (
      !(await Util.confirm(
        "현장 작업자에게 사전 공지한 후 취소할 것을 권장합니다. 작업 지시 취소 하시겠습니까?"
      ))
    )
      return;
    await apiPlanBackward.mutateAsync({
      id: plan.data.id,
    });
  }, [apiPlanBackward, props.order, plan.data]);

  const apiDelete = ApiHook.Trade.Common.useDeleteArrival();
  const cmdDelete = useCallback(
    async (value: Model.PlanStockGroup) => {
      if (!onlyGroup || !plan.data) return;
      if (!(await Util.confirm("예정 재고를 삭제하시겠습니까?"))) return;
      await apiDelete.mutateAsync({
        query: {
          planId: plan.data.id,
          productId: onlyGroup.product.id,
          packagingId: onlyGroup.packaging.id,
          grammage: onlyGroup.grammage,
          sizeX: onlyGroup.sizeX,
          sizeY: onlyGroup.sizeY,
          paperColorGroupId: onlyGroup.paperColorGroup?.id,
          paperColorId: onlyGroup.paperColor?.id,
          paperPatternId: onlyGroup.paperPattern?.id,
          paperCertId: onlyGroup.paperCert?.id,
        },
      });

      setSelectedGroup([]);
    },
    [apiDelete, onlyGroup]
  );

  const isVirtual = !!props.order?.dstCompany.managedById;

  const [tab, setTab] = useState<"plan" | "invoice">("plan");

  const invoices = ApiHook.Shipping.Invoice.useGetList({
    query: {
      planId: planId,
    },
  });
  const apiCancelInvoice = ApiHook.Shipping.Invoice.useCancel();
  const cmdCancelInvoice = useCallback(
    async (invoice: Model.Invoice) => {
      if (!(await Util.confirm("선택한 송장을 취소하시겠습니까?"))) return;
      await apiCancelInvoice.mutateAsync({
        data: {
          invoiceIds: [invoice.id],
        },
      });
    },
    [apiCancelInvoice]
  );

  useEffect(() => {
    setTab("plan");
  }, [planId]);

  return (
    <div className="flex-1 w-0 flex">
      <div className="flex-1 flex flex-col w-0">
        {props.order?.orderType === "NORMAL" ||
        props.order?.orderType === "OUTSOURCE_PROCESS" ||
        props.order?.orderType === "RETURN" ? (
          <>
            <Toolbar.Container rootClassName="px-4 basis-16">
              {plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" ||
                (props.order?.orderType === "RETURN" && (
                  <div className="flex-1 flex mt-4 gap-x-2 select-none">
                    <div
                      className={classNames(
                        "flex-initial flex items-center rounded-t-lg px-3 text-base cursor-pointer",
                        {
                          "bg-cyan-600 text-white": tab === "plan",
                          "bg-gray-200 text-gray-500": tab !== "plan",
                        }
                      )}
                      onClick={() => setTab("plan")}
                    >
                      작업 계획
                    </div>
                    <div
                      className={classNames(
                        "flex-initial flex items-center rounded-t-lg px-3 text-base cursor-pointer",
                        {
                          "bg-cyan-600 text-white": tab === "invoice",
                          "bg-gray-200 text-gray-500": tab !== "invoice",
                        }
                      )}
                      onClick={() => setTab("invoice")}
                    >
                      송장 목록
                    </div>
                  </div>
                ))}
              {(props.order.orderType === "NORMAL" ||
                props.order?.orderType === "OUTSOURCE_PROCESS" ||
                props.order.orderType === "RETURN") && (
                <div className="flex-initial flex gap-x-2 py-2">
                  {(props.order.orderType === "NORMAL" ||
                    props.order?.orderType === "OUTSOURCE_PROCESS") && (
                    <Toolbar.ButtonPreset.Create
                      label="예정 재고 추가"
                      disabled={!accepted}
                      tooltip={
                        !accepted
                          ? "입고 정보를 추가하려면 먼저 주문 승인을 받아야 합니다."
                          : undefined
                      }
                      onClick={() => props.order && setOpen(props.order.id)}
                    />
                  )}
                  {(plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" ||
                    plan.data?.type === "RETURN_BUYER") &&
                    plan.data.status === "PREPARING" && (
                      <Toolbar.ButtonPreset.Continue
                        label="작업 지시"
                        onClick={cmdPlanStart}
                      />
                    )}
                  {(plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" ||
                    plan.data?.type === "RETURN_BUYER") &&
                    plan.data.status === "PROGRESSING" && (
                      <Toolbar.ButtonPreset.Delete
                        label="작업 지시 취소"
                        onClick={cmdPlanBackward}
                      />
                    )}
                </div>
              )}
            </Toolbar.Container>
            <div className="flex-initial basis-px bg-gray-200" />
            {(plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" ||
              plan.data?.type === "RETURN_BUYER") &&
              tab === "plan" && (
                <div className="flex-1 flex h-0">
                  <div className="flex-1 bg-slate-100">
                    {plan.data?.assignStockEvent &&
                      (plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" ||
                        plan.data.type === "RETURN_BUYER") && (
                        <TaskMap
                          plan={plan.data}
                          packagingType={
                            plan.data.assignStockEvent.stock.packaging.type
                          }
                          readonly
                        />
                      )}
                  </div>
                </div>
              )}
            {(plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" ||
              plan.data?.type === "RETURN_BUYER") &&
              tab === "invoice" && (
                <div className="flex-1 flex flex-col overflow-y-scroll h-0 w">
                  <Table.Default<Model.Invoice>
                    data={invoices.data ?? undefined}
                    keySelector={(p) => p.id}
                    selection="none"
                    columns={[
                      {
                        title: "송장 번호",
                        dataIndex: "invoiceNo",
                        render: (value) => (
                          <div className="font-fixed">
                            {Util.formatSerial(value)}
                          </div>
                        ),
                      },
                      {
                        title: "상태",
                        render: (record: Model.Invoice) =>
                          Util.formatInvoiceStatus(record.invoiceStatus),
                      },
                      {
                        title: "도착지",
                        render: (_, record) =>
                          record.plan?.orderStock?.dstLocation.name ??
                          record.plan?.orderProcess?.srcLocation.name,
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
                              Util.findPaperSize(
                                record.sizeX ?? 1,
                                record.sizeY ?? 1
                              )?.name
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
                        key: "action",
                        render: (record: Model.Invoice) => (
                          <div className="flex gap-x-1 h-8">
                            {record.invoiceStatus !== "CANCELLED" && (
                              <button
                                className="flex-initial bg-red-500 text-white rounded-sm px-2"
                                onClick={() => cmdCancelInvoice(record)}
                              >
                                송장 취소
                              </button>
                            )}
                          </div>
                        ),
                        width: "100px",
                        fixed: "right",
                      },
                    ]}
                  />
                </div>
              )}
            {(plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" ||
              plan.data?.type === "TRADE_NORMAL_BUYER") && (
              <div className="flex-1 overflow-y-scroll pb-4">
                <div className="flex-1 flex flex-col gap-y-2">
                  <Table.Default<Model.PlanStockGroup>
                    data={groupList.data ?? undefined}
                    keySelector={Util.keyOfStockGroup}
                    selection="single"
                    selected={selectedGroup}
                    onSelectedChange={setSelectedGroup}
                    columns={[
                      {
                        title: "구분",
                        render: (record: Model.PlanStockGroup) =>
                          !!record.plan?.orderStock?.isDirectShipping ||
                          !!record.plan?.orderProcess?.isSrcDirectShipping
                            ? "직송"
                            : record.plan
                            ? "입고 전"
                            : "입고 완료",
                      },
                      ...Table.Preset.columnStockGroup<Model.PlanStockGroup>(
                        (p) => p
                      ),
                      ...Table.Preset.columnQuantity<Model.PlanStockGroup>(
                        (p) => p,
                        (p) => p.quantity,
                        { prefix: "" }
                      ),
                      {
                        render: (record: Model.PlanStockGroup) => (
                          <div className="flex gap-x-1 h-8">
                            {!record.warehouse && !record.isAssigned && (
                              <button
                                className="flex-initial bg-slate-500 text-white rounded-sm px-2"
                                onClick={() =>
                                  record.plan &&
                                  setOpenUpdate({
                                    planId: record.plan.id,
                                    productId: record.product.id,
                                    packagingId: record.packaging.id,
                                    grammage: record.grammage,
                                    sizeX: record.sizeX,
                                    sizeY: record.sizeY,
                                    paperColorGroupId:
                                      record.paperColorGroup?.id ?? null,
                                    paperColorId: record.paperColor?.id ?? null,
                                    paperPatternId:
                                      record.paperPattern?.id ?? null,
                                    paperCertId: record.paperCert?.id ?? null,
                                    quantity: record.quantity,
                                  })
                                }
                              >
                                수정
                              </button>
                            )}
                            {!record.warehouse && !record.isAssigned && (
                              <button
                                className="flex-initial bg-slate-500 text-white rounded-sm px-2"
                                onClick={() =>
                                  record.plan &&
                                  setOpenUpdatePrice({
                                    planId: record.plan.id,
                                    productId: record.product.id,
                                    packagingId: record.packaging.id,
                                    grammage: record.grammage,
                                    sizeX: record.sizeX,
                                    sizeY: record.sizeY,
                                    paperColorGroupId:
                                      record.paperColorGroup?.id ?? null,
                                    paperColorId: record.paperColor?.id ?? null,
                                    paperPatternId:
                                      record.paperPattern?.id ?? null,
                                    paperCertId: record.paperCert?.id ?? null,
                                  })
                                }
                              >
                                금액 수정
                              </button>
                            )}
                            {!record.warehouse && !record.isAssigned && (
                              <button
                                className="flex-initial bg-red-500 text-white rounded-sm px-2"
                                onClick={() => cmdDelete(record)}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        ),
                        fixed: "right",
                      },
                    ]}
                  />
                  {onlyGroup &&
                    (!onlyGroup.plan ? (
                      <Table.Default<Model.Stock>
                        data={stockList.data ?? undefined}
                        page={page}
                        setPage={setPage}
                        keySelector={(record) => `${record.id}`}
                        selection="none"
                        columns={[...Table.Preset.columnStock()]}
                      />
                    ) : (
                      <Alert
                        type="info"
                        message="아직 입고처리 되지 않은 예정재고입니다."
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 flex">
              <RightSideSkeleton
                title={`${
                  props.order?.orderType === "DEPOSIT" ? "보관품" : "기타"
                } 거래입니다.`}
              />
            </div>
          </>
        )}
      </div>
      {props.order && (
        <>
          <div className="basis-px bg-gray-200" />
          {props.order.orderType === "NORMAL" ||
          props.order.orderType === "DEPOSIT" ? (
            <PricePanel order={props.order} orderId={props.order.id} />
          ) : (
            <BasePricePanel order={props.order} orderId={props.order.id} />
          )}
        </>
      )}
      <CreateArrival open={open} onClose={setOpen} />
      <UpdateArrival open={openUpdate} onClose={setOpenUpdate} />
      <UpdateArrivalPrice open={openUpdatePrice} onClose={setOpenUpdatePrice} />
    </div>
  );
}

interface RightSideSalesProps {
  order: Model.Order | null;
}
function RightSideSales(props: RightSideSalesProps) {
  const [open, setOpen] = useState<number | false>(false);
  const [openUpdate, setOpenUpdate] = useState<
    | {
        planId: number;
        productId: number;
        packagingId: number;
        grammage: number;
        sizeX: number;
        sizeY: number;
        paperColorGroupId: number | null;
        paperColorId: number | null;
        paperPatternId: number | null;
        paperCertId: number | null;
        quantity: number;
      }
    | false
  >(false);
  const [openUpdatePrice, setOpenUpdatePrice] = useState<
    | {
        planId: number;
        productId: number;
        packagingId: number;
        grammage: number;
        sizeX: number;
        sizeY: number;
        paperColorGroupId: number | null;
        paperColorId: number | null;
        paperPatternId: number | null;
        paperCertId: number | null;
      }
    | false
  >(false);
  const apiRequest = ApiHook.Trade.Common.useRequest();
  const cmdRequest = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("재고 승인을 요청하시겠습니까?"))) return;
    await apiRequest.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiRequest, props.order]);

  const apiAccept = ApiHook.Trade.Common.useAccept();
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

  const apiReject = ApiHook.Trade.Common.useReject();
  const cmdReject = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("주문을 거절하시겠습니까?"))) return;
    await apiReject.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiReject, props.order]);

  const apiCancel = ApiHook.Trade.Common.useDelete();
  const cmdCancel = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("수주를 삭제하시겠습니까?"))) return;
    await apiCancel.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiCancel, props.order]);

  const apiReset = ApiHook.Trade.Common.useReset();
  const cmdReset = useCallback(async () => {
    if (!props.order) return;
    if (!(await Util.confirm("수주 내용을 재입력하시겠습니까?"))) return;
    await apiReset.mutateAsync({
      orderId: props.order.id,
    });
  }, [apiReset, props.order]);

  const apiPlanStart = ApiHook.Working.Plan.useStart();
  const cmdPlanStart = useCallback(async () => {
    const plan = (
      props.order?.orderStock ??
      props.order?.orderProcess ??
      props.order?.orderReturn
    )?.plan.find((p) => p.companyId === props.order?.dstCompany.id);
    if (!plan) return;
    if (!(await Util.confirm("작업을 지시하시겠습니까?"))) return;
    await apiPlanStart.mutateAsync({
      id: plan.id,
    });
  }, [apiPlanStart, props.order]);

  const apiPlanBackward = ApiHook.Working.Plan.useBackward();
  const cmdPlanBackward = useCallback(async () => {
    const plan = (
      props.order?.orderStock ??
      props.order?.orderProcess ??
      props.order?.orderReturn
    )?.plan.find((p) => p.companyId === props.order?.dstCompany.id);
    if (!plan) return;

    if (
      !(await Util.confirm(
        "현장 작업자에게 사전 공지한 후 취소할 것을 권장합니다. 작업 지시 취소 하시겠습니까?"
      ))
    )
      return;
    await apiPlanBackward.mutateAsync({
      id: plan.id,
    });
  }, [apiPlanBackward, props.order]);

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
    ? [{ title: "수주 내용 작성중" }, { title: "매출정보 입력" }]
    : [
        { title: "주문 작성" },
        { title: "주문 승인 대기" },
        { title: "매출정보 입력" },
      ];

  const me = ApiHook.Auth.useGetMe();

  // 도착예정재고

  const accepted =
    props.order && Util.inc<OrderStatus>(props.order.status, "ACCEPTED");

  const [page, setPage] = usePage();
  const groupList = ApiHook.Trade.Common.useGetArrivalList({
    planId: props.order
      ? Util.planFromOrder(props.order, me.data?.companyId)?.id ?? null
      : null,
  });

  const [selectedGroup, setSelectedGroup] = useState<Model.PlanStockGroup[]>(
    []
  );
  const onlyGroup = Util.only(selectedGroup);

  const stockList = ApiHook.Stock.StockInhouse.useGetList({
    query: {
      initialPlanId: props.order
        ? Util.planFromOrder(props.order, me.data?.companyId)?.id
        : undefined,
      isZeroQuantityIncluded: "true",
      productId: onlyGroup?.product.id ?? undefined,
      packagingId: onlyGroup?.packaging.id ?? undefined,
      grammage: onlyGroup?.grammage ?? undefined,
      sizeX: onlyGroup?.sizeX ?? undefined,
      sizeY: onlyGroup?.sizeY ?? undefined,
      paperColorGroupId: onlyGroup?.paperColorGroup?.id ?? undefined,
      paperColorId: onlyGroup?.paperColor?.id ?? undefined,
      paperPatternId: onlyGroup?.paperPattern?.id ?? undefined,
      paperCertId: onlyGroup?.paperCert?.id ?? undefined,
    },
  });

  useEffect(() => {
    setSelectedGroup([]);
  }, [groupList.data]);

  const apiDelete = ApiHook.Trade.Common.useDeleteArrival();
  const cmdDelete = useCallback(
    async (value: Model.PlanStockGroup) => {
      if (!onlyGroup || !plan.data) return;
      if (!(await Util.confirm("예정 재고를 삭제하시겠습니까?"))) return;
      await apiDelete.mutateAsync({
        query: {
          planId: plan.data.id,
          productId: onlyGroup.product.id,
          packagingId: onlyGroup.packaging.id,
          grammage: onlyGroup.grammage,
          sizeX: onlyGroup.sizeX,
          sizeY: onlyGroup.sizeY,
          paperColorGroupId: onlyGroup.paperColorGroup?.id,
          paperColorId: onlyGroup.paperColor?.id,
          paperPatternId: onlyGroup.paperPattern?.id,
          paperCertId: onlyGroup.paperCert?.id,
        },
      });

      setSelectedGroup([]);
    },
    [apiDelete, onlyGroup]
  );

  const planId =
    (
      props.order?.orderStock ??
      props.order?.orderProcess ??
      props.order?.orderReturn
    )?.plan.find(mine(me.data))?.id ?? null;

  const plan = ApiHook.Working.Plan.useGetItem({
    id: planId,
  });

  const invoices = ApiHook.Shipping.Invoice.useGetList({
    query: {
      planId: planId,
    },
  });
  const apiCancelInvoice = ApiHook.Shipping.Invoice.useCancel();
  const cmdCancelInvoice = useCallback(
    async (invoice: Model.Invoice) => {
      if (!(await Util.confirm("선택한 송장을 취소하시겠습니까?"))) return;
      await apiCancelInvoice.mutateAsync({
        data: {
          invoiceIds: [invoice.id],
        },
      });
    },
    [apiCancelInvoice]
  );

  const targetPlan = (
    props.order?.orderProcess?.plan ??
    props.order?.orderStock?.plan ??
    props.order?.orderReturn?.plan
  )?.find((p) => p.companyId === props.order?.dstCompany.id);

  return (
    <div className="flex-1 w-0 flex">
      <div className="flex-1 flex flex-col w-0">
        {(props.order?.status === "ACCEPTED" ||
          props.order?.status === "CANCELLED" ||
          props.order?.orderType === "RETURN") && (
          <Toolbar.Container rootClassName="flex-1 px-4 py-2">
            {props.order?.orderType !== "RETURN" &&
              targetPlan?.status === "PREPARING" && (
                <Toolbar.ButtonPreset.Continue
                  label="작업 지시"
                  onClick={cmdPlanStart}
                />
              )}
            {props.order?.orderType !== "RETURN" &&
              targetPlan?.status === "PROGRESSING" && (
                <Toolbar.ButtonPreset.Delete
                  label="작업 지시 취소"
                  onClick={cmdPlanBackward}
                />
              )}
            {props.order?.orderType === "RETURN" && (
              <div className="flex-initial flex gap-x-2 py-2">
                <Toolbar.ButtonPreset.Create
                  label="예정 재고 추가"
                  disabled={!accepted}
                  tooltip={
                    !accepted
                      ? "입고 정보를 추가하려면 먼저 주문 승인을 받아야 합니다."
                      : undefined
                  }
                  onClick={() => props.order && setOpen(props.order.id)}
                />
                {plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" &&
                  plan.data.status === "PREPARING" && (
                    <Toolbar.ButtonPreset.Continue
                      label="작업 지시"
                      onClick={cmdPlanStart}
                    />
                  )}
                {plan.data?.type === "TRADE_OUTSOURCE_PROCESS_BUYER" &&
                  plan.data.status === "PROGRESSING" && (
                    <Toolbar.ButtonPreset.Delete
                      label="작업 지시 취소"
                      onClick={cmdPlanBackward}
                    />
                  )}
              </div>
            )}
          </Toolbar.Container>
        )}
        {plan.data?.assignStockEvent && (
          <>
            <div className="basis-px bg-gray-200" />
            <div className="flex-1 flex h-0">
              <div className="flex-1 bg-slate-100">
                <TaskMap
                  plan={plan.data}
                  packagingType={
                    plan.data.assignStockEvent.stock.packaging.type
                  }
                  readonly
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-scroll h-0 w">
              <Table.Default<Model.Invoice>
                data={invoices.data ?? undefined}
                keySelector={(p) => p.id}
                selection="none"
                columns={[
                  {
                    title: "송장 번호",
                    dataIndex: "invoiceNo",
                    render: (value) => (
                      <div className="font-fixed">
                        {Util.formatSerial(value)}
                      </div>
                    ),
                  },
                  {
                    title: "상태",
                    render: (record: Model.Invoice) =>
                      Util.formatInvoiceStatus(record.invoiceStatus),
                  },
                  {
                    title: "도착지",
                    render: (_, record) =>
                      record.plan?.orderStock?.dstLocation.name ??
                      record.plan?.orderProcess?.srcLocation.name,
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
                          Util.findPaperSize(
                            record.sizeX ?? 1,
                            record.sizeY ?? 1
                          )?.name
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
                    key: "action",
                    render: (record: Model.Invoice) => (
                      <div className="flex gap-x-1 h-8">
                        {record.invoiceStatus !== "CANCELLED" && (
                          <button
                            className="flex-initial bg-red-500 text-white rounded-sm px-2"
                            onClick={() => cmdCancelInvoice(record)}
                          >
                            송장 취소
                          </button>
                        )}
                      </div>
                    ),
                    width: "100px",
                    fixed: "right",
                  },
                ]}
              />
            </div>
          </>
        )}
        {plan.data?.type === "RETURN_SELLER" && (
          <div className="flex-1 overflow-y-scroll pb-4">
            <div className="flex-1 flex flex-col gap-y-2">
              <Table.Default<Model.PlanStockGroup>
                data={groupList.data ?? undefined}
                keySelector={Util.keyOfStockGroup}
                selection="single"
                selected={selectedGroup}
                onSelectedChange={setSelectedGroup}
                columns={[
                  {
                    title: "구분",
                    render: (record: Model.PlanStockGroup) =>
                      !!record.plan?.orderStock?.isDirectShipping ||
                      !!record.plan?.orderProcess?.isSrcDirectShipping
                        ? "직송"
                        : record.plan
                        ? "입고 전"
                        : "입고 완료",
                  },
                  ...Table.Preset.columnStockGroup<Model.PlanStockGroup>(
                    (p) => p
                  ),
                  ...Table.Preset.columnQuantity<Model.PlanStockGroup>(
                    (p) => p,
                    (p) => p.quantity,
                    { prefix: "" }
                  ),
                  {
                    render: (record: Model.PlanStockGroup) => (
                      <div className="flex gap-x-1 h-8">
                        {!record.warehouse && !record.isAssigned && (
                          <button
                            className="flex-initial bg-slate-500 text-white rounded-sm px-2"
                            onClick={() =>
                              record.plan &&
                              setOpenUpdate({
                                planId: record.plan.id,
                                productId: record.product.id,
                                packagingId: record.packaging.id,
                                grammage: record.grammage,
                                sizeX: record.sizeX,
                                sizeY: record.sizeY,
                                paperColorGroupId:
                                  record.paperColorGroup?.id ?? null,
                                paperColorId: record.paperColor?.id ?? null,
                                paperPatternId: record.paperPattern?.id ?? null,
                                paperCertId: record.paperCert?.id ?? null,
                                quantity: record.quantity,
                              })
                            }
                          >
                            수정
                          </button>
                        )}
                        {!record.warehouse && !record.isAssigned && (
                          <button
                            className="flex-initial bg-slate-500 text-white rounded-sm px-2"
                            onClick={() =>
                              record.plan &&
                              setOpenUpdatePrice({
                                planId: record.plan.id,
                                productId: record.product.id,
                                packagingId: record.packaging.id,
                                grammage: record.grammage,
                                sizeX: record.sizeX,
                                sizeY: record.sizeY,
                                paperColorGroupId:
                                  record.paperColorGroup?.id ?? null,
                                paperColorId: record.paperColor?.id ?? null,
                                paperPatternId: record.paperPattern?.id ?? null,
                                paperCertId: record.paperCert?.id ?? null,
                              })
                            }
                          >
                            금액 수정
                          </button>
                        )}
                        {!record.warehouse && !record.isAssigned && (
                          <button
                            className="flex-initial bg-red-500 text-white rounded-sm px-2"
                            onClick={() => cmdDelete(record)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    ),
                    fixed: "right",
                  },
                ]}
              />
              {onlyGroup &&
                (!onlyGroup.plan ? (
                  <Table.Default<Model.Stock>
                    data={stockList.data ?? undefined}
                    page={page}
                    setPage={setPage}
                    keySelector={(record) => `${record.id}`}
                    selection="none"
                    columns={[...Table.Preset.columnStock()]}
                  />
                ) : (
                  <Alert
                    type="info"
                    message="아직 입고처리 되지 않은 예정재고입니다."
                  />
                ))}
            </div>
          </div>
        )}
        {props.order?.orderType === "OUTSOURCE_PROCESS" &&
          plan.data?.assignStockEvent && (
            <>
              <div className="basis-px bg-gray-200" />
              <div className="flex-initial p-4 text-lg font-bold text-slate-800 flex justify-center items-center gap-x-4">
                {plan.data.assignStockEvent?.stock.warehouse ? (
                  <TbCircleCheck className="flex-initial text-2xl" />
                ) : (
                  <TbDots className="flex-initial text-2xl" />
                )}
                <div className="flex-initial basis-0.5 bg-slate-200 h-2/3" />
                <div className="flex-initial">
                  {plan.data.assignStockEvent?.stock.warehouse
                    ? "원지 입고 완료"
                    : "원지 입고 대기중"}
                </div>
              </div>
            </>
          )}
      </div>
      <div className="basis-px bg-gray-200" />
      {props.order &&
        (props.order.orderType === "NORMAL" ||
        props.order?.orderType === "DEPOSIT" ? (
          <>
            <PricePanel order={props.order} orderId={props.order.id} />
          </>
        ) : (
          <BasePricePanel order={props.order} orderId={props.order.id} />
        ))}
      <CreateArrival open={open} onClose={setOpen} />
      <UpdateArrival open={openUpdate} onClose={setOpenUpdate} />
      <UpdateArrivalPrice open={openUpdatePrice} onClose={setOpenUpdatePrice} />
    </div>
  );
}

interface PricePanelProps {
  order: Model.Order;
  orderId: number | null;
}
function PricePanel(props: PricePanelProps) {
  const [form] = useForm();

  const depositId = useWatch<number>(["deposit", "depositId"], form);
  const depositGrammage = useWatch<number>(["deposit", "grammage"], form);
  const depositSizeX = useWatch<number>(["deposit", "sizeX"], form);
  const depositSizeY = useWatch<number>(["deposit", "sizeY"], form);
  const depositPackaging = useWatch<Model.Packaging>(
    ["deposit", "packaging"],
    form
  );
  const depositTotalQuantity = useWatch<number>(
    ["deposit", "totalQuantity"],
    form
  );
  const depositQuantity = useWatch<number>(["deposit", "quantity"], form);

  const depositSpec =
    depositGrammage && depositSizeX && depositPackaging
      ? {
          grammage: depositGrammage,
          sizeX: depositSizeX,
          sizeY: depositSizeY ?? 1,
          packaging: depositPackaging,
        }
      : null;

  const altBundle = useWatch<Model.OrderStockTradeAltBundle>(
    ["orderStockTradeAltBundle"],
    form
  );
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
  const isSyncPrice = useWatch<boolean>(["isSyncPrice"], form);

  const me = ApiHook.Auth.useGetMe();

  const assignSpec: {
    product: Model.Product;
    grammage: number;
    sizeX: number;
    sizeY: number;
    packaging: Model.Packaging;
    paperColorGroup: Model.PaperColorGroup | null;
    paperColor: Model.PaperColor | null;
    paperPattern: Model.PaperPattern | null;
    paperCert: Model.PaperCert | null;
    quantity: number;
  } | null = useMemo(() => {
    const assignStock = Util.assignStockFromOrder(props.order);
    const quantity = Util.assignQuantityFromOrder(props.order);

    return assignStock
      ? {
          ...assignStock,
          sizeX: altSizeX ?? assignStock.sizeX,
          sizeY: altSizeY ?? assignStock.sizeY,
          quantity: altQuantity ?? quantity,
        }
      : null;
  }, [
    props.order.orderStock?.plan,
    props.order.orderDeposit,
    props.order.dstCompany.id,
    altQuantity,
  ]);

  const stockSuppliedPrice = useMemo(() => {
    if (!assignSpec) {
      return 0;
    }

    const convert = (unit: "g" | "BOX" | "매") =>
      PaperUtil.convertQuantityWith(assignSpec, unit, assignSpec.quantity);

    const converted =
      assignSpec.packaging.type === "ROLL"
        ? convert("g")
        : assignSpec.packaging.type === "BOX"
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
  }, [assignSpec, unitPrice, unitPriceUnit]);

  const processPrice = useWatch<number | null>(["processPrice"], form);
  const suppliedPrice = useWatch<number | null>(["suppliedPrice"], form);
  const vatPrice = useWatch<number | null>(["vatPrice"], form);

  const deposit = ApiHook.Trade.Common.useGetDeposit({
    orderId: props.order.id,
  });
  const tradePrice = ApiHook.Trade.Common.useGetTradePrice({
    orderId: props.order.id,
  });

  const apiUpdate = ApiHook.Trade.Common.useUpdateTradePrice();
  const cmdUpdate = useCallback(async () => {
    if (!props.order || !me.data) return;
    await form.validateFields();
    const values = await form.getFieldsValue();

    await apiUpdate.mutateAsync({
      orderId: props.order.id,
      data: {
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
        orderDepositTradePrice: {
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
        isSyncPrice: values.isSyncPrice,
      },
    });
  }, [props.order, me.data, form, apiUpdate]);

  const apiUpdateDeposit = ApiHook.Trade.Common.useUpdateDeposit();
  const cmdUpsertDeposit = useCallback(async () => {
    if (!props.order || !me.data) return;
    await form.validateFields();
    const values = await form.getFieldsValue();

    await apiUpdateDeposit.mutateAsync({
      orderId: props.order.id,
      data: {
        depositId: depositId,
        quantity: depositQuantity,
      },
    });
  }, [
    props.order,
    me.data,
    form,
    apiUpdateDeposit,
    depositId,
    depositQuantity,
  ]);
  const apiDeleteDeposit = ApiHook.Trade.Common.useDeleteDeposit();
  const cmdDeleteDeposit = useCallback(async () => {
    if (!props.order || !me.data) return;
    if (!(await Util.confirm("보관품을 삭제하시겠습니까?"))) return;

    await apiDeleteDeposit.mutateAsync({
      orderId: props.order.id,
    });

    form.setFieldValue("deposit", undefined);
  }, [props.order, me.data, apiDeleteDeposit, form]);

  const defaultSuppliedPrice = stockSuppliedPrice + (processPrice ?? 0);
  const defaultVatPrice = (suppliedPrice ?? 0) * 0.1;

  useEffect(() => {
    if (!assignSpec) {
      return;
    }
    form.setFieldValue(
      "stockPrice",
      FormControl.Util.Price.initialStockPrice(
        altSizeX && altSizeY
          ? "SKID"
          : altSizeX
          ? "ROLL"
          : assignSpec.packaging.type
      )
    );
  }, [altSizeX, altSizeY, assignSpec?.packaging, form]);

  const positiveCompany = [props.order.srcCompany, props.order.dstCompany]
    .filter((_) => me.data)
    .find((p) => p.id !== me.data?.companyId);

  const isSales = props.order.dstCompany.id === me.data?.companyId;

  useEffect(() => {
    if (deposit.data?.depositEvent) {
      form.setFieldsValue({
        deposit: {
          depositId: deposit.data.depositEvent.deposit.id,
          productId: deposit.data.depositEvent.deposit.product.id,
          grammage: deposit.data.depositEvent.deposit.grammage,
          sizeX: deposit.data.depositEvent.deposit.sizeX,
          sizeY: deposit.data.depositEvent.deposit.sizeY,
          packaging: deposit.data.depositEvent.deposit.packaging,
          paperColorGroupId:
            deposit.data.depositEvent.deposit.paperColorGroup?.id,
          paperColorId: deposit.data.depositEvent.deposit.paperColor?.id,
          paperPatternId: deposit.data.depositEvent.deposit.paperPattern?.id,
          paperCertId: deposit.data.depositEvent.deposit.paperCert?.id,
          quantity: -deposit.data.depositEvent.change,
        },
      });
    } else {
      form.setFieldsValue({
        deposit: undefined,
      });
    }
  }, [props.orderId, deposit.data, tradePrice.data, form]);

  useEffect(() => {
    const priceData =
      tradePrice.data?.orderStockTradePrice ??
      tradePrice.data?.orderDepositTradePrice;
    if (tradePrice.data && priceData) {
      if (tradePrice.data.orderStockTradePrice?.orderStockTradeAltBundle) {
        form.setFieldsValue({
          orderStockTradeAltBundle:
            tradePrice.data.orderStockTradePrice?.orderStockTradeAltBundle,
          stockPrice: priceData,
          processPrice: priceData.processPrice,
          suppliedPrice: tradePrice.data.suppliedPrice,
          vatPrice: tradePrice.data.vatPrice,
        });
      } else {
        form.setFieldsValue({
          stockPrice: priceData,
          processPrice: priceData.processPrice,
          suppliedPrice: tradePrice.data.suppliedPrice,
          vatPrice: tradePrice.data.vatPrice,
        });
      }
    } else if (assignSpec) {
      form.setFieldsValue({
        stockPrice: FormControl.Util.Price.initialStockPrice("ROLL"),
        processPrice: 0,
        suppliedPrice: 0,
        vatPrice: 0,
      });
    }
  }, [props.orderId, tradePrice.data, form, assignSpec]);

  return (
    <div className="flex-[0_0_460px] overflow-y-scroll p-4 flex">
      <Form
        form={form}
        layout="vertical"
        rootClassName="flex-initial basis-[500px]"
        initialValues={{
          price: FormControl.Util.Price.initialStockPrice(
            assignSpec?.packaging.type ?? "SKID"
          ),
        }}
      >
        {props.order.orderType === "NORMAL" && positiveCompany && (
          <>
            <FormControl.Util.Split
              label={isSales ? "보관 출고" : "보관 입고"}
            />
            <Form.Item name="deposit">
              {props.order.status !== "CANCELLED" ? (
                <div className="flex-1 flex gap-x-2">
                  <Button.Preset.SelectDeposit
                    option={{
                      type: isSales ? "SALES" : "PURCHASE",
                      companyRegistrationNumber:
                        positiveCompany.companyRegistrationNumber,
                    }}
                    onSelect={(deposit) => {
                      form.setFieldsValue({
                        deposit: {
                          depositId: deposit.id,
                          productId: deposit.product.id,
                          grammage: deposit.grammage,
                          sizeX: deposit.sizeX,
                          sizeY: deposit.sizeY,
                          packaging: deposit.packaging,
                          paperColorGroupId: deposit.paperColorGroup?.id,
                          paperColorId: deposit.paperColor?.id,
                          paperPatternId: deposit.paperPattern?.id,
                          paperCertId: deposit.paperCert?.id,
                          totalQuantity: deposit.quantity,
                          quantity: 0,
                        },
                      });
                    }}
                    rootClassName="flex-1"
                  />
                </div>
              ) : (
                <Alert
                  message="취소된 주문의 보관품은 수정할 수 없습니다."
                  className="mb-4"
                />
              )}
            </Form.Item>
            {depositSpec && (
              <>
                <Form.Item name={["deposit", "packaging", "id"]} label="포장">
                  <FormControl.SelectPackaging disabled />
                </Form.Item>
                <Form.Item name={["deposit", "productId"]} label="제품">
                  <FormControl.SelectProduct disabled />
                </Form.Item>
                <Form.Item
                  name={["deposit", "grammage"]}
                  label="평량"
                  rootClassName="flex-1"
                >
                  <Number
                    min={0}
                    max={9999}
                    precision={0}
                    unit={Util.UNIT_GPM}
                    disabled
                  />
                </Form.Item>
                {depositPackaging && (
                  <Form.Item>
                    <div className="flex justify-between gap-x-2">
                      {depositPackaging.type !== "ROLL" && (
                        <Form.Item label="규격" rootClassName="flex-1">
                          <FormControl.Util.PaperSize
                            sizeX={depositSizeX}
                            sizeY={depositSizeY}
                            onChange={(sizeX, sizeY) =>
                              form.setFieldsValue({ sizeX, sizeY })
                            }
                            disabled
                          />
                        </Form.Item>
                      )}
                      <Form.Item
                        name={["deposit", "sizeX"]}
                        label="지폭"
                        rootClassName="flex-1"
                      >
                        <Number
                          min={0}
                          max={9999}
                          precision={0}
                          unit="mm"
                          disabled
                        />
                      </Form.Item>
                      {depositPackaging.type !== "ROLL" && (
                        <Form.Item
                          name={["deposit", "sizeY"]}
                          label="지장"
                          rootClassName="flex-1"
                        >
                          <Number
                            min={0}
                            max={9999}
                            precision={0}
                            unit="mm"
                            disabled
                          />
                        </Form.Item>
                      )}
                    </div>
                  </Form.Item>
                )}
                <Form.Item name={["deposit", "paperColorGroupId"]} label="색군">
                  <FormControl.SelectColorGroup disabled />
                </Form.Item>
                <Form.Item name={["deposit", "paperColorId"]} label="색상">
                  <FormControl.SelectColor disabled />
                </Form.Item>
                <Form.Item name={["deposit", "paperPatternId"]} label="무늬">
                  <FormControl.SelectPattern disabled />
                </Form.Item>
                <Form.Item name={["deposit", "paperCertId"]} label="인증">
                  <FormControl.SelectCert disabled />
                </Form.Item>
                {depositSpec && (
                  <>
                    <Form.Item
                      name={["deposit", "quantity"]}
                      label={isSales ? "출고 수량" : "입고 수량"}
                      rules={[
                        {
                          required: true,
                          message: `${
                            isSales ? "출고" : "입고"
                          } 수량을 입력해주세요.`,
                        },
                      ]}
                    >
                      <FormControl.Quantity
                        spec={depositSpec}
                        disabled={props.order.status === "CANCELLED"}
                      />
                    </Form.Item>
                  </>
                )}
                {props.order.status !== "CANCELLED" && (
                  <div className="flex-initial flex justify-end mt-4 gap-x-2">
                    <Button.Default
                      type="primary"
                      icon={<TbX />}
                      label={isSales ? "보관 출고 취소" : "보관 입고 취소"}
                      onClick={cmdDeleteDeposit}
                      rootClassName="flex-1"
                    />
                    <Button.Default
                      type="secondary"
                      label={isSales ? "보관 출고 저장" : "보관 입고 저장"}
                      onClick={cmdUpsertDeposit}
                      rootClassName="flex-1"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
        <FormControl.Util.Split label="금액 정보" />
        {props.order.orderType !== "ETC" &&
          props.order.orderType !== "OUTSOURCE_PROCESS" &&
          assignSpec && (
            <>
              <Form.Item label="단가 대체" name={["orderStockTradeAltBundle"]}>
                <FormControl.Alt spec={{ grammage: assignSpec.grammage }} />
              </Form.Item>
              <Alert
                message="단가 대체 규격을 수정하면 거래 금액정보가 초기화됩니다."
                type="info"
                rootClassName="mb-2"
              />
              <Form.Item label="거래 단가" name={["stockPrice"]}>
                {positiveCompany && assignSpec && (
                  <FormControl.StockPrice
                    spec={{
                      grammage: assignSpec.grammage,
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
                          : assignSpec.packaging,
                      sizeX: altSizeX ?? assignSpec.sizeX,
                      sizeY: altSizeY ?? assignSpec.sizeY,
                    }}
                    officialSpec={{
                      productId: assignSpec.product.id,
                      paperColorGroupId: assignSpec.paperColorGroup?.id,
                      paperColorId: assignSpec.paperColor?.id,
                      paperPatternId: assignSpec.paperPattern?.id,
                      paperCertId: assignSpec.paperCert?.id,
                    }}
                    discountSpec={{
                      companyRegistrationNumber:
                        positiveCompany?.companyRegistrationNumber,
                      productId: assignSpec.product.id,
                      discountRateType: isSales ? "SALES" : "PURCHASE",
                      paperColorGroupId: assignSpec.paperColorGroup?.id,
                      paperColorId: assignSpec.paperColor?.id,
                      paperPatternId: assignSpec.paperPattern?.id,
                      paperCertId: assignSpec.paperCert?.id,
                    }}
                  />
                )}
              </Form.Item>
              <Form.Item name={"processPrice"} label="공정비">
                <FormControl.Number unit="원" />
              </Form.Item>
            </>
          )}
        <Form.Item name={"suppliedPrice"} label="공급가">
          <FormControl.Number
            unit="원"
            min={
              props.order.orderType === "REFUND" ||
              props.order.orderType === "RETURN"
                ? -9999999999
                : 0
            }
            max={
              props.order.orderType === "REFUND" ||
              props.order.orderType === "RETURN"
                ? 0
                : 9999999999
            }
          />
        </Form.Item>
        {props.order.orderType !== "ETC" &&
          props.order.orderType !== "OUTSOURCE_PROCESS" && (
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
          )}
        <Form.Item name={"vatPrice"} label="부가세">
          <FormControl.Number
            unit="원"
            min={
              props.order.orderType === "REFUND" ||
              props.order.orderType === "RETURN"
                ? -9999999999
                : 0
            }
            max={
              props.order.orderType === "REFUND" ||
              props.order.orderType === "RETURN"
                ? 0
                : 9999999999
            }
          />
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
        {props.order.orderType === "NORMAL" && !isSales && !altBundle && (
          <>
            <Form.Item
              label="재고 금액 덮어쓰기"
              name={["isSyncPrice"]}
              valuePropName="checked"
              initialValue={true}
            >
              <Checkbox>재고 금액 덮어쓰기</Checkbox>
            </Form.Item>
            {isSyncPrice && (
              <Alert
                message={`정상매입 원지 정보와 동일한 스펙의 예정 재고의 재고 금액에 매입 금액을 덮어씌웁니다.`}
                type="info"
              />
            )}
          </>
        )}
        <div className="flex-initial flex justify-end mt-4 gap-x-2">
          <Button.Default
            type="secondary"
            label="금액 정보 저장"
            onClick={cmdUpdate}
          />
        </div>
        <div className="h-8" />
      </Form>
    </div>
  );
}

interface BasePricePanelProps {
  order: Model.Order;
  orderId: number | null;
}
function BasePricePanel(props: BasePricePanelProps) {
  const [form] = useForm();

  const me = ApiHook.Auth.useGetMe();

  const suppliedPrice = useWatch<number | null>(["suppliedPrice"], form);
  const vatPrice = useWatch<number | null>(["vatPrice"], form);

  const tradePrice = ApiHook.Trade.Common.useGetTradePrice({
    orderId: props.order.id,
  });

  const apiUpdate = ApiHook.Trade.Common.useUpdateTradePrice();
  const cmdUpdate = useCallback(async () => {
    if (!props.order || !me.data) return;
    await form.validateFields();
    const values = await form.getFieldsValue();

    await apiUpdate.mutateAsync({
      orderId: props.order.id,
      data: {
        suppliedPrice: values.suppliedPrice ?? 0,
        vatPrice: values.vatPrice ?? 0,
      },
    });
  }, [props.order, me.data, form, apiUpdate]);

  const defaultVatPrice = (suppliedPrice ?? 0) * 0.1;

  useEffect(() => {
    if (tradePrice.data) {
      form.setFieldsValue({
        suppliedPrice: tradePrice.data.suppliedPrice,
        vatPrice: tradePrice.data.vatPrice,
      });
    } else {
      form.setFieldsValue({
        suppliedPrice: 0,
        vatPrice: 0,
      });
    }
  }, [props.orderId, tradePrice.data, form]);

  return (
    <div className="flex-[0_0_460px] overflow-y-scroll p-4 flex">
      <Form
        form={form}
        layout="vertical"
        rootClassName="flex-initial basis-[500px]"
      >
        <FormControl.Util.Split label="금액 정보" />
        <Form.Item name={"suppliedPrice"} label="공급가">
          <FormControl.Number
            unit="원"
            min={
              props.order.orderType === "REFUND" ||
              props.order.orderType === "RETURN"
                ? -9999999999
                : 0
            }
            max={
              props.order.orderType === "REFUND" ||
              props.order.orderType === "RETURN"
                ? 0
                : 9999999999
            }
          />
        </Form.Item>
        <Form.Item name={"vatPrice"} label="부가세">
          <FormControl.Number
            unit="원"
            min={
              props.order.orderType === "REFUND" ||
              props.order.orderType === "RETURN"
                ? -9999999999
                : 0
            }
            max={
              props.order.orderType === "REFUND" ||
              props.order.orderType === "RETURN"
                ? 0
                : 9999999999
            }
          />
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
          <Button.Default
            type="secondary"
            label="금액 정보 저장"
            onClick={cmdUpdate}
          />
        </div>
        <div className="h-8" />
      </Form>
    </div>
  );
}

function PopupHistory(props: {
  open: boolean;
  onClose: (unit: false) => void;
  order: Model.Order;
}) {
  const partners = ApiHook.Inhouse.Partner.useGetList({ query: {} });

  return (
    <Popup.Template.Property
      open={props.open}
      onClose={() => props.onClose(false)}
      title="수정 이력"
    >
      <div className="flex flex-col w-full">
        {props.order.histories.map((p) => (
          <>
            <div className="flex-initial flex" key={p.id}>
              <div className="flex-initial basis-48 flex p-2 justify-center items-center font-bold text-lg">
                {Util.orderHistoryTypeToString(p.type)}
              </div>
              <div className="flex-initial basis-px bg-gray-200" />
              <div className="flex-1 flex flex-col p-2 bg-slate-50">
                <div className="flex-initial">
                  {partners.data?.items.find(
                    (q) =>
                      q.companyRegistrationNumber ===
                      p.user.company.companyRegistrationNumber
                  )?.partnerNickName ?? p.user.company.businessName}{" "}
                  {p.user.name}
                </div>
                <div className="flex-initial text-gray-500">
                  {Util.formatIso8601ToLocalDateTime(p.createdAt)}
                </div>
              </div>
            </div>
            <div
              className="flex-initial basis-px bg-gray-200"
              key={`${p.id}-split`}
            />
          </>
        ))}
      </div>
    </Popup.Template.Property>
  );
}
