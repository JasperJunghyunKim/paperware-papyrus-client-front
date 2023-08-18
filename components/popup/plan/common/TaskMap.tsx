import { Model } from "@/@shared";
import { ApiHook, PaperUtil, Util } from "@/common";
import { Icon, Popup } from "@/components";
import { ConfigProvider, Input, InputNumber } from "antd";
import classNames from "classnames";
import { useCallback, useState } from "react";
import { TbCirclePlus, TbX } from "react-icons/tb";

interface TempDataType {
  value: Model.Task;
  childs: TempDataType[];
}

function convert(data: Model.Task[]): TempDataType[] {
  const temp: TempDataType[] = [];
  const map = new Map<number, TempDataType>();

  data.forEach((item) => {
    map.set(item.id, { value: item, childs: [] });
  });

  data.forEach((item) => {
    const tempItem = map.get(item.id);
    if (!tempItem) {
      return;
    }

    if (item.parentTaskId === null) {
      temp.push(tempItem);
    } else {
      map.get(item.parentTaskId)?.childs.push(tempItem);
    }
  });

  return temp;
}

interface Props {
  plan: Model.Plan;
  packagingType: Model.Enum.PackagingType;
  readonly?: boolean;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const tasks = ApiHook.Working.Plan.useGetTaskList({
    planId: props.plan.id,
  });
  const converted = convert(tasks.data ?? []);
  const modifidable =
    props.plan.status === "PREPARING" &&
    (props.plan.type === "INHOUSE_PROCESS" ||
      props.plan.type === "TRADE_NORMAL_SELLER" ||
      props.plan.type === "TRADE_OUTSOURCE_PROCESS_BUYER" ||
      props.plan.type === "TRADE_OUTSOURCE_PROCESS_SELLER" ||
      props.plan.type === "RETURN_BUYER");
  return (
    <div className="w-auto h-full flex">
      <div className="flex-1 flex flex-col p-4 overflow-scroll">
        <div className="flex-initial flex flex-col gap-y-4">
          {converted.map((item) => (
            <Item
              data={item}
              key={item.value.id}
              plan={props.plan}
              edge={false}
              parent={null}
              readonly={!!props.readonly}
              disabled={!!props.disabled}
            />
          ))}
        </div>
        {modifidable && (
          <>
            {props.packagingType === "ROLL" &&
              props.plan.type !== "TRADE_OUTSOURCE_PROCESS_BUYER" && (
                <AddNode
                  type="CONVERTING"
                  plan={props.plan}
                  parentTaskId={null}
                />
              )}
            {props.packagingType !== "ROLL" &&
              props.plan.type !== "TRADE_OUTSOURCE_PROCESS_BUYER" && (
                <AddNode
                  type="GUILLOTINE"
                  plan={props.plan}
                  parentTaskId={null}
                />
              )}
            <AddNode type="RELEASE" plan={props.plan} parentTaskId={null} />
          </>
        )}
      </div>
    </div>
  );
}

interface ItemProps {
  plan: Model.Plan;
  data: TempDataType;
  parent: TempDataType | null;
  edge: boolean;
  readonly: boolean;
  disabled: boolean;
}

function Item(props: ItemProps) {
  const apiDelete = ApiHook.Working.Task.useDelete();
  const cmdDelete = useCallback(async () => {
    await apiDelete.mutateAsync({
      id: props.data.value.id,
      planId: props.plan.id,
    });
  }, [apiDelete, props.data.value.id]);

  return (
    <div className="flex-initial flex-shrink-0">
      <div className="flex gap-x-4 relative">
        {props.edge ? (
          <>
            <div className="absolute top-1/2 -left-4 w-4 h-px bg-gray-800">
              <div className="-mx-1 -my-1 w-2 h-2 place-self-center bg-white border border-solid border-gray-800 rounded-full" />
            </div>
          </>
        ) : null}
        <div className="flex-initial flex-shrink-0 basis-64 flex flex-col border border-solid border-gray-800 rounded shadow-xl bg-white overflow-hidden">
          <div
            className={classNames(
              "flex-initial flex gap-x-1 p-2 text-white font-bold select-none",
              {
                "bg-purple-800": props.data.value.type === "CONVERTING",
                "bg-green-800": props.data.value.type === "GUILLOTINE",
                "bg-orange-800": props.data.value.type === "RELEASE",
              }
            )}
          >
            <div className="flex-initial flex flex-col justify-center text-2xl">
              <Icon.TaskType taskType={props.data.value.type} />
            </div>
            <div className="flex-1">
              {Util.taskTypeToString(props.data.value.type)}
            </div>
            {props.plan.status === "PREPARING" &&
              props.data.value.status === "PREPARING" && (
                <div
                  className="flex-initial flex flex-col justify-center text-2xl cursor-pointer hover:text-red-600"
                  onClick={() => cmdDelete()}
                >
                  <TbX />
                </div>
              )}
            {props.plan.status === "PROGRESSING" && (
              <div
                className={classNames(
                  "flex-initial flex gap-x-2 text-gray-400",
                  {
                    "text-gray-400": props.data.value.status === "PREPARING",
                    "text-yellow-300":
                      props.data.value.status === "PROGRESSING",
                    "text-white": props.data.value.status === "PROGRESSED",
                  }
                )}
              >
                <div className="flex-initial flex flex-col justify-center">
                  {Util.taskStatusToString(props.data.value.status)}
                </div>
                <div className="flex-initial flex flex-col justify-center text-2xl">
                  <Icon.TaskStatus value={props.data.value.status} />
                </div>
              </div>
            )}
          </div>
          <div className="flex-auto flex flex-col">
            {props.data.value.taskConverting && (
              <ConvertingNode
                plan={props.plan}
                taskId={props.data.value.id}
                data={props.data.value.taskConverting}
                current={props.data}
                parent={props.parent}
                readonly={props.readonly}
                disabled={props.disabled}
              />
            )}
            {props.data.value.taskGuillotine && (
              <GuillotineNode
                plan={props.plan}
                taskId={props.data.value.id}
                data={props.data.value.taskGuillotine}
                current={props.data}
                parent={props.parent}
                readonly={props.readonly}
                disabled={props.disabled}
              />
            )}
            {props.data.value.taskQuantity && (
              <QuantityNode
                plan={props.plan}
                taskId={props.data.value.id}
                data={props.data.value.taskQuantity}
                current={props.data}
                parent={props.parent}
                readonly={props.readonly}
                disabled={props.disabled}
              />
            )}
          </div>
        </div>
        <div className="flex-initial flex-shrink-0 flex flex-col">
          <div className="flex-1 flex flex-col gap-y-4">
            {props.data.childs.map((item) => {
              return (
                <Item
                  data={item}
                  plan={props.plan}
                  key={item.value.id}
                  edge={true}
                  parent={props.data}
                  readonly={props.readonly}
                  disabled={props.disabled}
                />
              );
            })}
          </div>
          {props.plan.status === "PREPARING" && (
            <div className="flex-initial flex flex-col">
              {props.data.value.type === "CONVERTING" && (
                <AddNode
                  type="GUILLOTINE"
                  plan={props.plan}
                  parentTaskId={props.data.value.id}
                />
              )}
              {Util.inc(props.data.value.type, "CONVERTING", "GUILLOTINE") && (
                <AddNode
                  type="RELEASE"
                  plan={props.plan}
                  parentTaskId={props.data.value.id}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AddNodeProps {
  plan: Model.Plan;
  parentTaskId: number | null;
  type: Model.Enum.TaskType;
}

function AddNode(props: AddNodeProps) {
  const apiCreateConverting = ApiHook.Working.Task.useCreateConverting();
  const apiCreateGuillotine = ApiHook.Working.Task.useCreateGuillotine();
  const apiCreateQuantity = ApiHook.Working.Task.useCreateQuantity();

  const cmdCreate = useCallback(async () => {
    switch (props.type) {
      case "CONVERTING": {
        const res = await apiCreateConverting.mutateAsync({
          data: {
            planId: props.plan.id,
            parentTaskId: props.parentTaskId,
            sizeX: props.plan.assignStockEvent?.stock.sizeX ?? 0,
            sizeY: props.plan.assignStockEvent?.stock.sizeY ?? 0,
            memo: "",
          },
        });
        break;
      }
      case "GUILLOTINE": {
        const res = await apiCreateGuillotine.mutateAsync({
          data: {
            planId: props.plan.id,
            parentTaskId: props.parentTaskId,
            sizeX: props.plan.assignStockEvent?.stock.sizeX ?? 0,
            sizeY: props.plan.assignStockEvent?.stock.sizeY ?? 0,
            memo: "",
          },
        });
        break;
      }
      case "RELEASE": {
        const res = await apiCreateQuantity.mutateAsync({
          data: {
            planId: props.plan.id,
            parentTaskId: props.parentTaskId,
            quantity: 0,
            memo: "",
          },
        });
        break;
      }
    }
  }, [props, apiCreateConverting, apiCreateGuillotine, apiCreateQuantity]);

  return (
    <div className="flex-initial mt-4">
      <div className="flex gap-x-4 relative">
        <div className="absolute top-1/2 -left-4 w-4 h-px bg-gray-600" />
        <div
          className={classNames(
            "flex-initial flex pl-1 pr-2 gap-x-0.5 border border-solid border-gray-800 rounded-full overflow-hidden cursor-pointer select-none bg-white",
            {
              "border-purple-600 text-purple-600": props.type === "CONVERTING",
              "border-green-600 text-green-600": props.type === "GUILLOTINE",
              "border-orange-600 text-orange-600": props.type === "RELEASE",
            }
          )}
          onClick={() => cmdCreate()}
        >
          <div className="flex-initial flex flex-col justify-center">
            <TbCirclePlus />
          </div>
          <div className="flex-initial -mt-px">
            {Util.taskTypeToString(props.type)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MiniFormProps<T> {
  label: string;
  value: T;
  onChange?: (value: T) => void;
  unit?: string;
  disabled?: boolean;
  precision?: number;
  min?: number;
  max?: number;
}
function MiniFormNumber(props: MiniFormProps<number>) {
  return (
    <div className="flex-initial flex">
      <div className="basis-16 flex flex-col justify-center">{props.label}</div>
      <div className="flex-1">
        <InputNumber
          value={props.value}
          onChange={(p) => props.onChange?.(p ?? 0)}
          min={props.min ?? 0}
          max={props.max ?? 9999}
          precision={props.precision ?? 0}
          rootClassName="w-full"
          addonAfter={props.unit}
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}
function MiniFormString(props: MiniFormProps<string>) {
  return (
    <div className="flex-1 flex flex-col">
      <Input.TextArea
        placeholder={`${props.label}를 입력해주세요.`}
        value={props.value}
        onChange={(p) => props.onChange?.(p.target.value ?? "")}
        disabled={props.disabled}
        classNames={{
          textarea: "flex-auto w-full h-auto rounded-none resize-none",
        }}
        autoSize={{
          minRows: 2,
          maxRows: 12,
        }}
      />
    </div>
  );
}

interface MiniButtonProps {
  label: string;
  onClick?: () => Promise<void>;
}
function MiniButton(props: MiniButtonProps) {
  const [pending, setPending] = useState(false);
  const cmdClick = useCallback(async () => {
    try {
      setPending(true);
      await props.onClick?.();
    } catch (err) {
      console.warn(err);
    } finally {
      setPending(false);
    }
  }, [props.onClick]);

  return (
    <div className="flex-initial flex justify-end">
      <button
        className={classNames(
          "px-4 py-1 flex flex-row justify-center border border-solid select-none rounded-full",
          {
            "bg-gray-600 hover:bg-gray-600 text-gray-400 cursor-not-allowed":
              pending,
            "bg-cyan-800 hover:bg-cyan-700 text-white border-cyan-900 hover:border-cyan-800":
              !pending,
          }
        )}
        disabled={pending}
        onClick={() => cmdClick()}
      >
        {props.label}
      </button>
    </div>
  );
}

interface TaskCommandButtonProps {
  label: string;
  onClick?: () => Promise<void>;
  type?: "default" | "danger";
}
function TaskCommandButton(props: TaskCommandButtonProps) {
  const [pending, setPending] = useState(false);
  const cmdClick = useCallback(async () => {
    try {
      setPending(true);
      await props.onClick?.();
    } catch (err) {
      console.warn(err);
    } finally {
      setPending(false);
    }
  }, [props.onClick]);

  const type = props.type ?? "default";

  return (
    <button
      className={classNames(
        "flex-1 px-2 pb-[6px] pt-[5px] flex flex-row justify-center border border-solid select-none rounded-full font-bold text-lg",
        {
          "bg-gray-600 hover:bg-gray-600 text-gray-400 cursor-not-allowed":
            pending,
          "bg-cyan-800 hover:bg-cyan-700 text-white border-cyan-900 hover:border-cyan-800":
            !pending && type === "default",
          "bg-amber-800 hover:bg-amber-700 text-white border-amber-900 hover:border-amber-800":
            !pending && type === "danger",
        }
      )}
      disabled={pending}
      onClick={() => cmdClick()}
    >
      {props.label}
    </button>
  );
}

interface ConvertingProps {
  plan: Model.Plan;
  taskId: number;
  data: Model.TaskConverting;
  current: TempDataType;
  parent: TempDataType | null;
  readonly: boolean;
  disabled: boolean;
}
function ConvertingNode(props: ConvertingProps) {
  const [initialW, setInitialW] = useState(props.data.sizeX);
  const [initialH, setInitialH] = useState(props.data.sizeY);
  const [initialM, setInitialM] = useState(props.data.memo);
  const [w, setW] = useState(props.data.sizeX);
  const [h, setH] = useState(props.data.sizeY);
  const [m, setM] = useState(props.data.memo);

  const apiUpdate = ApiHook.Working.Task.useUpdateConverting();
  const cmdUpdate = useCallback(async () => {
    await apiUpdate.mutateAsync({
      taskId: props.taskId,
      data: {
        sizeX: w,
        sizeY: h,
        memo: m,
      },
    });
    setInitialW(w);
    setInitialH(h);
    setInitialM(m);
  }, [props.taskId, w, h, m, apiUpdate]);

  const apiStart = ApiHook.Working.Task.useStart();
  const cmdStart = useCallback(async () => {
    if (!props.taskId) return;

    await apiStart.mutateAsync({
      id: props.taskId,
      planId: props.plan.id,
    });
  }, [props.plan.id, props.taskId, apiStart]);

  const apiReset = ApiHook.Working.Task.useReset();
  const cmdReset = useCallback(async () => {
    if (!props.taskId) return;

    await apiReset.mutateAsync({
      id: props.taskId,
      planId: props.plan.id,
    });
  }, [props.plan.id, props.taskId, apiReset]);

  const apiFinish = ApiHook.Working.Task.useFinish();
  const cmdFinish = useCallback(async () => {
    if (!props.taskId) return;

    await apiFinish.mutateAsync({
      id: props.taskId,
      planId: props.plan.id,
    });
  }, [props.plan.id, props.taskId, apiFinish]);

  const isChanged = useCallback(() => {
    return initialW !== w || initialH !== h || initialM !== m;
  }, [initialW, initialH, initialM, w, h, m]);

  return (
    <div className="flex-1 flex flex-col gap-y-2">
      <div className="flex-1 flex flex-col gap-y-2 p-4">
        <ConfigProvider
          theme={{ token: { borderRadius: 999, colorTextDisabled: "black" } }}
        >
          <MiniFormNumber
            label="공정 지폭"
            value={w}
            onChange={(p) => setW(p ?? 0)}
            unit="mm"
            disabled={
              props.plan.status !== "PREPARING" ||
              props.disabled ||
              props.current.value.status !== "PREPARING"
            }
          />
          <MiniFormNumber
            label="공정 지장"
            value={h}
            onChange={(p) => setH(p ?? 0)}
            unit="mm"
            disabled={
              props.plan.status !== "PREPARING" ||
              props.disabled ||
              props.current.value.status !== "PREPARING"
            }
          />
          <MiniFormString
            label="메모"
            value={m}
            onChange={(p) => setM(p)}
            disabled={
              props.plan.status !== "PREPARING" ||
              props.disabled ||
              props.current.value.status !== "PREPARING"
            }
          />
          {props.plan.status === "PREPARING" && isChanged() && (
            <MiniButton label="저장" onClick={async () => await cmdUpdate()} />
          )}
        </ConfigProvider>
      </div>
      {!props.readonly &&
        props.plan.status === "PROGRESSING" &&
        props.current.value.status !== "PROGRESSED" && (
          <>
            {props.current.value.status === "PREPARING" &&
              (!props.parent || props.parent.value.status === "PROGRESSED") && (
                <div className="flex-initial flex gap-x-2 p-2 bg-yellow-100">
                  <TaskCommandButton label="작업 시작" onClick={cmdStart} />
                </div>
              )}
            {props.current.value.status === "PROGRESSING" && (
              <div className="flex-initial flex gap-x-2 p-2 bg-yellow-100">
                <TaskCommandButton label="작업 역행" onClick={cmdReset} />
                <TaskCommandButton label="작업 완료" onClick={cmdFinish} />
              </div>
            )}
          </>
        )}
    </div>
  );
}

interface GuillotineProps {
  plan: Model.Plan;
  taskId: number;
  data: Model.TaskGuillotine;
  current: TempDataType;
  parent: TempDataType | null;
  readonly: boolean;
  disabled: boolean;
}
function GuillotineNode(props: GuillotineProps) {
  const [initialW, setInitialW] = useState(props.data.sizeX);
  const [initialH, setInitialH] = useState(props.data.sizeY);
  const [initialM, setInitialM] = useState(props.data.memo);
  const [w, setW] = useState(props.data.sizeX);
  const [h, setH] = useState(props.data.sizeY);
  const [m, setM] = useState(props.data.memo);

  const apiUpdate = ApiHook.Working.Task.useUpdateGuillotine();
  const cmdUpdate = useCallback(async () => {
    await apiUpdate.mutateAsync({
      taskId: props.taskId,
      data: {
        sizeX: w,
        sizeY: h,
        memo: m,
      },
    });
    setInitialW(w);
    setInitialH(h);
    setInitialM(m);
  }, [props.taskId, w, h, m, apiUpdate]);

  const apiStart = ApiHook.Working.Task.useStart();
  const cmdStart = useCallback(async () => {
    if (!props.taskId) return;

    await apiStart.mutateAsync({
      id: props.taskId,
      planId: props.plan.id,
    });
  }, [props.plan.id, props.taskId, apiStart]);

  const apiReset = ApiHook.Working.Task.useReset();
  const cmdReset = useCallback(async () => {
    if (!props.taskId) return;

    await apiReset.mutateAsync({
      id: props.taskId,
      planId: props.plan.id,
    });
  }, [props.plan.id, props.taskId, apiReset]);

  const apiFinish = ApiHook.Working.Task.useFinish();
  const cmdFinish = useCallback(async () => {
    if (!props.taskId) return;

    await apiFinish.mutateAsync({
      id: props.taskId,
      planId: props.plan.id,
    });
  }, [props.plan.id, props.taskId, apiFinish]);

  const isChanged = useCallback(() => {
    return initialW !== w || initialH !== h || initialM !== m;
  }, [initialW, initialH, initialM, w, h, m]);

  return (
    <div className="flex-1 flex flex-col gap-y-2">
      <div className="flex-1 flex flex-col gap-y-2 p-4">
        <ConfigProvider
          theme={{ token: { borderRadius: 999, colorTextDisabled: "black" } }}
        >
          <MiniFormNumber
            label="공정 지폭"
            value={w}
            onChange={(p) => setW(p ?? 0)}
            unit="mm"
            disabled={
              props.plan.status !== "PREPARING" ||
              props.disabled ||
              props.current.value.status !== "PREPARING"
            }
          />
          <MiniFormNumber
            label="공정 지장"
            value={h}
            onChange={(p) => setH(p ?? 0)}
            unit="mm"
            disabled={
              props.plan.status !== "PREPARING" ||
              props.disabled ||
              props.current.value.status !== "PREPARING"
            }
          />
          <MiniFormString
            label="메모"
            value={m}
            onChange={(p) => setM(p)}
            disabled={
              props.plan.status !== "PREPARING" ||
              props.disabled ||
              props.current.value.status !== "PREPARING"
            }
          />
          {isChanged() && (
            <MiniButton label="저장" onClick={async () => await cmdUpdate()} />
          )}
        </ConfigProvider>
      </div>
      {!props.readonly &&
        props.plan.status === "PROGRESSING" &&
        props.current.value.status !== "PROGRESSED" && (
          <>
            {props.current.value.status === "PREPARING" &&
              (!props.parent || props.parent.value.status === "PROGRESSED") && (
                <div className="flex-initial flex gap-x-2 p-2 bg-yellow-100">
                  <TaskCommandButton label="작업 시작" onClick={cmdStart} />
                </div>
              )}
            {props.current.value.status === "PROGRESSING" && (
              <div className="flex-initial flex gap-x-2 p-2 bg-yellow-100">
                <TaskCommandButton label="작업 역행" onClick={cmdReset} />
                <TaskCommandButton label="작업 완료" onClick={cmdFinish} />
              </div>
            )}
          </>
        )}
    </div>
  );
}

interface QuantityProps {
  plan: Model.Plan;
  taskId: number;
  data: Model.TaskQuantity;
  current: TempDataType;
  parent: TempDataType | null;
  readonly: boolean;
  disabled: boolean;
}
function QuantityNode(props: QuantityProps) {
  const [initialQ, setInitialQ] = useState(props.data.quantity);
  const [initialM, setInitialM] = useState(props.data.memo);
  const [q, setQ] = useState(props.data.quantity);
  const [m, setM] = useState(props.data.memo);
  const [openInvoicePrint, setOpenInvoicePrint] = useState<number | false>(
    false
  );

  const apiUpdate = ApiHook.Working.Task.useUpdateQuantity();
  const cmdUpdate = useCallback(async () => {
    await apiUpdate.mutateAsync({
      taskId: props.taskId,
      data: {
        quantity: q,
        memo: m,
      },
    });
    setInitialQ(q);
    setInitialM(m);
  }, [props.taskId, q, m, apiUpdate]);

  const apiFinish = ApiHook.Working.Task.useFinish();
  const cmdFinish = useCallback(async () => {
    if (!props.taskId) return;

    await apiFinish.mutateAsync({
      id: props.taskId,
      planId: props.plan.id,
    });
  }, [props.plan.id, props.taskId, apiFinish]);

  const isChanged = useCallback(() => {
    return initialQ !== q || initialM !== m;
  }, [initialQ, initialM, q, m]);

  const packaging: PaperUtil.Packaging | null = props.parent
    ? {
        type: "SKID",
        packA: 0,
        packB: 0,
      }
    : props.plan.assignStockEvent?.stock.packaging ?? null;

  const isRootRoll =
    props.current.value.parentTaskId === null &&
    props.plan.assignStockEvent?.stock.packaging.type === "ROLL";

  const isRootBox =
    props.current.value.parentTaskId === null &&
    props.plan.assignStockEvent?.stock.packaging.type === "BOX";

  const getWeight = useCallback(() => {
    let parent = props.parent;
    return props.plan.assignStockEvent && packaging
      ? (PaperUtil.convertQuantityWith(
          {
            packaging: packaging,
            grammage: props.plan.assignStockEvent.stock.grammage,
            sizeX:
              parent?.value.taskConverting?.sizeX ??
              parent?.value.taskGuillotine?.sizeX ??
              props.plan.assignStockEvent.stock.sizeX ??
              1,
            sizeY:
              parent?.value.taskConverting?.sizeY ??
              parent?.value.taskGuillotine?.sizeY ??
              props.plan.assignStockEvent.stock.sizeY ??
              1,
          },
          packaging.type === "BOX" ? "BOX" : "매",
          q
        )?.grams ?? 0) * 0.000001
      : 0;
  }, [props.current, props.parent, props.plan, q]);

  const getMeters = useCallback(() => {
    let parent = props.parent;
    return props.plan.assignStockEvent && packaging
      ? PaperUtil.convertQuantityWith(
          {
            packaging: packaging,
            grammage: props.plan.assignStockEvent.stock.grammage,
            sizeX:
              parent?.value.taskConverting?.sizeX ??
              parent?.value.taskGuillotine?.sizeX ??
              props.plan.assignStockEvent.stock.sizeX ??
              1,
            sizeY:
              parent?.value.taskConverting?.sizeY ??
              parent?.value.taskGuillotine?.sizeY ??
              props.plan.assignStockEvent.stock.sizeY ??
              1,
          },
          "g",
          q
        )?.packed?.value ?? 0
      : 0;
  }, [props.current, props.parent, props.plan, q]);

  return (
    <div className="flex-initial flex flex-col gap-y-2">
      <div className="flex-1 flex flex-col gap-y-2 p-4">
        <ConfigProvider
          theme={{ token: { borderRadius: 999, colorTextDisabled: "black" } }}
        >
          {isRootRoll ? (
            <>
              <MiniFormNumber
                label="중량"
                value={Util.gramsToTon(q ?? 0)}
                unit="T"
                disabled={
                  props.plan.status !== "PREPARING" ||
                  props.disabled ||
                  props.current.value.status !== "PREPARING"
                }
                onChange={(p) => setQ(Util.tonToGrams(p ?? 0))}
                precision={3}
              />
              <MiniFormNumber
                label="권취미터"
                value={getMeters()}
                unit="m"
                disabled
                precision={1}
              />
            </>
          ) : isRootBox ? (
            <>
              <MiniFormNumber
                label="출고 수량"
                value={q}
                onChange={(p) => setQ(p ?? 0)}
                unit="BOX"
                disabled={
                  props.plan.status !== "PREPARING" ||
                  props.disabled ||
                  props.current.value.status !== "PREPARING"
                }
                max={999999999}
              />
              <MiniFormNumber
                label="중량"
                value={getWeight()}
                unit="T"
                disabled
                precision={3}
                max={999999999}
              />
            </>
          ) : (
            <>
              <MiniFormNumber
                label="출고 수량"
                value={q / 500}
                onChange={(p) => setQ((p ?? 0) * 500)}
                unit="R"
                disabled={
                  props.plan.status !== "PREPARING" ||
                  props.disabled ||
                  props.current.value.status !== "PREPARING"
                }
                max={999999999}
                precision={3}
              />
              <MiniFormNumber
                label=""
                value={q}
                onChange={(p) => setQ(p ?? 0)}
                unit="매"
                disabled={
                  props.plan.status !== "PREPARING" ||
                  props.disabled ||
                  props.current.value.status !== "PREPARING"
                }
                max={999999999}
              />
              <MiniFormNumber
                label="중량"
                value={getWeight()}
                unit="T"
                disabled
                precision={3}
                max={999999999}
              />
            </>
          )}
          <MiniFormString
            label="메모"
            value={m}
            onChange={(p) => setM(p)}
            disabled={
              props.plan.status !== "PREPARING" ||
              props.disabled ||
              props.current.value.status !== "PREPARING"
            }
          />
          {isChanged() && (
            <MiniButton label="저장" onClick={async () => await cmdUpdate()} />
          )}
        </ConfigProvider>
      </div>
      {!props.readonly &&
        props.plan.status === "PROGRESSING" &&
        props.current.value.status !== "PROGRESSED" &&
        (!props.parent || props.parent.value.status === "PROGRESSED") && (
          <div className="flex-initial flex gap-x-2 p-2 bg-yellow-100">
            <TaskCommandButton label="출고" onClick={cmdFinish} type="danger" />
          </div>
        )}
      {props.data.invoiceId && (
        <div className="flex-initial flex gap-x-2 p-2">
          <TaskCommandButton
            label="운송장 출력"
            onClick={async () => {
              props.data.invoiceId && setOpenInvoicePrint(props.data.invoiceId);
            }}
          />
        </div>
      )}
      <Popup.Invoice.Print
        open={openInvoicePrint}
        onClose={setOpenInvoicePrint}
      />
    </div>
  );
}
