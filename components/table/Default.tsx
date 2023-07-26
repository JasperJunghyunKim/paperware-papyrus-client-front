import { PaginationResponse } from "@/@shared/models/pagination";
import { ApiHook } from "@/common";
import { ConfigProvider, Empty, Table } from "antd";
import { ColumnType, ExpandableConfig } from "antd/lib/table/interface";
import { TableComponents } from "rc-table/lib/interface";
import { useMemo } from "react";

interface Props<T> {
  data: PaginationResponse<T> | null | undefined;
  page?: ApiHook.Common.GetPaginationQuery;
  setPage?: (page: ApiHook.Common.GetPaginationQuery) => void;
  columns: ColumnType<T>[];
  keySelector: (record: T) => string | number;
  selected?: T[];
  onSelectedChange?: (selected: T[]) => void;
  selection?: "none" | "single" | "multiple";
  expandable?: ExpandableConfig<T>;
  borderless?: boolean;
  className?: string;
  footer?: any;
}

export default function Component<T extends object>(props: Props<T>) {
  const components = useMemo((): TableComponents<T> => {
    return {
      header: {
        cell: (cellProps: any) => {
          return (
            <th
              {...cellProps}
              style={{
                padding: "8px 8px",
                wordBreak: "keep-all",
                whiteSpace: "nowrap",
              }}
            />
          );
        },
      },
      body: {
        cell: (cellProps: any) => {
          return (
            <td
              {...cellProps}
              style={{
                padding: "4px 8px",
                wordBreak: "keep-all",
                whiteSpace: "nowrap",
              }}
            />
          );
        },
      },
    };
  }, []);

  return (
    <ConfigProvider
      renderEmpty={() => <div>항목 없음</div>}
      theme={{
        token: {
          borderRadius: 0,
        },
      }}
    >
      <Table<T>
        bordered={!props.borderless}
        pagination={
          props.page
            ? {
                position: ["bottomCenter"],
                size: "default",
                pageSize: props.page.take,
                total: props.data?.total ?? 0,
                onChange: (page, pageSize) => {
                  props.setPage?.({
                    skip: (page - 1) * pageSize ?? 100,
                    take: pageSize ?? 100,
                  });
                },
              }
            : false
        }
        rowKey={props.keySelector}
        scroll={{ x: true }}
        size="small"
        columns={props.columns}
        summary={props.footer}
        rowSelection={
          props.selection === "none"
            ? undefined
            : {
                selectedRowKeys: props.selected?.map(props.keySelector),
                onChange: (_selectedRowKeys, selectedRows) => {
                  props.onSelectedChange?.(selectedRows as T[]);
                },
                type: props.selection === "single" ? "radio" : "checkbox",
              }
        }
        onRow={(record) => {
          return {
            onClick: () => {
              props.onSelectedChange?.([record]);
            },
          };
        }}
        expandable={props.expandable}
        dataSource={props.data?.items}
        components={components}
        tableLayout="auto"
        className={props.className}
      />
    </ConfigProvider>
  );
}
