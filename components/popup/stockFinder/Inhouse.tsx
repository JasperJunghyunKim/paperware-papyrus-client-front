import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Icon, Popup, Table } from "@/components";
import { useEffect, useState } from "react";

export interface Props {
  open: boolean;
  onClose: (unit: false) => void;
  onSelect: (stockGroup: Model.StockGroup) => void;
}

export default function Component(props: Props) {
  const [groupPage, setGroupPage] = usePage();
  const groupList = ApiHook.Stock.StockInhouse.useGetGroupList({
    query: {
      ...groupPage,
    },
  });
  const [selectedGroup, setSelectedGroup] = useState<Model.StockGroup[]>([]);

  useEffect(() => {
    if (props.open) {
      setSelectedGroup([]);
    }
  }, [props.open]);

  return (
    <Popup.Template.Full
      title="자사 재고 선택"
      {...props}
      open={!!props.open}
      width="calc(100vw - 200px)"
      height="600px"
    >
      <div className="flex flex-col w-full h-full">
        <div className="flex-1">
          <Table.Default<Model.StockGroup>
            data={groupList.data}
            keySelector={(record) =>
              `${record.product.id} ${record.sizeX} ${record.sizeY} ${
                record.grammage
              } ${record.paperColorGroup?.id ?? "_"} ${
                record.paperColor?.id ?? "_"
              } ${record.paperPattern?.id ?? "_"} ${
                record.paperCert?.id ?? "_"
              } ${record.warehouse?.id ?? "_"}`
            }
            selected={selectedGroup}
            onSelectedChange={setSelectedGroup}
            selection="single"
            columns={[
              {
                title: "거래처",
                dataIndex: ["orderCompanyInfo", "businessName"],
              },
              {
                title: "도착지",
                dataIndex: ["orderStock", "dstLocation", "name"],
              },
              {
                title: "예정일",
                dataIndex: ["orderInfo", "wantedDate"],
                render: (value) => (
                  <div className="font-fixed">
                    {Util.formatIso8601ToLocalDate(value)}
                  </div>
                ),
              },
              {
                title: "창고",
                dataIndex: ["warehouse", "name"],
              },
              ...Table.Preset.columnStockGroup<Model.StockGroup>(
                (record) => record,
                []
              ),
              ...Table.Preset.columnQuantity<Model.StockGroup>(
                (record) => record,
                ["totalQuantity"],
                { prefix: "실물" }
              ),
              ...Table.Preset.columnQuantity<Model.StockGroup>(
                (record) => record,
                ["availableQuantity"],
                { prefix: "가용" }
              ),
            ]}
          />
        </div>
        <div className="basis-px bg-gray-200" />
        <div className="flex-initial flex justify-center gap-x-2 p-4">
          <Button.Default
            label="재고 선택"
            onClick={() => {
              if (selectedGroup.length === 0) {
                alert("선택된 재고가 없습니다.");
                return;
              }
              props.onSelect(selectedGroup[0]);
            }}
            type="primary"
            disabled={selectedGroup.length === 0}
          />
          <Button.Default label="취소" onClick={() => props.onClose(false)} />
        </div>
      </div>
    </Popup.Template.Full>
  );
}
