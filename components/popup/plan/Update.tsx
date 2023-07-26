import { Model } from "@/@shared";
import { ApiHook, PaperUtil, Util } from "@/common";
import { Button, Popup, Table, Toolbar } from "@/components";
import { Input, Steps } from "antd";
import classNames from "classnames";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { RegisterInputStock, UpdateInputStock } from ".";
import { OpenType as RegisterOpenType } from "./RegisterInputStock";
import { OpenType as UpdateOpenType } from "./UpdateInputStock";
import { TaskMap } from "./common";

export interface Props {
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const me = ApiHook.Auth.useGetMe();
  const [serial, setSerial] = useState<string>("");
  const [openRegister, setOpenRegister] = useState<RegisterOpenType | false>(
    false
  );
  const [openUpdate, setOpenUpdate] = useState<UpdateOpenType | false>(false);

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
    if (!data.data) return;

    await apiStart.mutateAsync({
      id: data.data.id,
    });
  }, [data.data, apiStart]);

  const apiComplete = ApiHook.Working.Plan.useComplete();
  const cmdComplete = useCallback(async () => {
    if (!data.data) return;

    await apiComplete.mutateAsync({
      id: data.data.id,
    });
  }, [data.data, apiComplete]);

  const apiDeleteInputStock = ApiHook.Working.Plan.useDeleteInputStock();
  const cmdDeleteInputStock = useCallback(
    async (stockId: number) => {
      if (!data.data || !props.open) return;
      if (!(await Util.confirm("실투입을 해제하시겠습니까?"))) return;

      await apiDeleteInputStock.mutateAsync({
        id: props.open,
        data: {
          stockId: stockId,
        },
      });
    },
    [data.data, props.open, apiDeleteInputStock]
  );

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

  const assignTons = useMemo(() => {
    return data.data?.assignStockEvent
      ? Util.gramsToTon(
          PaperUtil.convertQuantity(
            data.data.assignStockEvent.stock,
            data.data?.assignStockEvent.change
          ).grams
        )
      : 0;
  }, [data.data]);

  const totalTons = useMemo(() => {
    return Util.gramsToTon(
      inputStocks.data?.items.reduce(
        (p, c) =>
          p - (PaperUtil.convertQuantity(c.stock, c.change)?.grams ?? 0),
        0
      ) ?? 0
    );
  }, [inputStocks.data]);

  const deltaTons = useMemo(() => {
    return totalTons + assignTons;
  }, [assignTons, totalTons]);

  const inputShow =
    data.data &&
    (!data.data.orderProcess ||
      data.data.type === "TRADE_OUTSOURCE_PROCESS_BUYER");

  const inputWritable =
    (data.data && data.data.status === "PROGRESSING") ||
    data.data?.status === "PROGRESSED";

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
              <OrderItemProperty label="작업 번호" content={data.data.planNo} />
            </div>
            <div className="basis-px bg-gray-300" />
            {data.data.assignStockEvent && (
              <>
                <div className="flex-initial p-4 flex gap-x-8">
                  <OrderItemProperty
                    label="(입고 예정) 도착지"
                    content={""}
                    type="highlight"
                  />
                  <OrderItemProperty
                    label="(입고 예정) 도착 예정일"
                    content={""}
                    type="highlight"
                  />
                  <OrderItemProperty
                    label="창고"
                    content={data.data.assignStockEvent.stock.warehouse?.name}
                  />
                  <OrderItemProperty
                    label="포장"
                    content={`${
                      data.data.assignStockEvent.stock.packaging.type
                    } ─ ${
                      data.data.assignStockEvent.stock.packaging.type === "SKID"
                        ? ""
                        : Util.formatPackaging(
                            data.data.assignStockEvent.stock.packaging
                          )
                    }`}
                  />
                  <OrderItemProperty
                    label="지종"
                    content={
                      data.data.assignStockEvent.stock.product.paperType.name
                    }
                  />
                  <OrderItemProperty
                    label="제지사"
                    content={
                      data.data.assignStockEvent.stock.product.manufacturer.name
                    }
                  />
                  <OrderItemProperty
                    label="평량"
                    content={`${data.data.assignStockEvent.stock.grammage} ${Util.UNIT_GPM}`}
                  />
                  <OrderItemProperty
                    label="지폭"
                    content={`${data.data.assignStockEvent.stock.sizeX} mm`}
                  />
                  {data.data.assignStockEvent.stock.packaging.type !==
                    "ROLL" && (
                    <OrderItemProperty
                      label="지장"
                      content={`${data.data.assignStockEvent.stock.sizeY} mm`}
                    />
                  )}
                  <OrderItemProperty
                    label="색상"
                    content={data.data.assignStockEvent.stock.paperColor?.name}
                  />
                  <OrderItemProperty
                    label="무늬"
                    content={
                      data.data.assignStockEvent.stock.paperPattern?.name
                    }
                  />
                  <OrderItemProperty
                    label="인증"
                    content={data.data.assignStockEvent.stock.paperCert?.name}
                  />
                  <OrderItemProperty
                    label="사용 예정 수량"
                    content={`${Util.comma(-assignTons, 3)} T`}
                  />
                </div>
              </>
            )}
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
            {inputShow && (
              <>
                <div className="flex-[0_0_1px] bg-gray-300" />
                <div className="flex-initial basis-64 flex h-0">
                  <div className="flex-1 flex flex-col w-0">
                    <Table.Default<Model.StockEvent>
                      data={inputStocks.data}
                      keySelector={(record) => `${record.id}`}
                      selection="none"
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
                        ...Table.Preset.columnStockGroupCompact<Model.StockEvent>(
                          (record) => record.stock
                        ),
                        {
                          title: "전량 사용",
                          render: (record: Model.StockEvent) => (
                            <div className="text-blue-600">
                              {record.useRemainder ? "전량 사용" : ""}
                            </div>
                          ),
                        },
                        ...Table.Preset.columnQuantity<Model.StockEvent>(
                          (record) => record.stock,
                          (record) => record.change,
                          { prefix: "실투입", negative: true }
                        ),
                        {
                          render: (record: Model.StockEvent) =>
                            inputWritable && (
                              <div className="flex gap-x-1 h-8">
                                <button
                                  className="flex-initial bg-blue-500 text-white rounded-sm px-2"
                                  onClick={() =>
                                    setOpenUpdate(
                                      data.data
                                        ? {
                                            planId: data.data.id,
                                            stockId: record.stock.id,
                                          }
                                        : false
                                    )
                                  }
                                >
                                  수량 수정
                                </button>
                                <button
                                  className="flex-initial bg-red-500 text-white rounded-sm px-2"
                                  onClick={() =>
                                    cmdDeleteInputStock(record.stock.id)
                                  }
                                >
                                  실투입 해제
                                </button>
                              </div>
                            ),
                          width: "0px",
                          fixed: "right",
                        },
                      ]}
                      className="flex-1"
                    />
                    <div className="basis-px bg-gray-300" />
                    <div className="flex-initial p-2 flex justify-end items-center font-fixed gap-x-4">
                      <div className="flex-initial">
                        {`실투입 중량 합계: ${Util.comma(
                          totalTons,
                          3
                        )} T (${Util.comma(Math.abs(deltaTons), 3)} T ${
                          deltaTons > 0 ? "초과" : "미달"
                        })`}
                      </div>
                    </div>
                  </div>
                  {inputWritable && (
                    <>
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
                              fontFamily: "D2Coding",
                              fontWeight: "bold",
                              color: "darkgray",
                              fontSize: "16px",
                              padding: "0",
                              margin: "0",
                            },
                            input: {
                              fontFamily: "D2Coding",
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
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <RegisterInputStock
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        targetStock={data.data?.assignStockEvent?.stock}
      />
      <UpdateInputStock
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
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
