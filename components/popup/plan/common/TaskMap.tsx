import { Model } from "@/@shared";
import { ApiHook, PaperUtil, Util } from "@/common";
import { Button, Icon } from "@/components";
import { ConfigProvider, InputNumber } from "antd";
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
}

export default function Component(props: Props) {
  const tasks = ApiHook.Working.Plan.useGetTaskList({
    planId: props.plan.id,
  });
  const converted = convert(tasks.data ?? []);
  return (
    <div className="w-auto h-full flex">
      <div className="flex-1 flex flex-col p-4 overflow-y-scroll">
        <div className="flex-initial flex flex-col gap-y-4">
          {converted.map((item) => (
            <Item
              data={item}
              key={item.value.id}
              plan={props.plan}
              edge={false}
              parent={null}
            />
          ))}
        </div>
        {props.plan.status === "PREPARING" && (
          <>
            {props.packagingType === "ROLL" && (
              <AddNode
                type="CONVERTING"
                plan={props.plan}
                parentTaskId={null}
              />
            )}
            {props.packagingType !== "ROLL" && (
              <AddNode
                type="GUILLOTINE"
                plan={props.plan}
                parentTaskId={null}
              />
            )}
            {props.packagingType !== "ROLL" &&
              !converted.some((p) => p.value.type === "QUANTITY") && (
                <AddNode
                  type="QUANTITY"
                  plan={props.plan}
                  parentTaskId={null}
                />
              )}
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
                "bg-orange-800": props.data.value.type === "QUANTITY",
              }
            )}
          >
            <div className="flex-initial flex flex-col justify-center text-2xl">
              <Icon.TaskType taskType={props.data.value.type} />
            </div>
            <div className="flex-1">
              {Util.taskTypeToString(props.data.value.type)}
            </div>
            {props.plan.status === "PREPARING" && (
              <div
                className="flex-initial flex flex-col justify-center text-2xl cursor-pointer hover:text-red-600"
                onClick={() => cmdDelete()}
              >
                <TbX />
              </div>
            )}
            {props.plan.status === "PROGRESSING" && (
              <div className="flex-initial flex gap-x-2 text-yellow-300">
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
              />
            )}
            {props.data.value.taskGuillotine && (
              <GuillotineNode
                plan={props.plan}
                taskId={props.data.value.id}
                data={props.data.value.taskGuillotine}
                current={props.data}
                parent={props.parent}
              />
            )}
            {props.data.value.taskQuantity && (
              <QuantityNode
                plan={props.plan}
                taskId={props.data.value.id}
                data={props.data.value.taskQuantity}
                current={props.data}
                parent={props.parent}
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
              {props.data.childs.length === 0 &&
                Util.inc(props.data.value.type, "CONVERTING", "GUILLOTINE") && (
                  <AddNode
                    type="QUANTITY"
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
            sizeX: props.plan.targetStockGroupEvent.stockGroup.sizeX,
            sizeY: props.plan.targetStockGroupEvent.stockGroup.sizeY,
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
            sizeX: props.plan.targetStockGroupEvent.stockGroup.sizeX,
            sizeY: props.plan.targetStockGroupEvent.stockGroup.sizeY,
            memo: "",
          },
        });
        break;
      }
      case "QUANTITY": {
        const res = await apiCreateQuantity.mutateAsync({
          data: {
            planId: props.plan.id,
            parentTaskId: props.parentTaskId,
            quantity: 0,
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
              "border-orange-600 text-orange-600": props.type === "QUANTITY",
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

interface MiniFormProps {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  unit?: string;
  disabled?: boolean;
  precision?: number;
}
function MiniFormNumber(props: MiniFormProps) {
  return (
    <div className="flex-initial flex">
      <div className="basis-16 flex flex-col justify-center">{props.label}</div>
      <div className="flex-1">
        <InputNumber
          value={props.value}
          onChange={(p) => props.onChange?.(p ?? 0)}
          min={0}
          max={9999}
          precision={props.precision ?? 0}
          rootClassName="w-full"
          addonAfter={props.unit}
          disabled={props.disabled}
        />
      </div>
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
}
function ConvertingNode(props: ConvertingProps) {
  const [initialW, setInitialW] = useState(props.data.sizeX);
  const [initialH, setInitialH] = useState(props.data.sizeY);
  const [w, setW] = useState(props.data.sizeX);
  const [h, setH] = useState(props.data.sizeY);

  const apiUpdate = ApiHook.Working.Task.useUpdateConverting();
  const cmdUpdate = useCallback(async () => {
    await apiUpdate.mutateAsync({
      taskId: props.taskId,
      data: {
        sizeX: w,
        sizeY: h,
        memo: "",
      },
    });
    setInitialW(w);
    setInitialH(h);
  }, [props.taskId, w, h, apiUpdate]);

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
    return initialW !== w || initialH !== h;
  }, [initialW, initialH, w, h]);

  return (
    <div className="flex-initial flex flex-col gap-y-2">
      <div className="flex-1 flex flex-col gap-y-2 p-4">
        <ConfigProvider
          theme={{ token: { borderRadius: 999, colorTextDisabled: "black" } }}
        >
          <MiniFormNumber
            label="공정 지폭"
            value={w}
            onChange={(p) => setW(p ?? 0)}
            unit="mm"
            disabled={props.plan.status !== "PREPARING"}
          />
          <MiniFormNumber
            label="공정 지장"
            value={h}
            onChange={(p) => setH(p ?? 0)}
            unit="mm"
            disabled={props.plan.status !== "PREPARING"}
          />
          {props.plan.status === "PREPARING" && isChanged() && (
            <MiniButton label="저장" onClick={async () => await cmdUpdate()} />
          )}
        </ConfigProvider>
      </div>
      {props.plan.status === "PROGRESSING" &&
        props.current.value.status !== "PROGRESSED" && (
          <div className="flex-initial flex gap-x-2 p-2 bg-yellow-100">
            {props.current.value.status === "PREPARING" &&
              (!props.parent || props.parent.value.status === "PROGRESSED") && (
                <TaskCommandButton label="작업 시작" onClick={cmdStart} />
              )}
            {props.current.value.status === "PROGRESSING" && (
              <TaskCommandButton label="작업 역행" onClick={cmdReset} />
            )}
            {props.current.value.status === "PROGRESSING" && (
              <TaskCommandButton label="작업 완료" onClick={cmdFinish} />
            )}
          </div>
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
}
function GuillotineNode(props: GuillotineProps) {
  const [initialW, setInitialW] = useState(props.data.sizeX);
  const [initialH, setInitialH] = useState(props.data.sizeY);
  const [w, setW] = useState(props.data.sizeX);
  const [h, setH] = useState(props.data.sizeY);

  const apiUpdate = ApiHook.Working.Task.useUpdateGuillotine();
  const cmdUpdate = useCallback(async () => {
    await apiUpdate.mutateAsync({
      taskId: props.taskId,
      data: {
        sizeX: w,
        sizeY: h,
        memo: "",
      },
    });
    setInitialW(w);
    setInitialH(h);
  }, [props.taskId, w, h, apiUpdate]);

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
    return initialW !== w || initialH !== h;
  }, [initialW, initialH, w, h]);

  return (
    <div className="flex-initial flex flex-col gap-y-2">
      <div className="flex-1 flex flex-col gap-y-2 p-4">
        <ConfigProvider
          theme={{ token: { borderRadius: 999, colorTextDisabled: "black" } }}
        >
          <MiniFormNumber
            label="공정 지폭"
            value={w}
            onChange={(p) => setW(p ?? 0)}
            unit="mm"
            disabled={props.plan.status !== "PREPARING"}
          />
          <MiniFormNumber
            label="공정 지장"
            value={h}
            onChange={(p) => setH(p ?? 0)}
            unit="mm"
            disabled={props.plan.status !== "PREPARING"}
          />
          {isChanged() && (
            <MiniButton label="저장" onClick={async () => await cmdUpdate()} />
          )}
        </ConfigProvider>
      </div>
      {props.plan.status === "PROGRESSING" &&
        props.current.value.status !== "PROGRESSED" && (
          <div className="flex-initial flex gap-x-2 p-2 bg-yellow-100">
            {props.current.value.status === "PREPARING" &&
              (!props.parent || props.parent.value.status === "PROGRESSED") && (
                <TaskCommandButton label="작업 시작" onClick={cmdStart} />
              )}
            {props.current.value.status === "PROGRESSING" && (
              <TaskCommandButton label="작업 역행" onClick={cmdReset} />
            )}
            {props.current.value.status === "PROGRESSING" && (
              <TaskCommandButton label="작업 완료" onClick={cmdFinish} />
            )}
          </div>
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
}
function QuantityNode(props: QuantityProps) {
  const [initialQ, setInitialQ] = useState(props.data.quantity);
  const [q, setQ] = useState(props.data.quantity);

  const apiUpdate = ApiHook.Working.Task.useUpdateQuantity();
  const cmdUpdate = useCallback(async () => {
    await apiUpdate.mutateAsync({
      taskId: props.taskId,
      data: {
        quantity: q,
      },
    });
    setInitialQ(q);
  }, [props.taskId, q, apiUpdate]);

  const apiFinish = ApiHook.Working.Task.useFinish();
  const cmdFinish = useCallback(async () => {
    if (!props.taskId) return;

    await apiFinish.mutateAsync({
      id: props.taskId,
      planId: props.plan.id,
    });
  }, [props.plan.id, props.taskId, apiFinish]);

  const isChanged = useCallback(() => {
    return initialQ !== q;
  }, [initialQ, q]);

  const getWeight = useCallback(() => {
    let parent = props.parent;
    return (
      (PaperUtil.convertQuantityWith(
        {
          ...props.plan.targetStockGroupEvent.stockGroup,
          sizeX:
            parent?.value.taskConverting?.sizeX ??
            parent?.value.taskGuillotine?.sizeX ??
            0,
          sizeY:
            parent?.value.taskConverting?.sizeY ??
            parent?.value.taskGuillotine?.sizeY ??
            0,
        },
        "매",
        props.data.quantity
      )?.grams ?? 0) * 0.000001
    );
  }, [props.current, props.parent]);

  return (
    <div className="flex-initial flex flex-col gap-y-2">
      <div className="flex-1 flex flex-col gap-y-2 p-4">
        <ConfigProvider
          theme={{ token: { borderRadius: 999, colorTextDisabled: "black" } }}
        >
          <MiniFormNumber
            label="출고 수량"
            value={q}
            onChange={(p) => setQ(p ?? 0)}
            unit="매"
            disabled={props.plan.status !== "PREPARING"}
          />
          <MiniFormNumber
            label="중량"
            value={getWeight()}
            unit="톤"
            disabled
            precision={3}
          />
          {isChanged() && (
            <MiniButton label="저장" onClick={async () => await cmdUpdate()} />
          )}
        </ConfigProvider>
      </div>
      {props.plan.status === "PROGRESSING" &&
        props.current.value.status !== "PROGRESSED" && (
          <div className="flex-initial flex gap-x-2 p-2 bg-yellow-100">
            {props.current.value.status === "PREPARING" &&
              (!props.parent || props.parent.value.status === "PROGRESSED") && (
                <TaskCommandButton
                  label="출고"
                  onClick={cmdFinish}
                  type="danger"
                />
              )}
          </div>
        )}
    </div>
  );
}
