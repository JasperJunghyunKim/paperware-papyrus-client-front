import { Model } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType, Subject } from "@/@shared/models/enum";
import { Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ko";
import _ from "lodash";
import { match } from "ts-pattern";

export type PromiseOrFn = (() => Promise<void>) | (() => any);
export async function call(p?: PromiseOrFn) {
  if (!p) {
    return;
  }

  const run = p();

  if (run instanceof Promise) {
    try {
      await run;
    } catch (err) {
      console.error(err);
    } finally {
      return;
    }
  }
}

export async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function only<T>(array: T[]): T | undefined {
  return array.length === 1 ? array[0] : undefined;
}

export async function confirm(message: string) {
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title: "확인",
      content: message,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

export async function warn(message: string) {
  return new Promise<void>((resolve) => {
    Modal.warn({
      title: "확인",
      content: message,
      onOk: () => resolve(),
    });
  });
}

export function comma(
  value: string | number | null | undefined,
  precision = 0
) {
  const num = Number(value);
  return typeof num === "number" && !isNaN(num) && !isFinite(num)
    ? ""
    : num.toLocaleString("ko-KR", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });
}

export function passString(value: string | null | undefined) {
  return value === null || value === undefined || value === "" ? null : value;
}

export interface Address {
  roadAddress: string;
  roadAddressEnglish: string;
  jibunAddress: string;
  jibunAddressEnglish: string;
  zonecode: string;
  detail: string;
}

export function encodeAddress(address: Partial<Address>) {
  return `[[${address.zonecode ?? ""}]] [[${address.roadAddress ?? ""}::${
    address.roadAddressEnglish ?? ""
  }]] [[${address.jibunAddress ?? ""}::${
    address.jibunAddressEnglish ?? ""
  }]] [[${address.detail ?? ""}]]`;
}

export function decodeAddress(address: string | null | undefined): Address {
  try {
    if (address === null || address === undefined || address === "") {
      throw new Error();
    }

    const [zonecode, roadAddress, jibunAddress, detail] = address
      .split("]]")
      .map((p) => p.trim().replace("[[", ""));

    const [roadAddressKorean, roadAddressEnglish] = roadAddress.split("::");
    const [jibunAddressKorean, jibunAddressEnglish] = jibunAddress.split("::");

    return {
      zonecode,
      roadAddress: roadAddressKorean,
      roadAddressEnglish,
      jibunAddress: jibunAddressKorean,
      jibunAddressEnglish,
      detail,
    };
  } catch {
    return {
      zonecode: "",
      roadAddress: "",
      roadAddressEnglish: "",
      jibunAddress: "",
      jibunAddressEnglish: "",
      detail: "",
    };
  }
}

export function formatAddress(address: string | Address | null | undefined) {
  if (address === null || address === undefined || address === "") {
    return "";
  }

  const decoded =
    typeof address === "string" ? decodeAddress(address) : address;

  if (
    decoded.roadAddress === "" &&
    decoded.jibunAddress === "" &&
    decoded.detail === ""
  ) {
    return "";
  }

  return `${passString(decoded.roadAddress) ?? decoded.jibunAddress} ${
    decoded.detail === "" ? "" : `(${decoded.detail})`
  }`;
}

export function formatPackaging(packaging: Model.Packaging, short?: boolean) {
  switch (packaging.type) {
    case "SKID":
      return ``;
    case "REAM":
      return short ? `${packaging.packA}매/속` : `${packaging.packA}매 (/속)`;
    case "BOX":
      return short
        ? `${packaging.packA}×${packaging.packB}속/BOX`
        : `${packaging.packA}매 × ${packaging.packB}포 (/BOX)`;
    case "ROLL":
      return short
        ? `${packaging.packA}${packaging.packB === 0 ? '"' : "cm"}`
        : `${packaging.packA} ${packaging.packB === 0 ? "inch" : "cm"}`;
  }
}

export function stockUnit(packagingType: Model.Enum.PackagingType): string {
  switch (packagingType) {
    case "ROLL":
      return "t";
    case "BOX":
      return "BOX";
    case "SKID":
    case "REAM":
      return "매";
  }
}

export function priceUnit(packagingType: Model.Enum.PackagingType): PriceUnit {
  switch (packagingType) {
    case "ROLL":
      return "wpt";
    case "BOX":
      return "wpb";
    case "SKID":
    case "REAM":
      return "wpr";
  }
}

export function formatPriceUnit(packagingType: Model.Enum.PackagingType) {
  switch (packagingType) {
    case "SKID":
      return "원/R";
    case "REAM":
      return "원/R";
    case "BOX":
      return "원/BOX";
    case "ROLL":
      return "원/T";
  }
}

export function formatInvoiceStatus(status: Model.Enum.InvoiceStatus) {
  switch (status) {
    case "WAIT_LOADING":
      return "출고 대기";
    case "WAIT_SHIPPING":
      return "상차 대기";
    case "ON_SHIPPING":
      return "상차 진행중";
    case "DONE_SHIPPING":
      return "상차 완료";
  }
}

export function orderTypeToString(
  value: Enum.OrderType,
  type: "PURCHASE" | "SALES"
) {
  return match({ value, type })
    .with({ value: "NORMAL", type: "PURCHASE" }, () => "정상 매입")
    .with({ value: "NORMAL", type: "SALES" }, () => "정상 매출")
    .with({ value: "DEPOSIT", type: "PURCHASE" }, () => "매입 보관")
    .with({ value: "DEPOSIT", type: "SALES" }, () => "매출 보관")
    .with(
      { value: "OUTSOURCE_PROCESS", type: "PURCHASE" },
      () => "외주 재단 매입"
    )
    .with({ value: "OUTSOURCE_PROCESS", type: "SALES" }, () => "외주 재단 매출")
    .with({ value: "ETC", type: "PURCHASE" }, () => "기타 매입")
    .with({ value: "ETC", type: "SALES" }, () => "기타 매출")
    .otherwise(() => "");
}

export const reamToSheets = (ream: number) => Math.round(ream * 500);
export const sheetsToReam = (sheets: number) => Math.round(sheets) / 500;
export type PriceUnit = "wpt" | "wpb" | "wpr";
export const toWeightPrice = (
  price: number,
  srcUnit: PriceUnit,
  dstUnit: PriceUnit,
  specs: {
    grammage: number;
    sizeX: number;
    sizeY: number;
    packaging: Model.Packaging;
  }
) => {
  const spb = specs.packaging.packA * specs.packaging.packB;

  const tpr =
    specs.grammage *
    specs.sizeX *
    (specs.sizeY ?? 0) *
    500 *
    0.000001 *
    0.001 *
    0.001;

  const tpb =
    specs.grammage *
    specs.sizeX *
    (specs.sizeY ?? 0) *
    spb *
    0.000001 *
    0.001 *
    0.001;

  const rpb = spb / 500;

  switch (srcUnit) {
    case "wpt":
      if (dstUnit == "wpr") {
        return price * tpr;
      } else if (dstUnit == "wpb") {
        return price * tpb;
      }
      break;
    case "wpb":
      if (dstUnit == "wpt") {
        return price / tpb;
      } else if (dstUnit == "wpr") {
        return price / rpb;
      }
      break;
    case "wpr":
      if (dstUnit == "wpt") {
        return price / tpr;
      } else if (dstUnit == "wpb") {
        return price / rpb;
      }
      break;
  }

  return price;
};

export function tonToGrams(ton: number) {
  return ton * 1000000;
}

export function gramsToTon(grams: number) {
  return grams / 1000000;
}

export function shippingStatusToString(status: Model.Enum.ShippingStatus) {
  switch (status) {
    case "PREPARING":
      return "배송 준비중";
    case "PROGRESSING":
      return "배송 중";
    case "DONE":
      return "배송 완료";
  }
}

export function formatIso8601ToLocalDate(date: string | null) {
  return !date ? "" : dayjs(date).locale("ko").format("YYYY-MM-DD (ddd)");
}

export function falsyToUndefined<T>(
  value: T | false | null | undefined
): T | undefined {
  if (value === false || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

export const UNIT_GPM = "g/m²";

export function iso8601ToDate(
  date: string | null | undefined
): Dayjs | undefined {
  if (!date) {
    return undefined;
  }

  return dayjs(date);
}

export function dateToIso8601(date: Dayjs | null | undefined) {
  if (date === null || date === undefined) {
    return undefined;
  }

  return date.toISOString();
}

export function inc<T extends string>(value: T, ...array: T[]): boolean {
  return array.includes(value);
}

export function taskTypeToString(value: Model.Enum.TaskType) {
  switch (value) {
    case "CONVERTING":
      return "컨버팅";
    case "GUILLOTINE":
      return "길로틴";
    case "RELEASE":
      return "출고 수량";
  }
}

export function taskStatusToString(value: Model.Enum.TaskStatus) {
  switch (value) {
    case "PREPARING":
      return "작업 대기중";
    case "PROGRESSING":
      return "작업 진행중";
    case "PROGRESSED":
      return "작업 완료";
  }
}

export function planStatusToString(value: Model.Enum.PlanStatus) {
  switch (value) {
    case "PREPARING":
      return "작업 대기중";
    case "PROGRESSING":
      return "작업 진행중";
    case "PROGRESSED":
      return "작업 완료";
  }
}

export function orderStatusToString(value: Model.Enum.OrderStatus) {
  switch (value) {
    case "ORDER_PREPARING":
      return "작성중";
    case "OFFER_PREPARING":
      return "작성중";
    case "ORDER_REQUESTED":
      return "주문 접수";
    case "OFFER_REQUESTED":
      return "구매 제안 요청";
    case "ORDER_REJECTED":
      return "주문 반려";
    case "OFFER_REJECTED":
      return "구매 제안 반려";
    case "ACCEPTED":
      return "승인";
  }
}

export function formatPhoneNo(phoneNo: string | null | undefined) {
  if (phoneNo === null || phoneNo === undefined) {
    return "";
  }

  return phoneNo.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
}

export function formatCompanyRegistrationNo(
  companyRegistrationNo: string | null | undefined
) {
  if (companyRegistrationNo === null || companyRegistrationNo === undefined) {
    return "";
  }

  return companyRegistrationNo.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
}

export interface PaperSize {
  sizeX: number;
  sizeY: number;
  name: string;
}
export const paperSizes: PaperSize[] = [
  {
    sizeX: 636,
    sizeY: 939,
    name: "국전",
  },
  {
    sizeX: 788,
    sizeY: 1091,
    name: "4X6",
  },
  {
    sizeX: 210,
    sizeY: 297,
    name: "A4",
  },
];

export function findPaperSize(sizeX: number, sizeY: number): PaperSize | null {
  return (
    paperSizes.find(
      (paperSize) => paperSize.sizeX === sizeX && paperSize.sizeY === sizeY
    ) ?? null
  );
}

export interface ConvertQuantityOutput {
  quantity: number;
  packedQuantity: number;
  weight: number;
}

export interface ConvertQuantityInput {
  grammage: number;
  sizeX: number;
  sizeY: number;
  quantity: number;
}

export function convertQuantity(
  input: ConvertQuantityInput
): ConvertQuantityOutput {
  const { grammage, sizeX, sizeY, quantity } = input;

  const spb = grammage * sizeX * sizeY * 0.000001 * 0.001 * 0.001;

  const tpb = grammage * sizeX * sizeY * spb * 0.000001 * 0.001 * 0.001;

  const rpb = spb / 500;

  const packedQuantity = quantity / rpb;

  const weight = tpb * quantity;

  return {
    quantity,
    packedQuantity,
    weight,
  };
}

export function accountedSubject(
  accountedType: AccountedType,
  subject: Subject
): string {
  if (accountedType === "PAID") {
    switch (subject) {
      case "ACCOUNTS_RECEIVABLE":
        return "외상 매입금";
      case "UNPAID":
        return "미지급금";
      case "ADVANCES":
        return "선지급금";
      case "MISCELLANEOUS_INCOME":
        return "잡손실";
      case "PRODUCT_SALES":
        return "상품 매입";
      case "ETC":
        return "기타";
      case "All":
        return "전체";
    }
  } else {
    switch (subject) {
      case "ACCOUNTS_RECEIVABLE":
        return "외상 매출금";
      case "UNPAID":
        return "미수금";
      case "ADVANCES":
        return "선수금";
      case "MISCELLANEOUS_INCOME":
        return "잡이익";
      case "PRODUCT_SALES":
        return "상품 매출";
      case "ETC":
        return "기타";
      case "All":
        return "전체";
    }
  }
}

export function endorsementTypeToString(
  value?: Model.Enum.SecurityStatus | number | string
) {
  switch (value) {
    case "NONE":
      return "선택안함";
    case "SELF_NOTE":
      return "자수";
    case "OTHERS_NOTE":
      return "타수";
    default:
      return "";
  }
}

export function bankAccountTypeToString(
  value?: Model.Enum.SecurityStatus | number | string
) {
  switch (value) {
    case "DEPOSIT":
      return "보통 예금";
    default:
      return "";
  }
}

export function securityStatusToSTring(
  value?: Model.Enum.SecurityStatus | number | string
) {
  switch (value) {
    case "NONE":
      return "기본";
    case "ENDORSED":
      return "배서 지급";
    case "NORMAL_PAYMENT":
      return "정상 결제";
    case "DISCOUNT_PAYMENT":
      return "할인 결제";
    case "INSOLVENCY":
      return "부도";
    case "LOST":
      return "분실";
    case "SAFEKEEPING":
      return "보관";
    default:
      return "";
  }
}

export function drawedStatusToSTring(
  value?: Model.Enum.DrawedStatus | number | string
) {
  switch (value) {
    case "SELF":
      return "자사 발행";
    case "ACCOUNTED":
      return "수금";
    default:
      return "";
  }
}

export function securityTypeToSTring(
  value?: Model.Enum.SecurityType | number | string
) {
  switch (value) {
    case "PROMISSORY_NOTE":
      return "약속 어음";
    case "ELECTRONIC_NOTE":
      return "전자 어음";
    case "ELECTRONIC_BOND":
      return "전자 채권";
    case "PERSONAL_CHECK":
      return "자기앞 수표";
    case "DEMAND_DRAFT":
      return "당좌 수표";
    case "HOUSEHOLD_CHECK":
      return "가계 수표";
    case "STATIONERY_NOTE":
      return "문방구 어음";
    case "ETC":
      return "기타";
    default:
      return "";
  }
}
export function nanToZero(value: number | null | undefined) {
  if (!_.isFinite(value)) {
    return 0;
  }

  return value;
}

export function padRightCJK(value: string, length: number) {
  const countCJKCharacters = (str: string): number => {
    const cjkRegex = /[\u3131-\uD79D]/gi;
    const matches = str.match(cjkRegex);
    return matches ? matches.length : 0;
  };

  const len = length - countCJKCharacters(value);
  return value.padEnd(len);
}

export function formatSerial(serial: string): string {
  const header = serial[0];
  return header === "P"
    ? `P-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : header === "T"
    ? `T-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : `${serial}`;
}

export const mine =
  (x: { companyId: number } | undefined | null) =>
  (y: { companyId: number } | undefined | null) => {
    return x && y && x?.companyId === y?.companyId;
  };

export const keyOfStockGroup = (record: Model.StockGroup) => {
  return `${record.product.id} ${record.sizeX} ${record.sizeY} ${
    record.grammage
  } ${record.packaging.id} ${record.paperColorGroup?.id ?? "_"} ${
    record.paperColor?.id ?? "_"
  } ${record.paperPattern?.id ?? "_"} ${record.paperCert?.id ?? "_"} ${
    record.warehouse?.id ?? "_"
  } ${record.plan?.id}`;
};

export function planFromOrder(
  order: Model.Order,
  companyId: number | null | undefined
) {
  return (order.orderStock ?? order.orderProcess)?.plan.find(
    (p) => p.companyId === companyId
  );
}

export function assignStockFromOrder(order: Model.Order) {
  return (
    (
      order.orderStock?.plan.find((p) => p.companyId === order.dstCompany.id) ??
      order.orderProcess?.plan.find(
        (p) => p.type === "TRADE_OUTSOURCE_PROCESS_BUYER"
      )
    )?.assignStockEvent?.stock ?? order.orderDeposit
  );
}

export function assignStockEventFromOrder(order: Model.Order) {
  return (
    order.orderStock?.plan.find((p) => p.companyId === order.dstCompany.id) ??
    order.orderProcess?.plan.find(
      (p) => p.type === "TRADE_OUTSOURCE_PROCESS_BUYER"
    )
  )?.assignStockEvent;
}

export function assignQuantityFromOrder(order: Model.Order) {
  return (
    (
      order.orderStock?.plan.find((p) => p.companyId === order.dstCompany.id) ??
      order.orderProcess?.plan.find(
        (p) => p.type === "TRADE_OUTSOURCE_PROCESS_BUYER"
      )
    )?.assignStockEvent.change ?? order.orderDeposit?.quantity
  );
}
