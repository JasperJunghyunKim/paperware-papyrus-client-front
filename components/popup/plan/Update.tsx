import { ApiHook } from "@/common";
import { Button, FormControl, Popup, Toolbar } from "@/components";
import classNames from "classnames";
import { TaskMap } from "./common";
import { useCallback, useEffect, useState } from "react";
import { Form, Input, Steps } from "antd";
import { useForm } from "antd/lib/form/Form";
import { RegisterInputStock } from ".";
import { RegisterInputStockRequest } from "@/@shared/api";
import { OpenType } from "./RegisterInputStock";

export interface Props {
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm();
  const [stockId, setStockId] = useState<number | null>(null);
  const [openRegister, setOpenRegister] = useState<OpenType | false>(false);

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
  }, [props.open]);

  const apiComplete = ApiHook.Working.Plan.useComplete();
  const cmdComplete = useCallback(async () => {
    if (!data.data) {
      return;
    }

    await apiComplete.mutateAsync({
      id: data.data.id,
    });
  }, [props.open]);

  useEffect(() => {
    if (stockId && props.open && !openRegister) {
      setOpenRegister({
        planId: props.open,
        stockId: stockId,
      });
      setStockId(null);
    }
  }, [props.open, stockId, openRegister]);

  return (
    <Popup.Template.Full
      title="작업 계획 상세"
      {...props}
      open={!!props.open}
      width="calc(100vw - 80px)"
      height="calc(100vh - 80px)"
    >
      <div className="flex-[1_0_0px] flex flex-col">
        {data.data && (
          <>
            <div className="flex-initial flex flex-row gap-8 justify-between px-4 py-2">
              <div className="flex-1 flex flex-col justify-center select-none">
                <Steps
                  items={[
                    {
                      title: "작업 계획 작성",
                    },
                    {
                      title: "작업 진행중",
                    },
                    {
                      title: "작업 완료",
                    },
                  ]}
                  current={
                    data.data.status === "PREPARING"
                      ? 0
                      : data.data.status === "PROGRESSING"
                      ? 1
                      : 2
                  }
                />
              </div>
              <Toolbar.Container>
                {data.data.status === "PREPARING" && (
                  <Toolbar.ButtonPreset.Continue
                    label="작업 지시"
                    onClick={async () => await cmdStart()}
                  />
                )}
                {data.data.status === "PROGRESSING" && (
                  <Toolbar.ButtonPreset.Continue
                    label="작업 완료"
                    onClick={async () => await cmdComplete()}
                  />
                )}
              </Toolbar.Container>
            </div>
            <div className="basis-px bg-gray-300" />
            <div className="flex-initial p-4 flex gap-x-8">
              <OrderItemProperty
                label="작업 계획 번호"
                content={data.data.planNo}
              />
              <OrderItemProperty
                label="원지 창고"
                content={
                  data.data.targetStockGroupEvent.stockGroup.warehouse?.name
                }
              />
              <OrderItemProperty
                label="제품 유형"
                content={
                  data.data.targetStockGroupEvent.stockGroup.product.paperDomain
                    .name
                }
              />
              <OrderItemProperty
                label="제지사"
                content={
                  data.data.targetStockGroupEvent.stockGroup.product
                    .manufacturer.name
                }
              />
              <OrderItemProperty
                label="지군"
                content={
                  data.data.targetStockGroupEvent.stockGroup.product.paperGroup
                    .name
                }
              />
              <OrderItemProperty
                label="지종"
                content={
                  data.data.targetStockGroupEvent.stockGroup.product.paperType
                    .name
                }
              />
            </div>
            <div className="flex-[0_0_1px] bg-gray-300" />
            <div className="flex-[1_0_0px] flex flex-col bg-slate-200 h-0">
              {data.data && (
                <TaskMap
                  plan={data.data}
                  packagingType={
                    data.data.targetStockGroupEvent.stockGroup.packaging.type
                  }
                />
              )}
            </div>
            {data.data.status === "PROGRESSING" && (
              <>
                <div className="flex-[0_0_1px] bg-gray-300" />
                <div className="flex-initial basis-48 flex">
                  <div className="flex-1 flex p-4">실투입 재고</div>
                  <div className="basis-px bg-gray-300" />
                  <div className="basis-[400px] flex p-4 bg-yellow-50">
                    <Form
                      form={form}
                      layout="vertical"
                      rootClassName="w-full"
                      onFinish={(value) => setStockId(Number(value.stockNo))}
                    >
                      <Form.Item label="재고 번호" name="stockNo">
                        <Input />
                      </Form.Item>
                      <div className="flex-initial flex justify-end">
                        <Button.Preset.Submit label="재고 검색" />
                      </div>
                    </Form>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <RegisterInputStock
        open={openRegister}
        onClose={() => setOpenRegister(false)}
      />
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
