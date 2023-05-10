import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { useQueryPagination } from "../common";
import {
  GetPaginationQuery,
  useCreate,
  useDelete,
  useModify,
  useQueryData,
  useQueryItem,
  useUpdate,
} from "../common/prelude";

export function useGetItem(id: number | false) {
  return useQueryItem<Record.Plan>("internal/plan", ["plan"], id);
}

export interface GetListQuery extends GetPaginationQuery {}
export function useGetList(query: GetListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Plan>("internal/plan", ["plan"], {
    ...page,
    ...query,
  });

  return [data, page, setPage] as const;
}

export function useGetStats() {
  return useQueryData<Record.WarehouseStats>("internal/plan/stats", [
    "plan",
    "stats",
  ]);
}

export interface GetTaskListQuery extends GetPaginationQuery {}
export function useGetTaskList(planId: number, query: GetTaskListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.Task>(
    `internal/plan/${planId}/task`,
    ["plan", `${planId}`, "task"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export function useDeleteTask() {
  return useDelete(`internal/task`, [["plan"]], {
    message: () => "공정 계획을 삭제하였습니다.",
  });
}

export interface CreateConvertingTask {
  planId: number;
  sizeX: number;
  sizeY: number;
  memo: string;
}
export function useCreateConvertingTask() {
  return useCreate<CreateConvertingTask>(
    `internal/task/converting`,
    [["plan"]],
    {
      message: () => "컨버팅 계획을 추가하였습니다.",
    }
  );
}

export interface UpdateConvertingTask {
  sizeX: number;
  sizeY: number;
  memo: string;
}
export function useUpdateConvertingTask(id: number | null) {
  return useModify<UpdateConvertingTask>({
    url: `internal/task/:id/converting`,
    keys: [["plan"]],
    params: { id: id },
    message: () => "컨버팅 계획을 수정하였습니다.",
  });
}

export interface CreateGuillotineTask {
  planId: number;
  sizeX: number;
  sizeY: number;
  memo: string;
}
export function useCreateGuillotineTask() {
  return useCreate<CreateGuillotineTask>(
    `internal/task/guillotine`,
    [["plan"]],
    {
      message: () => "길로틴 계획을 추가하였습니다.",
    }
  );
}

export interface UpdateGuillotineTask {
  sizeX: number;
  sizeY: number;
  memo: string;
}
export function useUpdateGuillotineTask(id: number | null) {
  return useModify<UpdateConvertingTask>({
    url: `internal/task/:id/converting`,
    keys: [["plan"]],
    params: { id: id },
    message: () => "길로틴 계획을 수정하였습니다.",
  });
}

export interface GetOutputListQuery extends GetPaginationQuery {}
export function useGetOutputList(planId: number, query: GetOutputListQuery) {
  const [page, setPage] = usePage();
  const data = useQueryPagination<Record.StockEvent>(
    `internal/plan/${planId}/output`,
    ["plan", `${planId}`, "output"],
    {
      ...page,
      ...query,
    }
  );

  return [data, page, setPage] as const;
}

export interface CreateOutput {
  productId: number;
  packagingId: number;
  grammage: number;
  sizeX: number;
  sizeY: number;
  paperColorGroupId: number | null;
  paperColorId: number | null;
  paperPatternId: number | null;
  paperCertIds: number[];
  price: number;
  quantity: number;
}
export function useCreateOutput(planId: number | null) {
  return useCreate<CreateOutput>(`internal/plan/${planId}/output`, [["plan"]], {
    message: () => "출고 예정 재고를 추가하였습니다.",
  });
}

export interface Next {}
export function useNext(planId: number | false) {
  return useModify<Next>({
    url: `internal/plan/:planId/next`,
    keys: [["plan"]],
    params: { planId },
    message: () => "계획 상태를 업데이트했습니다.",
  });
}
