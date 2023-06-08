import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Icon, Popup, Table } from "@/components";
import { useEffect, useState } from "react";

export interface Props {
  open: "SALES" | "PURCHASE" | false;
  onClose: (unit: false) => void;
  onSelect: (deposit: Model.Deposit) => void;
}

export default function Component(props: Props) {
  const [page, setPage] = usePage();
  const groupList = ApiHook.Trade.Deposit.useGetList({
    query: {
      type: props.open ? props.open : undefined,
      ...page,
    },
  });
  const [selected, setSelected] = useState<Model.Deposit[]>([]);

  useEffect(() => {
    if (props.open) {
      setSelected([]);
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
          <Table.Default<Model.Deposit>
            data={groupList.data}
            keySelector={(record) =>
              `${record.product.id} ${record.sizeX} ${record.sizeY} ${
                record.grammage
              } ${record.paperColorGroup?.id ?? "_"} ${
                record.paperColor?.id ?? "_"
              } ${record.paperPattern?.id ?? "_"} ${
                record.paperCert?.id ?? "_"
              }`
            }
            selected={selected}
            onSelectedChange={setSelected}
            selection="single"
            columns={[
              {
                title: "거래처",
                dataIndex: ["partnerNickName"],
              },
              ...Table.Preset.columnStockGroup<Model.Deposit>(
                (record) => record
              ),
              ...Table.Preset.columnQuantity<Model.Deposit>(
                (record) => record,
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
              if (selected.length === 0) {
                alert("선택된 재고가 없습니다.");
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
