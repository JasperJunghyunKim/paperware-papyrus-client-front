import { Table } from "antd";
import { ColumnType } from "antd/lib/table/interface";
import { TableComponents } from "rc-table/lib/interface";
import { useMemo } from "react";

interface Props<T> {
  data: T[] | null | undefined;
  columns: ColumnType<T>[];
  keySelector: (record: T) => string | number;
  borderless?: boolean;
  selection?: "none" | "single" | "multiple";
  selected?: T[];
  onSelectedChange?: (selected: T[]) => void;
  className?: string;
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
    <Table<T>
      bordered={!props.borderless}
      rowKey={props.keySelector}
      scroll={{ x: true }}
      size="small"
      columns={props.columns}
      pagination={false}
      dataSource={props.data ?? []}
      components={components}
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
      rootClassName={props.className}
    />
  );
}
