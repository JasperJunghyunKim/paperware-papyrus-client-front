import DiscountRateCondition from "@/@shared/models/discount-rate-condition";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useState } from "react";
import { TbDiscount } from "react-icons/tb";

type Record = DiscountRateCondition;

export default function Component() {
  const info = ApiHook.Auth.useGetMe();

  const [openCreate, setOpenCreate] = useState<"PURCHASE" | "SALES" | false>(
    false
  );

  const [page, setPage] = usePage();
  const list = ApiHook.Inhouse.Discount.useGetList({
    query: {
      discountRateType: "SALES",
      ...page,
    },
  });
  const [selected, setSelected] = useState<Record[]>([]);
  const itemOnly = Util.only(selected);

  return (
    <Page title="매출 할인율 설정">
      <StatBar.Container>
        <StatBar.Item icon={<TbDiscount />} label="할인율" value={"-"} />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="할인율 등록"
          onClick={() => setOpenCreate("SALES")}
        />
      </Toolbar.Container>
      <Table.Default<Record>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => `${record.id}`}
        selection="multiple"
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "거래처",
            dataIndex: ["partner", "partnerNickName"],
          },
          {
            title: "포장",
            dataIndex: ["packagingType"],
          },
          {
            title: "제품유형",
            dataIndex: ["paperDomain", "name"],
          },
          {
            title: "지군",
            dataIndex: ["paperGroup", "name"],
          },
          {
            title: "지종",
            dataIndex: ["paperType", "name"],
          },
          {
            title: "제지사",
            dataIndex: ["manufacturer", "name"],
          },
          {
            title: "평량",
            dataIndex: ["grammage"],
            render: (value: number) => (
              <div className="text-right font-fixed">{`${Util.comma(value)} ${
                Util.UNIT_GPM
              }`}</div>
            ),
          },
          {
            title: "지폭",
            dataIndex: ["sizeX"],
            render: (value: number) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )} mm`}</div>
            ),
          },
          {
            title: "지장",
            dataIndex: ["sizeY"],
            render: (value: number, record: Record) =>
              record.packagingType !== "ROLL" ? (
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
          ...Table.Preset.columnDiscountRate<Record>(["basicDiscountRate"], {
            prefix: "기본",
          }),
          ...Table.Preset.columnDiscountRate<Record>(["specialDiscountRate"], {
            prefix: "특가",
          }),
        ]}
      />
      <Popup.Discount.Create open={openCreate} onClose={setOpenCreate} />
    </Page>
  );
}
