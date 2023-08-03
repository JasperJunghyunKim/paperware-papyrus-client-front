import { Model } from "@/@shared";
import {
  OrderDeposit,
  Packaging,
  PaperCert,
  PaperColor,
  PaperColorGroup,
  PaperPattern,
  Product,
  StockEvent,
} from "@/@shared/models";
import { OrderStatus, OrderType } from "@/@shared/models/enum";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Banner, Popup, Table } from "@/components";

export type OpenType = Model.Deposit | false;

export interface Props {
  open: OpenType;
  type: "PURCHASE" | "SALES";
  onClose: (unit: false) => void;
}

type EventType = {
  id: number;
  change: number;
  targetOrder: {
    id: number;
    orderType: OrderType;
    orderNo: string;
    orderDate: string;
    srcCompanyId: number;
    dstCompanyId: number;
    status: OrderStatus;
  } | null;
  user: {
    name: string;
    company: {
      companyRegistrationNumber: string;
    };
  };
  createdAt: string;
  memo: string;
  deposit: {
    id: number;
    packaging: Packaging;
    product: Product;
    grammage: number;
    sizeX: number;
    sizeY: number;
    paperColorGroup: PaperColorGroup | null;
    paperColor: PaperColor | null;
    paperPattern: PaperPattern | null;
    paperCert: PaperCert | null;
  };
  orderDeposit: OrderDeposit | null;
};

export default function Component(props: Props) {
  const me = ApiHook.Auth.useGetMe();
  const item = ApiHook.Trade.Deposit.useGetItem({
    id: props.open ? props.open.id : null,
  });

  return (
    <Popup.Template.Property
      title="보관량 상세"
      width="calc(100vw - 400px)"
      height="calc(100vh - 100px)"
      {...props}
      open={!!props.open}
      hideScroll
    >
      <div className="flex-1 flex flex-col w-0">
        <div className="flex-initial flex flex-col m-3">
          {props.open && <Banner.Deposit spec={props.open} />}
        </div>
        <div className="flex-initial basis-px bg-gray-200" />
        <div className="flex-initial bg-slate-500 font-bold text-white text-sm p-2">
          재고 이력
        </div>
        <div className="flex-1 overflow-y-scroll">
          <Table.Simple<EventType>
            data={item.data}
            keySelector={(p) => p.id}
            columns={[
              {
                title: "작업 구분",
                render: (_, record) => (
                  <div>
                    {record.orderDeposit
                      ? `${props.type === "SALES" ? "매출" : "매입"} 보관`
                      : record.targetOrder
                      ? `보관 ${record.change < 0 ? "출고" : "입고"}`
                      : record.change > 0
                      ? "보관량 증가"
                      : "보관량 차감"}
                  </div>
                ),
              },
              ...Table.Preset.columnQuantity<EventType>(
                (record) => record.deposit,
                (record) => record.change,
                {
                  prefix: "변동",
                  delta: true,
                }
              ),
              ...Table.Preset.useColumnPartner2({
                title: "회사명",
                getValue: (record: EventType) =>
                  record.user.company.companyRegistrationNumber,
                fallback: (record: EventType) =>
                  (record.user.company as any).businessName,
              }),
              {
                title: "등록자",
                render: (record: EventType) => record.user.name,
              },
              {
                title: "등록일시",
                render: (_, record) => (
                  <div>
                    {Util.formatIso8601ToLocalDateTime(record.createdAt)}
                  </div>
                ),
              },
              {
                title: "변동 사유",
                render: (_, record) => <div>{record.memo}</div>,
              },
            ]}
          />
        </div>
      </div>
    </Popup.Template.Property>
  );
}
