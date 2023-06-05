import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Icon, Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { OrderUpsertOpen } from "@/components/popup/order/StockUpsert";
import classNames from "classnames";
import { useState } from "react";
import { TbHome2 } from "react-icons/tb";

type RecordType = Model.Order;

export default function Component() {
  const info = ApiHook.Auth.useGetMe();

  const [openStockUpsert, setOpenStockUpsert] =
    useState<OrderUpsertOpen>(false);

  const partnerColumn = Table.Preset.useColumnPartner<RecordType>(
    ["dstCompany", "companyRegistrationNumber"],
    { title: "매입처", fallback: (record) => record.dstCompany.businessName }
  );
  const [page, setPage] = usePage();
  const list = ApiHook.Trade.Common.useGetList({
    query: {
      ...page,
      srcCompanyId: info.data?.companyId,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  return (
    <Page title="매입 주문 목록">
      <StatBar.Container>
        <StatBar.Item icon={<TbHome2 />} label="관리 매입처" value={"-"} />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="정상 매입 등록"
          onClick={() => setOpenStockUpsert("CREATE_ORDER")}
        />
        <div className="flex-1" />
        <Toolbar.ButtonPreset.Update
          label="매입 정보 상세"
          onClick={() => only && setOpenStockUpsert(only.id)}
          disabled={!only}
        />
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => `${record.id}`}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          ...partnerColumn,
          {
            title: "사업자등록번호",
            dataIndex: ["dstCompany", "companyRegistrationNumber"],
          },
          ...Table.Preset.columnConnection<RecordType>([
            "dstCompany",
            "managedById",
          ]),
          {
            title: "주문 번호",
            dataIndex: "orderNo",
            render: (value, record) => (
              <div className="flex">
                <div className="font-fixed bg-sky-100 px-1 text-sky-800 rounded-md">
                  {value}
                </div>
              </div>
            ),
          },
          {
            title: "도착 희망일",
            dataIndex: "arrivalDate",
            render: (value) => Util.formatIso8601ToLocalDate(value),
          },
          {
            title: "도착지",
            dataIndex: ["orderStock", "dstLocation", "name"],
          },
          {
            title: "도착지 주소",
            dataIndex: ["orderStock", "dstLocation", "address"],
            render: (value) => <div>{Util.formatAddress(value)}</div>,
          },
          {
            title: "주문 상태",
            dataIndex: "status",
            render: (value: Model.Enum.OrderStatus) => (
              <div
                className={classNames("flex gap-x-2", {
                  "text-amber-600": Util.inc(
                    value,
                    "OFFER_PREPARING",
                    "ORDER_PREPARING"
                  ),
                  "text-green-600": Util.inc(
                    value,
                    "OFFER_REQUESTED",
                    "ORDER_REQUESTED"
                  ),
                  "text-red-600": Util.inc(
                    value,
                    "OFFER_REJECTED",
                    "ORDER_REJECTED"
                  ),
                  "text-black": Util.inc(value, "ACCEPTED"),
                })}
              >
                <div className="flex-initial flex flex-col justify-center">
                  <Icon.OrderStatus value={value} />
                </div>
                <div className="flex-initial flex flex-col justify-center">
                  {Util.orderStatusToSTring(value)}
                </div>
              </div>
            ),
          },
          {
            title: "제품 유형",
            dataIndex: ["orderStock", "product", "paperDomain", "name"],
          },
          {
            title: "제지사",
            dataIndex: ["orderStock", "product", "manufacturer", "name"],
          },
          {
            title: "지군",
            dataIndex: ["orderStock", "product", "paperGroup", "name"],
          },
          {
            title: "지종",
            dataIndex: ["orderStock", "product", "paperType", "name"],
          },
          {
            title: "포장",
            dataIndex: ["orderStock", "packaging", "type"],
            render: (value, record) => (
              <div className="font-fixed flex gap-x-1">
                <div className="flex-initial flex flex-col justify-center text-lg">
                  <Icon.PackagingType
                    packagingType={
                      record.orderStock.plan.at(0)?.assignStockEvent?.stock
                        .packaging.type
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
            title: "평량",
            dataIndex: ["orderStock", "grammage"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(value)} ${
                Util.UNIT_GPM
              }`}</div>
            ),
          },
          {
            title: "지폭",
            dataIndex: ["orderStock", "sizeX"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )} mm`}</div>
            ),
          },
          {
            title: "지장",
            dataIndex: ["orderStock", "sizeY"],
            render: (value, record) =>
              record.orderStock.plan.at(0)?.assignStockEvent?.stock.packaging
                .type !== "ROLL" ? (
                <div className="text-right font-fixed">{`${Util.comma(
                  value
                )} mm`}</div>
              ) : null,
          },
          {
            title: "색군",
            dataIndex: ["orderStock", "paperColorGroup", "name"],
          },
          {
            title: "색상",
            dataIndex: ["orderStock", "paperColor", "name"],
          },
          {
            title: "무늬",
            dataIndex: ["orderStock", "paperPattern", "name"],
          },
          {
            title: "인증",
            dataIndex: ["orderStock", "paperCert", "name"],
          },
          {
            title: "주문 수량",
            dataIndex: ["orderStock", "quantity"],
            render: (value) => (
              <div className="text-right font-fixed">{`${Util.comma(
                value
              )}`}</div>
            ),
          },
        ]}
      />
      <Popup.Order.StockUpsert
        open={openStockUpsert}
        onClose={setOpenStockUpsert}
      />
    </Page>
  );
}
