import { Api } from "@/@shared";
import { API_HOST } from "@/common/const";
import { message } from "antd";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useGetGroupList(params: {
  query: Partial<Api.StockGroupListQuery>;
}) {
  return useQuery(
    [
      "stockInhouse",
      "groupList",
      params.query.skip,
      params.query.take,
      params.query.planId,
    ],
    async () => {
      const resp = await axios.get<Api.StockGroupListResponse>(
        `${API_HOST}/stock/group`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useGetList(params: { query?: Partial<Api.StockListQuery> }) {
  return useQuery(
    [
      "stockInhouse",
      "list",
      params.query?.warehouseId,
      params.query?.planId,
      params.query?.productId,
      params.query?.packagingId,
      params.query?.grammage,
      params.query?.sizeX,
      params.query?.sizeY,
      params.query?.paperColorGroupId,
      params.query?.paperColorId,
      params.query?.paperPatternId,
      params.query?.paperCertId,
    ],
    async () => {
      if (
        !params.query?.productId ||
        !params.query?.packagingId ||
        !params.query?.grammage ||
        !params.query?.sizeX
      ) {
        return null;
      }

      const resp = await axios.get<Api.StockListResponse>(`${API_HOST}/stock`, {
        params: params.query,
      });
      return resp.data;
    }
  );
}

export function useGetItem(params: { id: number | null }) {
  return useQuery(["stockInhouse", "item", params.id], async () => {
    if (!params.id) {
      return null;
    }

    const resp = await axios.get<Api.StockDetailResponse>(
      `${API_HOST}/stock/${params.id}`
    );
    return resp.data;
  });
}

export async function fetchItemBySerial(serial: string) {
  return await axios.get<Api.StockDetailResponse>(
    `${API_HOST}/stock/by-serial/${serial}`
  );
}

export function useGetItemBySerial(params: { serial: string | null }) {
  return useQuery(
    ["stockInhouse", "item", "by-serial", params.serial],
    async () => {
      if (!params.serial) {
        return null;
      }

      const resp = await fetchItemBySerial(params.serial);
      return resp.data;
    }
  );
}

export function useCreate() {
  const queryClient = useQueryClient();

  return useMutation(
    ["stockInhouse", "create"],
    async (params: { data: Api.StockCreateRequest }) => {
      const resp = await axios.post(`${API_HOST}/stock`, params.data);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["stockInhouse", "groupList"]);
        await queryClient.invalidateQueries(["stockInhouse", "list"]);

        message.info("신규 재고를 등록하였습니다.");
      },
    }
  );
}

export function useCreateArrival() {
  const queryClient = useQueryClient();

  return useMutation(
    ["stockInhouse", "createArrival"],
    async (params: { data: Api.ArrivalStockCreateRequest }) => {
      const resp = await axios.post(`${API_HOST}/stock/arrival`, params.data);
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["stockInhouse", "groupList"]);
        await queryClient.invalidateQueries(["stockInhouse", "list"]);

        message.info("예정 재고를 등록하였습니다.");
      },
    }
  );
}

export function useUpdateQuantity() {
  const queryClient = useQueryClient();

  return useMutation(
    ["stockInhouse", "updateQuantity"],
    async (params: {
      stockId: number;
      data: Api.StockQuantityChangeRequest;
    }) => {
      const resp = await axios.post(
        `${API_HOST}/stock/${params.stockId}`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["stockInhouse", "groupList"]);
        await queryClient.invalidateQueries(["stockInhouse", "list"]);

        message.info("재고 수량을 수정하였습니다.");
      },
    }
  );
}

export function useGetStockGroup(params: {
  query: Partial<Api.StockGroupDetailQuery>;
}) {
  return useQuery(
    [
      "stockInhouse",
      "stockGroup",
      params.query.warehouseId,
      params.query.planId,
      params.query.productId,
      params.query.packagingId,
      params.query.grammage,
      params.query.sizeX,
      params.query.sizeY,
      params.query.paperColorGroupId,
      params.query.paperColorId,
      params.query.paperPatternId,
      params.query.paperCertId,
    ],
    async () => {
      if (!params.query.productId) {
        return null;
      }
      const resp = await axios.get<Api.StockGroupDetailResponse>(
        `${API_HOST}/stock/group/detail`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useGetStockArrival(params: {
  query: Partial<Api.StockArrivalDetailQuery>;
}) {
  return useQuery(
    [
      "stockInhouse",
      "stockArrival",
      params.query.planId,
      params.query.productId,
      params.query.packagingId,
      params.query.grammage,
      params.query.sizeX,
      params.query.sizeY,
      params.query.paperColorGroupId,
      params.query.paperColorId,
      params.query.paperPatternId,
      params.query.paperCertId,
    ],
    async () => {
      if (!params.query.productId) {
        return null;
      }
      const resp = await axios.get<Api.StockArrivalDetail>(
        `${API_HOST}/stock-arrival/detail`,
        {
          params: params.query,
        }
      );
      return resp.data;
    }
  );
}

export function useUpdateStockArrivalPrice() {
  const queryClient = useQueryClient();

  return useMutation(
    ["stockInhouse", "updateStockArrivalPrice"],
    async (params: { data: Api.StockArrivalPriceUpdateRequest }) => {
      const resp = await axios.put(
        `${API_HOST}/stock-arrival/price`,
        params.data
      );
      return resp.data;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["stockInhouse"]);

        message.info("재고 금액을 수정하였습니다.");
      },
    }
  );
}
