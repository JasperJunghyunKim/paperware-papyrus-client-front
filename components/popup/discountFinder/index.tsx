import { DiscountRateMappingQuery } from "@/@shared/api/inhouse/discount-rate.request";
import { DiscountRateMappingResponse } from "@/@shared/api/inhouse/discount-rate.response";
import { ApiHook, Util } from "@/common";
import { Button, Icon, Popup } from "@/components";
import { Table } from "antd";
import { useCallback, useMemo, useState } from "react";
import { TableComponents } from "rc-table/lib/interface";
import { Preset } from "@/components/table";

type Open = DiscountRateMappingQuery | false;
type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
type Record = ArrayElement<DiscountRateMappingResponse>;

interface Props {
  type: "PURCHASE" | "SALES";
  open: Open;
  onClose: (unit: false) => void;
  onSelect: (Record: Record) => void;
}

export default function (props: Props) {
  const groupList = ApiHook.Inhouse.Discount.useGetMapping({
    query: props.open ? props.open : undefined,
  });
  const [selected, setSelected] = useState<Record[]>([]);

  const keySelector = useCallback((record: Record) => {
    return `
    ${record.discountRateCondition.packagingType}-
    ${record.discountRateCondition.paperDomain?.id}-
    ${record.discountRateCondition.manufacturer?.id}-
    ${record.discountRateCondition.paperGroup?.id}-
    ${record.discountRateCondition.paperType?.id}-
    ${record.discountRateCondition.grammage}-
    ${record.discountRateCondition.sizeX}-
    ${record.discountRateCondition.sizeY}-
    ${record.discountRateCondition.paperColorGroup?.id}-
    ${record.discountRateCondition.paperColor?.id}-
    ${record.discountRateCondition.paperPattern?.id}-
    ${record.discountRateCondition.paperCert?.id}-
    ${record.discountRateMapType}-
    ${record.discountRateUnit}-
    `;
  }, []);

  const components = useMemo((): TableComponents<Record> => {
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
    <Popup.Template.Full
      title={`${props.type === "PURCHASE" ? "매입" : "매출"}할인율 선택`}
      width="calc(100vw - 400px)"
      height="600px"
      {...props}
      open={!!props.open}
    >
      <div className="flex flex-col w-full h-full">
        <div className="flex-1">
          <Table
            dataSource={groupList.data ?? []}
            rowKey={keySelector}
            rowSelection={{
              selectedRowKeys: selected.map(keySelector),
              onChange: (keys, records) => {
                setSelected(records);
              },
              type: "radio",
            }}
            columns={[
              {
                title: "포장",
                dataIndex: ["discountRateCondition", "packagingType"],
                render: (value, record) => (
                  <div className="font-fixed flex gap-x-1">
                    <div className="flex-initial flex flex-col justify-center text-lg">
                      <Icon.PackagingType
                        packagingType={
                          record.discountRateCondition.packagingType
                        }
                      />
                    </div>
                    <div className="flex-initial flex flex-col justify-center">
                      {value}
                    </div>
                  </div>
                ),
              },
              {
                title: "제품 유형",
                dataIndex: ["discountRateCondition", "paperDomain", "name"],
              },
              {
                title: "제지사",
                dataIndex: ["discountRateCondition", "manufacturer", "name"],
              },
              {
                title: "지군",
                dataIndex: ["discountRateCondition", "paperGroup", "name"],
              },
              {
                title: "지종",
                dataIndex: ["discountRateCondition", "paperType", "name"],
              },
              {
                title: "평량",
                dataIndex: ["discountRateCondition", "grammage"],
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )} ${Util.UNIT_GPM}`}</div>
                ),
              },
              {
                title: "지폭",
                dataIndex: ["discountRateCondition", "sizeX"],
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )} mm`}</div>
                ),
              },
              {
                title: "지장",
                dataIndex: ["discountRateCondition", "sizeY"],
                render: (value, record) =>
                  record.discountRateCondition.packagingType !== "ROLL" ? (
                    <div className="text-right font-fixed">{`${Util.comma(
                      value
                    )} mm`}</div>
                  ) : null,
              },
              {
                title: "색군",
                dataIndex: ["discountRateCondition", "paperColorGroup", "name"],
              },
              {
                title: "색상",
                dataIndex: ["discountRateCondition", "paperColor", "name"],
              },
              {
                title: "무늬",
                dataIndex: ["discountRateCondition", "paperPattern", "name"],
              },
              {
                title: "인증",
                dataIndex: ["discountRateCondition", "paperCert", "name"],
              },
              ...Preset.columnDiscountRate<Record>([], {}),
              {
                title: "구분",
                dataIndex: "discountRateMapType",
                render: (value) => (value === "SPECIAL" ? "특가" : "기본"),
              },
            ]}
            onRow={(record) => {
              return {
                onClick: () => {
                  setSelected([record]);
                },
              };
            }}
            bordered
            components={components}
            pagination={false}
          />
        </div>
        <div className="basis-px bg-gray-200" />
        <div className="flex-initial flex justify-center gap-x-2 p-4">
          <Button.Default
            label="할인율 선택"
            onClick={() => {
              if (selected.length === 0) {
                alert("선택된 할이율이 없습니다.");
                return;
              }
              props.onSelect(selected[0]);
            }}
            type="primary"
            disabled={selected.length === 0}
          />
          <Button.Default label="취소" onClick={() => props.onClose(false)} />
        </div>
      </div>
    </Popup.Template.Full>
  );
}
