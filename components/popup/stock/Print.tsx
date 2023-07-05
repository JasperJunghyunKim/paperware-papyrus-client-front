import { Model } from "@/@shared";
import { ApiHook, PaperUtil, Util } from "@/common";
import { Popup, Toolbar } from "@/components";
import { QRCodeSVG } from "qrcode.react";
import React, { ForwardedRef } from "react";
import { useRef } from "react";
import Barcode from "react-barcode";
import { TbPrinter } from "react-icons/tb";
import { useReactToPrint } from "react-to-print";

export type OpenType = number | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const item = ApiHook.Stock.StockInhouse.useGetItem({
    id: props.open ? props.open : null,
  });

  const docRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => docRef.current,
  });

  return (
    <Popup.Template.Property
      title="재고 라벨 출력"
      width="calc(210mm + 100px)"
      height="calc(100vh - 80px)"
      {...props}
      open={!!props.open}
      hideScroll
    >
      <div className="flex-1 flex flex-col w-0">
        <div className="flex-initial flex flex-col m-3">
          <Toolbar.Container>
            <div className="flex-1" />
            <Toolbar.Button
              type="primary"
              icon={<TbPrinter />}
              label="인쇄"
              onClick={() => handlePrint()}
            />
          </Toolbar.Container>
        </div>
        <div className="flex-initial basis-px bg-gray-200" />
        <div className="flex-[1_0_0px] h-0 flex flex-col overflow-y-scroll items-center bg-slate-200">
          {item.data && <Document ref={docRef} stock={item.data} />}
        </div>
      </div>
    </Popup.Template.Property>
  );
}

const Document = React.forwardRef(
  (props: { stock: Model.Stock }, ref: ForwardedRef<null>) => {
    const quantity = React.useMemo(() => {
      const quantity = PaperUtil.convertQuantity(
        props.stock,
        props.stock.cachedQuantity
      );

      return quantity;
    }, [props.stock]);

    const serial = React.useMemo(() => {
      return Util.formatSerial(props.stock.serial).replace(/-/g, " ");
    }, [props.stock]);

    return (
      <>
        <div
          className="flex-[0_0_297mm] w-[210mm] h-[297mm] p-[10mm] bg-white"
          ref={ref}
        >
          <div className="flex flex-col w-full h-full border-[1mm] border-double border-black p-[10mm]">
            <div className="flex-initial basis-[30mm] flex justify-center items-center">
              <div className="flex-1">
                <QRCodeSVG
                  value={props.stock.serial}
                  className="w-[30mm] h-[30mm]"
                  includeMargin={false}
                />
              </div>
              <div className="flex-initial">
                <Barcode
                  value={props.stock.serial}
                  format="CODE128"
                  font="D2CodingFont"
                  margin={0}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-y-[2mm]">
              <div className="flex-initial font-fixed font-bold text-6xl text-center">
                {serial}
              </div>
              <div className="flex-initial basis-[4mm]" />
              <div className="flex-initial font-fixed font-bold text-3xl text-center">
                {`${props.stock.product.manufacturer.name} ${
                  props.stock.packaging.type
                } ${
                  props.stock.packaging.type === "SKID"
                    ? ""
                    : `(${Util.formatPackaging(props.stock.packaging, true)})`
                }`}
              </div>
              <div className="flex-initial font-fixed font-bold text-3xl text-center">
                {props.stock.product.paperType.name}
              </div>
              <div className="flex-initial font-fixed font-bold text-3xl text-center">
                {`${props.stock.grammage} ${Util.UNIT_GPM}`}
              </div>
              <div className="flex-initial font-fixed font-bold text-3xl text-center">
                {`${props.stock.sizeX
                  .toString()
                  .padStart(4, "0")} x ${props.stock.sizeY
                  .toString()
                  .padStart(4, "0")}`}
              </div>
            </div>
            <div className="flex-1 flex justify-center font-fixed font-bold whitespace-pre">
              <div className="flex-1 flex flex-col text-2xl justify-center gap-y-2">
                <div className="flex-initial font-fixed">
                  {`초기수량 : ${
                    quantity.packed
                      ? `${Util.comma(
                          quantity.packed.value,
                          PaperUtil.recommendedPrecision(quantity.packed.unit)
                        )} ${quantity.packed.unit}`
                      : ""
                  } ${
                    quantity.unpacked
                      ? `(${Util.comma(
                          quantity.unpacked.value,
                          PaperUtil.recommendedPrecision(quantity.unpacked.unit)
                        )} ${quantity.unpacked.unit})`
                      : ""
                  }`}
                </div>
                <div className="flex-initial font-fixed">{`중량     : ${Util.comma(
                  Util.gramsToTon(quantity.grams),
                  PaperUtil.recommendedPrecision("T")
                )} T`}</div>
                <div className="flex-initial font-fixed">
                  {`색상     : ${props.stock.paperColor?.name ?? ""}`}
                </div>
                <div className="flex-initial font-fixed">
                  {`무늬     : ${props.stock.paperPattern?.name ?? ""}`}
                </div>
                <div className="flex-initial font-fixed">
                  {`인증     : ${props.stock.paperCert?.name ?? ""}`}
                </div>
              </div>
              <div className="flex-[0_0_10mm] flex items-end text-3xl">
                <div className="-rotate-90 w-0 h-0">{serial}</div>
              </div>
            </div>
            <div className="flex-initial basis-[60mm] flex justify-center items-end">
              <div className="flex-1 text-2xl font-fixed">
                {`{이름}
                ${Util.formatPlanType(props.stock.initialPlan.type).replaceAll(
                  " ",
                  ""
                )} {작업번호양식}`}
              </div>
              <div className="flex-initial flex flex-col gap-y-4">
                <div className="flex-initial flex flex-col justify-center basis-[30mm] border border-solid border-black p-[5mm] text-center font-fixed text-xl">
                  -- LOGO --
                </div>
                <Barcode
                  value={props.stock.serial}
                  format="CODE128"
                  font="D2CodingFont"
                  width={1.2}
                  height={50}
                  displayValue={false}
                  margin={0}
                />
              </div>
            </div>
          </div>
        </div>
        <style>{`
        @media print {
          @page {
            size: 210mm 297mm;
          }
        }
      `}</style>
      </>
    );
  }
);
