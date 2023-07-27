import { Model } from "@/@shared";
import { ApiHook, PaperUtil, Util } from "@/common";
import { Popup, Toolbar } from "@/components";
import dayjs from "dayjs";
import React, { ForwardedRef, useMemo, useRef } from "react";
import Barcode from "react-barcode";
import { TbPrinter } from "react-icons/tb";
import { useReactToPrint } from "react-to-print";

export type OpenType = number | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const item = ApiHook.Shipping.Invoice.useGetItem({
    id: props.open ? props.open : null,
  });

  const docRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => docRef.current,
  });

  return (
    <Popup.Template.Property
      title="운송장 출력"
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
          {item.data && <Document ref={docRef} data={item.data} />}
        </div>
      </div>
    </Popup.Template.Property>
  );
}

const Document = React.forwardRef(
  (props: { data: Model.Invoice }, ref: ForwardedRef<null>) => {
    return (
      <>
        <div
          className="flex-[0_0_297mm] w-[210mm] h-[297mm] p-[12mm] bg-white"
          ref={ref}
        >
          <div className="flex flex-col w-full h-full gap-y-[5mm]">
            <DocumentPart data={props.data} type="top" />
            <div className="flex-initial basis-px bg-black" />
            <DocumentPart data={props.data} type="bottom" />
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
Document.displayName = "Document";

interface DocumentPartProps {
  type: "top" | "bottom";
  data: Model.Invoice;
}
function DocumentPart(props: DocumentPartProps) {
  const order = useMemo(() => {
    return (
      props.data.plan.orderStock?.order ??
      props.data.plan.orderProcess?.order ??
      null
    );
  }, [props.data]);

  const orderNo = useMemo(() => {
    return order?.orderNo ?? "";
  }, [order]);

  const location = useMemo(() => {
    return (
      props.data.plan.orderStock?.dstLocation ??
      (props.data.plan.type === "TRADE_OUTSOURCE_PROCESS_BUYER"
        ? props.data.plan.orderProcess?.dstLocation ?? null
        : props.data.plan.orderProcess?.srcLocation ?? null)
    );
  }, [props.data]);

  const partners = ApiHook.Inhouse.Partner.useGetList({ query: {} });
  const partner = partners.data?.items.find(
    (p) =>
      p.companyRegistrationNumber ===
      order?.srcCompany.companyRegistrationNumber
  );

  const quantity = React.useMemo(() => {
    const quantity = PaperUtil.convertQuantity(props.data, props.data.quantity);

    return quantity;
  }, [props.data]);

  return (
    <div className="flex-1 h-0 flex flex-col">
      <div className="flex-initial flex mb-4">
        <div className="flex-1 w-0" />
        <div className="flex-1 w-0 text-3xl font-bold text-center">
          {props.type === "top" ? "인수증" : "납품증"}
        </div>
        <div className="flex-1 w-0 flex flex-col font-fixed text-right">
          <div className="flex-initial flex-nowrap whitespace-nowrap overflow-visible">{`송장번호: ${Util.formatSerial(
            props.data.invoiceNo
          )}`}</div>
          <div className="flex-initial flex-nowrap whitespace-nowrap overflow-visible">{`거래번호: ${Util.formatSerial(
            orderNo
          )}`}</div>
          <div className="flex-initial whitespace-pre">
            {Util.padRightCJK(
              `납품회사: ${order?.dstCompany.businessName}`,
              28
            )}
          </div>
        </div>
      </div>
      <div className="flex-initial flex text-base gap-x-[10mm] mb-[5mm]">
        <div className="flex-1 w-0 flex flex-col">
          <div className="flex-initial font-bold mb-1">발주처</div>
          <div className="flex-initial">{order?.srcCompany.businessName}</div>
          <div className="flex-initial">
            {Util.formatPhoneNo(order?.srcCompany.phoneNo)}
          </div>
          <div className="flex-initial flex-wrap">
            {Util.formatAddress(order?.srcCompany.address)}
          </div>
        </div>
        <div className="flex-1 w-0 flex flex-col">
          <div className="flex-initial font-bold mb-1">입고처</div>
          <div className="flex-initial">{location?.name}</div>
          <div className="flex-initial">
            {Util.formatPhoneNo(location?.phoneNo)}
          </div>
          <div className="flex-initial flex-wrap">
            {Util.formatAddress(location?.address)}
          </div>
        </div>
      </div>
      <div className="flex-initial">
        <table className="w-full text-base">
          <tr>
            <td>품목명</td>
            <td>{`${props.data.packaging.type} ${
              props.data.product.paperType.name
            } ${props.data.grammage}${Util.UNIT_GPM} ${props.data.sizeX
              .toString()
              .padStart(4, "0")}*${props.data.sizeY
              .toString()
              .padStart(4, "0")}`}</td>
          </tr>
          <tr>
            <td>수량</td>
            <td>
              {props.data.packaging.type === "ROLL"
                ? `${Util.comma(Util.gramsToTon(quantity.grams), 3)} T`
                : `${
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
            </td>
          </tr>
          <tr>
            <td>비고</td>
            <td>{`${order?.memo}`}</td>
          </tr>
        </table>
      </div>
      <div className="flex-1" />
      <div className="flex-initial flex text-base">
        <div className="flex-1 w-0 flex flex-col justify-end">
          <div className="flex-initial">
            {dayjs().locale("ko").format("YYYY년 MM월 DD일")}
          </div>
          <div className="flex-initial">
            {props.type === "top"
              ? "상기 물품을 정히 인수함"
              : "상기 물품을 정히 납품함"}
          </div>
          {props.type === "top" ? (
            <div className="flex-initial">인수자 :</div>
          ) : (
            <div className="flex-initial">{`
            ${order?.dstCompany.businessName} ${Util.formatPhoneNo(
              order?.dstCompany.phoneNo
            )}`}</div>
          )}
        </div>
        <div className="flex-initial basis-[50mm] w-0 flex flex-col justify-end gap-y-[2mm]">
          <div className="flex-initial flex flex-col justify-center border border-solid border-black p-[5mm] text-center font-fixed text-xl">
            -- LOGO --
          </div>
          <div className="flex-initial basis-[10mm] flex justify-end">
            <Barcode
              value={Util.formatSerial(props.data.invoiceNo).replace(/-/g, " ")}
              format="CODE128"
              margin={0}
              displayValue={false}
              width={1}
              height={50}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        table {
          border: 0.5mm solid black;
          border-collapse: collapse;
        }
        tr,
        td {
          border: 0.5mm solid black;
        }

        table,
        tr,
        td {
          padding: 2mm;
        }
      `}</style>
    </div>
  );
}
