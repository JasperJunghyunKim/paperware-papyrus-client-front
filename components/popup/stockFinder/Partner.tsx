import { Model } from "@/@shared";
import { ApiHook, QuantityUtil, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Popup, Table } from "@/components";
import _ from "lodash";
import { useEffect, useState } from "react";

type CompanyId = number;
type OpenType = CompanyId | false;
export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
  onSelect: (stockGroup: Model.StockGroup) => void;
}

export default function Component(props: Props) {
  const [groupPage, setGroupPage] = usePage();
  const groupList = ApiHook.Stock.PartnerStock.useGetList({
    query: {
      ...groupPage,
      companyId: _.isNumber(props.open) ? props.open : undefined,
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
      title="매입처 재고 선택"
      {...props}
      open={!!props.open}
      width="calc(100vw - 200px)"
      height="600px"
    >
      <div className="flex flex-col w-full h-full ">
        <div className="flex-1 overflow-y-scroll">
          <Table.Default<Model.StockGroup>
            data={groupList.data}
            keySelector={Util.keyOfStockGroup}
            selected={selectedGroup}
            onSelectedChange={setSelectedGroup}
            selection="single"
            columns={[
              {
                title: "창고",
                dataIndex: ["warehouse", "name"],
              },
              ...Table.Preset.columnStockGroup<Model.StockGroup>((p) => p),
              ...Table.Preset.columnQuantity<Model.StockGroup>(
                (p) => p,
                (record) =>
                  QuantityUtil.compact(record, record).availableQuantity,
                { prefix: "가용" }
              ),
              ...Table.Preset.columnQuantity<Model.StockGroup>(
                (p) => p,
                (record) => QuantityUtil.compact(record, record).totalQuantity,
                { prefix: "실물" }
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
