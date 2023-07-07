import { Model } from "@/@shared";
import { StockEvent } from "@/@shared/models";
import { PaginationResponse } from "@/@shared/models/pagination";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Banner, Popup, Table } from "@/components";

export type OpenType = Model.StockGroup | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

type StockEventType = StockEvent & { remainingQuantity: number };

export default function Component(props: Props) {
  const [page, setPage] = usePage();

  const item = ApiHook.Stock.StockInhouse.useGetStockGroupHistory({
    query: props.open
      ? {
          warehouseId: props.open.warehouse?.id,
          productId: props.open.product.id,
          packagingId: props.open.packaging.id,
          grammage: props.open.grammage,
          sizeX: props.open.sizeX,
          sizeY: props.open.sizeY,
          paperColorGroupId: props.open.paperColorGroup?.id,
          paperColorId: props.open.paperColor?.id,
          paperPatternId: props.open.paperPattern?.id,
          paperCertId: props.open.paperCert?.id,
        }
      : {},
  });

  return (
    <Popup.Template.Property
      title="재고 내역 상세"
      width="calc(100vw - 400px)"
      height="calc(100vh - 100px)"
      {...props}
      open={!!props.open}
      hideScroll
    >
      <div className="flex-1 flex flex-col w-0">
        <div className="flex-initial flex flex-col m-3">
          {props.open && <Banner.Stock spec={props.open} />}
        </div>
        <div className="flex-initial basis-px bg-gray-200" />
        <div className="flex-initial bg-slate-500 font-bold text-white text-sm p-2">
          재고 목록
        </div>
        <div className="flex-1 overflow-y-scroll">
          <Table.Simple
            data={item.data?.stocks}
            keySelector={(p) => p.id}
            columns={Table.Preset.columnStock<Model.Stock>()}
          />
        </div>
        <div className="flex-initial basis-px bg-gray-200" />
        <div className="flex-initial bg-slate-500 font-bold text-white text-sm p-2">
          재고 이력
        </div>
        <div className="flex-1 overflow-y-scroll">
          <Table.Default<StockEventType>
            data={item.data?.stockEvents}
            page={page}
            setPage={setPage}
            keySelector={(p) => p.id}
            columns={[
              {
                title: "구분",
                render: (_, record) => <div>{""}</div>,
              },
              {
                title: "입출고일시",
                render: (_, record) => (
                  <div>
                    {Util.formatIso8601ToLocalDateTime(record.createdAt)}
                  </div>
                ),
              },
              {
                title: "작업번호",
                render: (_, record) => <div>{""}</div>,
              },
              {
                title: "거래처",
                render: (_, record) => <div>{""}</div>,
              },
              ...Table.Preset.columnQuantity<StockEventType>(
                (_) => item.data?.stockInfo,
                (record) => record.change,
                {
                  prefix: "변동",
                }
              ),
            ]}
          />
        </div>
      </div>
    </Popup.Template.Property>
  );
}
