import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Icon, Popup, Table } from "@/components";
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
      companyId: typeof props.open === "number" ? props.open : undefined,
      ...groupPage,
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
      title="자사 재고 선택"
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
              {
                title: "제품 유형",
                dataIndex: ["product", "paperDomain", "name"],
              },
              {
                title: "제지사",
                dataIndex: ["product", "manufacturer", "name"],
              },
              {
                title: "지군",
                dataIndex: ["product", "paperGroup", "name"],
              },
              {
                title: "지종",
                dataIndex: ["product", "paperType", "name"],
              },
              {
                title: "포장",
                dataIndex: ["packaging", "type"],
                render: (value, record) => (
                  <div className="font-fixed flex gap-x-1">
                    <div className="flex-initial flex flex-col justify-center text-lg">
                      <Icon.PackagingType
                        packagingType={record.packaging.type}
                      />
                    </div>
                    <div className="flex-initial flex flex-col justify-center">
                      {value}
                    </div>
                  </div>
                ),
              },
              {
                title: "평량",
                dataIndex: "grammage",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )} ${Util.UNIT_GPM}`}</div>
                ),
              },
              {
                title: "지폭",
                dataIndex: "sizeX",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )} mm`}</div>
                ),
              },
              {
                title: "지장",
                dataIndex: "sizeY",
                render: (value, record) =>
                  record.packaging.type !== "ROLL" ? (
                    <div className="text-right font-fixed">{`${Util.comma(
                      value
                    )} mm`}</div>
                  ) : null,
              },
              {
                title: "색군",
                dataIndex: ["paperColorGroup", "name"],
              },
              {
                title: "색상",
                dataIndex: ["paperColor", "name"],
              },
              {
                title: "무늬",
                dataIndex: ["paperPattern", "name"],
              },
              {
                title: "인증",
                dataIndex: ["paperCert", "name"],
              },
              {
                title: "실물 수량",
                dataIndex: "totalQuantity",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )}`}</div>
                ),
              },
              {
                title: "가용 수량",
                dataIndex: "availableQuantity",
                render: (value) => (
                  <div className="text-right font-fixed">{`${Util.comma(
                    value
                  )}`}</div>
                ),
              },
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
