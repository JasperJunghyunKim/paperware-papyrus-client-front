import { ApiHook } from "@/common";
import { Button, FormControl, Popup, Table, Toolbar } from "@/components";
import classNames from "classnames";
import { TaskMap } from "./common";
import { useCallback, useEffect, useState } from "react";
import { Form, Input, Steps } from "antd";
import { useForm } from "antd/lib/form/Form";
import { RegisterInputStock } from ".";
import { RegisterInputStockRequest } from "@/@shared/api";
import { OpenType } from "./RegisterInputStock";
import { Model } from "@/@shared";
import { usePage } from "@/common/hook";

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

  const tasks = ApiHook.Working.Plan.useGetTaskList({
    planId: props.open ? props.open : null,
  });

  const [inputStocksPage, setInputStocksPage] = usePage();
  const inputStocks = ApiHook.Working.Plan.useGetInputList({
    planId: props.open ? props.open : null,
    query: inputStocksPage,
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

  const apiComplete = ApiHook.Working.Plan.useComplete();
  const cmdComplete = useCallback(async () => {
    if (!data.data) {
      return;
    }

    await apiComplete.mutateAsync({
      id: data.data.id,
    });
  }, [props.open, data.data]);

  useEffect(() => {
    if (stockId && props.open && !openRegister) {
      setOpenRegister({
        planId: props.open,
        stockId: stockId,
      });
      setStockId(null);
    }
  }, [props.open, stockId, openRegister]);

  const isAllCompleted = useCallback(() => {
    if (!tasks.data) {
      return false;
    }

    return tasks.data.every((task) => task.status === "PROGRESSED");
  }, [tasks.data]);

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
                    disabled={!isAllCompleted()}
                    tooltip={
                      !isAllCompleted()
                        ? "작업을 완료처리 하려면 모든 공정이 완료되어야 합니다."
                        : undefined
                    }
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
            {data.data.status === "PROGRESSING" && (
              <>
                <div className="flex-[0_0_1px] bg-gray-300" />
                <div className="flex-initial basis-48 flex h-0">
                  <div className="flex-1 flex flex-col p-4 overflow-y-scroll">
                    <Table.Default<Model.StockEvent>
                      data={inputStocks.data}
                      page={inputStocksPage}
                      setPage={setInputStocksPage}
                      keySelector={(record) => `${record.id}`}
                      selection="none"
                      columns={[
                        {
                          title: "재고 번호",
                          dataIndex: ["stock", "serial"],
                          render: (value, record) => (
                            <div className="flex">
                              <div className="flex font-fixed bg-yellow-100 px-1 text-yellow-800 rounded-md">
                                {value}
                              </div>
                            </div>
                          ),
                        },
                        ...Table.Preset.columnQuantity<Model.StockEvent>(
                          (record) => record.stock,
                          ["change"],
                          { prefix: "사용", negative: true }
                        ),
                        ...Table.Preset.columnQuantity<Model.StockEvent>(
                          (record) => record.stock,
                          ["stock", "cachedQuantity"],
                          { prefix: "총" }
                        ),
                      ]}
                    />
                  </div>
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
