import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Popup, Table, Toolbar } from "@/components";
import { Form, Input, Steps } from "antd";
import { useForm } from "antd/lib/form/Form";
import classNames from "classnames";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { RegisterInputStock } from ".";
import { OpenType } from "./RegisterInputStock";
import { TaskMap } from "./common";

export interface Props {
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const me = ApiHook.Auth.useGetMe();
  const [serial, setSerial] = useState<string>("");
  const [openRegister, setOpenRegister] = useState<OpenType | false>(false);

  const data = ApiHook.Working.Plan.useGetItem({
    id: props.open ? props.open : null,
  });

  const tasks = ApiHook.Working.Plan.useGetTaskList({
    planId: props.open ? props.open : null,
  });

  const inputStocks = ApiHook.Working.Plan.useGetInputList({
    planId: props.open ? props.open : null,
    query: {},
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

  const isAllCompleted = useCallback(() => {
    if (!tasks.data) {
      return false;
    }

    return tasks.data.every((task) => task.status === "PROGRESSED");
  }, [tasks.data]);

  const showRegister = useCallback(
    async (serial: string) => {
      if (!data.data || !me.data) return;
      if (
        inputStocks.data?.items.some(
          (x) => x.stock.serial === `P${me.data.company.invoiceCode}${serial}`
        )
      ) {
        Util.warn("이미 실투입으로 등록된 재고입니다.");
        return;
      }

      try {
        const _ = await ApiHook.Stock.StockInhouse.fetchItemBySerial(serial);
        setOpenRegister({
          planId: data.data.id,
          serial: serial,
        });
        setSerial("");
      } catch {
        Util.warn("존재하지 않는 재고입니다.");
      }
    },
    [data.data, inputStocks.data, me.data]
  );

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
                <div className="flex-initial basis-64 flex h-0">
                  <div className="flex-1 flex flex-col w-0">
                    <Table.Default<Model.StockEvent>
                      data={inputStocks.data}
                      keySelector={(record) => `${record.id}`}
                      selection="single"
                      columns={[
                        {
                          title: "재고 번호",
                          dataIndex: ["stock", "serial"],
                          render: (value) => (
                            <div className="flex">
                              <div className="flex font-fixed bg-yellow-100 px-1 text-yellow-800 rounded-md border border-solid border-yellow-300">
                                {Util.formatSerial(value)}
                              </div>
                            </div>
                          ),
                        },
                        ...Table.Preset.columnQuantity<Model.StockEvent>(
                          (record) => record.stock,
                          (record) => record.change,
                          { prefix: "사용", negative: true }
                        ),
                        ...Table.Preset.columnQuantity<Model.StockEvent>(
                          (record) => record.stock,
                          (record) => record.stock.cachedQuantity,
                          { prefix: "총" }
                        ),
                      ]}
                    />
                  </div>
                  <div className="basis-px bg-gray-300" />
                  <div className="flex-[0_0_400px] flex flex-col gap-y-2 p-2 bg-yellow-50">
                    <Input
                      prefix={`P-${data.data.company.invoiceCode}-`}
                      addonBefore={`재고 번호`}
                      placeholder="00000-00000"
                      value={Util.formatSerialNo(serial)}
                      onChange={(e) =>
                        setSerial(e.target.value.replace(/-/g, ""))
                      }
                      maxLength={11}
                      styles={{
                        prefix: {
                          fontFamily: "D2CodingFont",
                          fontWeight: "bold",
                          color: "darkgray",
                          fontSize: "16px",
                          padding: "0",
                          margin: "0",
                        },
                        input: {
                          fontFamily: "D2CodingFont",
                          fontWeight: "bold",
                          color: "blue",
                          fontSize: "16px",
                        },
                      }}
                    />
                    <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-2">
                      {Array.from<number | "bs" | "c">([
                        7,
                        8,
                        9,
                        "bs",
                        4,
                        5,
                        6,
                        "c",
                        1,
                        2,
                        3,
                      ]).map((item) => (
                        <NumberPad
                          key={item}
                          value={item}
                          onClick={setSerial}
                        />
                      ))}
                      <Button.Default
                        type="primary"
                        label="재고 검색"
                        onClick={() => showRegister(serial)}
                        disabled={serial.length !== 10}
                      />
                      <NumberPad value={0} onClick={setSerial} />
                    </div>
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

function NumberPad(props: {
  value: number | "bs" | "c";
  onClick: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div
      className={classNames(
        "flex flex-col pb-1 justify-center bg-white rounded border border-gray-300 border-solid text-lg font-bold text-center select-none cursor-pointer active:bg-cyan-800 active:text-white",
        {
          "bg-green-100": props.value === "c" || props.value === "bs",
        }
      )}
      onClick={() =>
        props.onClick((prev) =>
          props.value === "c"
            ? ""
            : props.value === "bs"
            ? prev.substring(0, prev.length - 1)
            : prev.substring(0, 9) + props.value
        )
      }
    >
      {props.value === "bs" ? "←" : props.value === "c" ? "C" : props.value}
    </div>
  );
}
