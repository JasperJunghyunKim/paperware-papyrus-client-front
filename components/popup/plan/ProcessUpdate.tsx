import { Model } from "@/@shared";
import { ApiHook, PaperUtil, QuantityUtil, Util } from "@/common";
import { Button, FormControl, Icon, Popup, Toolbar } from "@/components";
import { Form } from "antd";
import { useForm } from "antd/lib/form/Form";
import classNames from "classnames";
import { useCallback, useEffect, useMemo } from "react";
import Collapsible from "react-collapsible";
import { TaskMap } from "./common";
import { TbCircleCheck } from "react-icons/tb";

export interface Props {
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const data = ApiHook.Working.Plan.useGetItem({
    id: props.open ? props.open : null,
  });

  const apiStart = ApiHook.Working.Plan.useStart();
  const cmdStart = useCallback(async () => {
    if (!data.data) {
      return;
    }

    await apiStart.mutateAsync({
      id: data.data.id,
    });
  }, [props.open, data.data]);

  const arrivals = ApiHook.Stock.StockInhouse.useGetGroupList({
    query: {
      planId: props.open ? props.open : undefined,
    },
  });

  return (
    <Popup.Template.Full
      title="내부 공정 상세"
      {...props}
      open={!!props.open}
      width="calc(100vw - 80px)"
      height="calc(100vh - 80px)"
    >
      <div className="flex-[1_0_0px] flex flex-col">
        {data.data && (
          <>
            <Toolbar.Container rootClassName="p-2">
              <div className="flex-1" />
              <Toolbar.ButtonPreset.Continue
                label="작업 지시"
                onClick={async () => await cmdStart()}
                disabled={data.data.status !== "PREPARING"}
              />
            </Toolbar.Container>
            <div className="basis-px bg-gray-300" />
            <div className="flex-initial p-4 flex gap-x-8">
              <OrderItemProperty
                label="작업 계획 번호"
                content={data.data.planNo}
              />
              <OrderItemProperty
                label="원지 창고"
                content={data.data.assignStockEvent?.stock.warehouse?.name}
              />
              <OrderItemProperty
                label="제품 유형"
                content={
                  data.data.assignStockEvent?.stock.product.paperDomain.name
                }
              />
              <OrderItemProperty
                label="제지사"
                content={
                  data.data.assignStockEvent?.stock.product.manufacturer.name
                }
              />
              <OrderItemProperty
                label="지군"
                content={
                  data.data.assignStockEvent?.stock.product.paperGroup.name
                }
              />
              <OrderItemProperty
                label="지종"
                content={
                  data.data.assignStockEvent?.stock.product.paperType.name
                }
              />
            </div>
            <div className="flex-[0_0_1px] bg-gray-300" />
            <div className="flex-[1_0_0px] flex flex-col bg-slate-200 h-0">
              {data.data && data.data.assignStockEvent && (
                <TaskMap
                  plan={data.data}
                  packagingType={
                    data.data.assignStockEvent?.stock.packaging.type
                  }
                />
              )}
            </div>
          </>
        )}
      </div>
      {data.data?.status === "PROGRESSING" && (
        <>
          <div className="basis-px bg-gray-300" />
          <div className="flex-[0_0_460px] flex flex-col overflow-y-scroll">
            {arrivals.data?.items.map(
              (item, index) =>
                props.open && (
                  <Collapse
                    key={index}
                    data={{ planId: props.open, stock: item }}
                  />
                )
            )}
          </div>
        </>
      )}
    </Popup.Template.Full>
  );
}

interface OrderItemPropertyProps {
  label: string;
  content?: string;
  rightAlign?: boolean;
  type?: "default" | "highlight" | "warning";
}
function OrderItemProperty(props: OrderItemPropertyProps) {
  const type = props.type ?? "default";

  return (
    <div className="flex-initial flex flex-col gap-y-1">
      <div
        className={classNames("flex-initial flex  text-xs font-bold", {
          "text-gray-500": type === "default",
          "text-cyan-800": type === "highlight",
          "text-amber-700": type === "warning",
        })}
      >
        {props.label}
      </div>
      <div
        className={classNames("flex-initial flex font-fixed whitespace-pre", {
          "justify-end": props.rightAlign,
        })}
      >
        {props.content}
      </div>
    </div>
  );
}

interface CollapseProps {
  data: {
    planId: number;
    stock: Model.StockGroup;
  };
}
function Collapse(props: CollapseProps) {
  const [form] = useForm<{ price: Model.StockPrice }>();

  const stock = props.data.stock;
  const planId = props.data.planId;

  const data = ApiHook.Stock.StockInhouse.useGetStockArrival({
    query: {
      planId: planId,
      productId: stock.product.id,
      grammage: stock.grammage,
      sizeX: stock.sizeX,
      sizeY: stock.sizeY,
      packagingId: stock.packaging.id,
      paperColorGroupId: stock.paperColorGroup?.id,
      paperColorId: stock.paperColor?.id,
      paperPatternId: stock.paperPattern?.id,
      paperCertId: stock.paperCert?.id,
    },
  });

  useEffect(() => {
    if (data.data?.stockPrice) {
      form.setFieldsValue({
        price: data.data.stockPrice,
      });
    } else {
      form.resetFields();
    }
  }, [data.data]);

  const quantity = useMemo(() => {
    return PaperUtil.convertQuantity(
      {
        grammage: stock.grammage,
        sizeX: stock.sizeX,
        sizeY: stock.sizeY,
        packaging: stock.packaging,
      },
      QuantityUtil.compact(stock, stock).availableQuantity
    );
  }, [stock]);

  const spec = {
    grammage: stock.grammage,
    sizeX: stock.sizeX,
    sizeY: stock.sizeY,
    packaging: stock.packaging,
  };

  const apiUpdate = ApiHook.Stock.StockInhouse.useUpdateStockArrivalPrice();
  const cmdUpdate = useCallback(async () => {
    const values = await form.validateFields();

    await apiUpdate.mutateAsync({
      data: {
        isSyncPrice: false,
        planId: planId,
        productId: stock.product.id,
        grammage: stock.grammage,
        sizeX: stock.sizeX,
        sizeY: stock.sizeY,
        packagingId: stock.packaging.id,
        paperColorGroupId: stock.paperColorGroup?.id ?? null,
        paperColorId: stock.paperColor?.id ?? null,
        paperPatternId: stock.paperPattern?.id ?? null,
        paperCertId: stock.paperCert?.id ?? null,
        stockPrice: values.price,
      },
    });
  }, [apiUpdate, form, planId, stock]);

  return (
    <div className="flex-initial flex flex-col">
      <Collapsible
        transitionTime={50}
        trigger={
          <div className="px-4 py-2 bg-slate-200 select-none cursor-pointer flex gap-x-2 items-center">
            <div className="flex-initial text-xl flex flex-col justify-center">
              <Icon.PackagingType packagingType={stock.packaging.type} />
            </div>
            <div className="flex-initial font-fixed">
              {stock.packaging.type}
            </div>
            ─
            <div className="flex-initial font-fixed">
              {`${stock.sizeX} × ${stock.sizeY}`}
            </div>
            <div className="flex-1" />
            {quantity.unpacked && (
              <div className="flex-initial font-fixed text-sky-800">
                {`${quantity.unpacked.value} ${quantity.unpacked.unit}`}
              </div>
            )}
            {quantity.packed && (
              <div className="flex-initial font-fixed text-sky-800">
                {`(${Util.comma(
                  quantity.packed.value,
                  PaperUtil.recommendedPrecision(quantity.packed.unit)
                )} ${quantity.packed.unit})`}
              </div>
            )}
            <div className="flex-initial font-fixed text-gray-500">=</div>
            <div className="flex-initial font-fixed">
              {`${Util.comma(Util.gramsToTon(quantity.grams), 3)} T`}
            </div>
          </div>
        }
        contentOuterClassName="bg-slate-50"
      >
        <div className="p-4 flex flex-col">
          <Form form={form} layout="vertical">
            <Form.Item name={"price"} label="예정 재고 금액">
              <FormControl.StockPrice spec={spec} />
            </Form.Item>
            <Form.Item label="공급가">
              <FormControl.Number unit="원" disabled />
            </Form.Item>
          </Form>
          <div className="flex-initial flex justify-end">
            <Button.Default
              label="금액 저장"
              icon={<TbCircleCheck />}
              type="secondary"
              onClick={cmdUpdate}
            />
          </div>
        </div>
      </Collapsible>
      <div className="basis-px bg-slate-300" />
    </div>
  );
}
