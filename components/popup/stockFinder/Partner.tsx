import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Icon, Popup, Table } from "@/components";
import _ from "lodash";
import { useEffect, useState } from "react";

type CompanyId = number;
type OpenType = CompanyId | false;
export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
  onSelect: (stockGroup: Model.PartnerStockGroup) => void;
}

export default function Component(props: Props) {
  const [groupPage, setGroupPage] = usePage();
  const groupList = ApiHook.Stock.PartnerStock.useGetList({
    query: {
      ...groupPage,
      companyId: _.isNumber(props.open) ? props.open : undefined,
    },
  });
  const [selectedGroup, setSelectedGroup] = useState<Model.PartnerStockGroup[]>(
    []
  );

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
      <div className="flex flex-col w-full h-full">
        <div className="flex-1">
          <Table.Default<Model.PartnerStockGroup>
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
                title: "창고",
                dataIndex: ["warehouse", "name"],
              },
              ...Table.Preset.columnStockGroup<Model.PartnerStockGroup>(
                (p) => p, // TODO
                []
              ),
              ...Table.Preset.columnQuantity<Model.PartnerStockGroup>(
                (p) => p, // TODO
                ["availableQuantity"],
                { prefix: "가용" }
              ),
              ...Table.Preset.columnQuantity<Model.PartnerStockGroup>(
                (p) => p, // TODO
                ["totalQuantity"],
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
