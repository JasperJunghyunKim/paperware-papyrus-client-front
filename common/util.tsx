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

export function formatOfficialPriceType(
  type: Model.Enum.OfficialPriceType | null | undefined
) {
  switch (type) {
    case "NONE":
      return "고시가 미지정";
    case "MANUAL_NONE":
      return "직접 입력";
    case "RETAIL":
      return "실가";
    case "WHOLESALE":
      return "도매";
    default:
      return "";
  }
}

export function formatDiscountType(
  type: Model.Enum.DiscountType | null | undefined
) {
  switch (type) {
    case "NONE":
      return "단가 지정";
    case "DEFAULT":
      return "기본";
    case "MANUAL_NONE":
      return "할인율 지정";
    case "SPECIAL":
      return "특가";
    default:
      return "";
  }
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

export function formatPriceUnit(priceUnit: Model.Enum.PriceUnit) {
  switch (priceUnit) {
    case "WON_PER_TON":
      return "원/T";
    case "WON_PER_BOX":
      return "원/BOX";
    case "WON_PER_REAM":
      return "원/R";
  }
}

export function formatPackagingPriceUnit(
  packagingType: Model.Enum.PackagingType
) {
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
      return "상차 대기";
    case "WAIT_SHIPPING":
      return "상차 완료";
    case "ON_SHIPPING":
      return "배송중";
    case "DONE_SHIPPING":
      return "배송 완료";
    case "CANCELLED":
      return "취소";
  }
}

export function orderTypeToString(
  value: Enum.OrderType,
  depositEvent: boolean,
  type: "PURCHASE" | "SALES"
) {
  return match({ value, depositEvent, type })
    .with(
      { value: "NORMAL", depositEvent: false, type: "PURCHASE" },
      () => "정상 매입"
    )
    .with(
      { value: "NORMAL", depositEvent: true, type: "PURCHASE" },
      () => "보관 입고"
    )
    .with(
      { value: "NORMAL", depositEvent: false, type: "SALES" },
      () => "정상 매출"
    )
    .with(
      { value: "NORMAL", depositEvent: true, type: "SALES" },
      () => "보관 출고"
    )
    .with({ value: "DEPOSIT", type: "PURCHASE" }, () => "매입 보관")
    .with({ value: "DEPOSIT", type: "SALES" }, () => "매출 보관")
    .with(
      { value: "OUTSOURCE_PROCESS", type: "PURCHASE" },
      () => "외주 공정 매입"
    )
    .with({ value: "OUTSOURCE_PROCESS", type: "SALES" }, () => "외주 공정 매출")
    .with({ value: "ETC", type: "PURCHASE" }, () => "기타 매입")
    .with({ value: "ETC", type: "SALES" }, () => "기타 매출")
    .with({ value: "RETURN", type: "PURCHASE" }, () => "매입 반품")
    .with({ value: "RETURN", type: "SALES" }, () => "매출 반품")
    .with({ value: "REFUND", type: "PURCHASE" }, () => "매입 환불")
    .with({ value: "REFUND", type: "SALES" }, () => "매출 환불")
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

export function formatIso8601ToLocalDateTime(date: string | null) {
  return !date
    ? ""
    : dayjs(date).locale("ko").format("YYYY-MM-DD (ddd) HH:mm:ss");
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
      return "주문 확정";
    case "CANCELLED":
      return "주문 취소";
  }
}

export function taxInvoiceStatusToString(value: Model.Enum.TaxInvoiceStatus) {
  return match(value)
    .with("PREPARING", () => "작성중")
    .with("ON_ISSUE", () => "발행중")
    .with("ISSUED", () => "발행완료")
    .with("ISSUE_FAILED", () => "발행실패")
    .with("ON_SEND", () => "전송중")
    .with("SENDED", () => "전송완료")
    .with("SEND_FAILED", () => "전송실패")
    .otherwise(() => "");
}

export function taxInvoicePurposeTypeToString(
  value: Model.Enum.TaxInvoicePurposeType
) {
  return match(value)
    .with("CHARGE", () => "청구")
    .with("RECEIPT", () => "영수")
    .otherwise(() => "");
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

export function formatSerial(serial: string | null): string {
  if (serial === null) return "";
  if (serial?.length !== 15) {
    return serial;
  }
  const header = serial[0];
  return header === "P"
    ? `P-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : header === "T"
    ? `T-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : header === "I"
    ? `I-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : header === "W"
    ? `W-${serial.slice(1, 5)}-${serial.slice(5, 10)}-${serial.slice(10, 15)}`
    : header === "Q"
    ? `Q-${serial.slice(1, 5)}-${serial.slice(5, 9)}-${serial.slice(9, 15)}`
    : header === "S"
    ? `S-${serial.slice(1, 5)}-${serial.slice(5, 9)}-${serial.slice(9, 15)}`
    : `${serial}`;
}

export function formatSerialNo(serial: string): string {
  return serial.length >= 5
    ? `${serial.slice(0, 5)}-${serial.slice(5)}`
    : serial;
}

export const mine =
  (x: { companyId: number } | undefined | null) =>
  (y: { companyId: number } | undefined | null) => {
    return x && y && x?.companyId === y?.companyId;
  };

export const keyOfStockGroup = (record: {
  warehouse: { id: number } | null;
  product: { id: number };
  packaging: { id: number };
  grammage: number;
  sizeX: number;
  sizeY: number;
  paperColorGroup: { id: number } | null;
  paperColor: { id: number } | null;
  paperPattern: { id: number } | null;
  paperCert: { id: number } | null;
  plan: { id: number } | null;
}) => {
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
  return (
    order.orderStock ??
    order.orderProcess ??
    order.orderReturn
  )?.plan.find((p) => p.companyId === companyId);
}

export function assignStockFromOrder(order: Model.Order) {
  return (
    order.orderStock ??
    order.orderProcess ??
    order.orderDeposit ??
    order.orderReturn
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
    order.orderStock?.quantity ??
    order.orderProcess?.quantity ??
    order.orderDeposit?.quantity ??
    order.orderReturn?.quantity
  );
}

export function formatPlanType(value: Model.Enum.PlanType) {
  return match(value)
    .with("INHOUSE_CREATE", () => "신규 등록")
    .with("INHOUSE_MODIFY", () => "재고 수정")
    .with("INHOUSE_PROCESS", () => "내부 공정")
    .with("INHOUSE_RELOCATION", () => "재고 이고")
    .with("INHOUSE_STOCK_QUANTITY_CHANGE", () => "재고 증감")
    .with("TRADE_NORMAL_BUYER", () => "정상 매입")
    .with("TRADE_NORMAL_SELLER", () => "정상 매출")
    .with("TRADE_OUTSOURCE_PROCESS_BUYER", () => "외주 공정 매입")
    .with("TRADE_OUTSOURCE_PROCESS_SELLER", () => "외주 공정 매출")
    .with("TRADE_WITHDRAW_BUYER", () => "보관 입고")
    .with("TRADE_WITHDRAW_SELLER", () => "보관 출고")
    .with("RETURN_BUYER", () => "반품 매입")
    .with("RETURN_SELLER", () => "반품 매출")
    .otherwise(() => "");
}

export function emptyStringToUndefined(value: string | null | undefined) {
  return !value || value === "" ? undefined : value;
}

export async function sleep(seconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), seconds * 1000);
  });
}

export function flatQueries(query?: Object) {
  return query ? Object.entries(query).map((p) => `${p[0]}=${p[1]}`) : [];
}

export function bankToString(bank: Model.Enum.Bank | null | undefined) {
  return match(bank)
    .with("KAKAO_BANK", () => "카카오뱅크")
    .with("KOOKMIN_BANK", () => "국민은행")
    .with("KEB_HANA_BANK", () => "기업은행")
    .with("NH_BANK", () => "NH농협은행")
    .with("SHINHAN_BANK", () => "신한은행")
    .with("IBK", () => "산업은행")
    .with("WOORI_BANK", () => "우리은행")
    .with("CITI_BANK_KOREA", () => "한국씨티은행")
    .with("HANA_BANK", () => "하나은행")
    .with("SC_FIRST_BANK", () => "SC제일은행")
    .with("KYONGNAM_BANK", () => "경남은행")
    .with("KWANGJU_BANK", () => "광주은행")
    .with("DAEGU_BANK", () => "대구은행")
    .with("DEUTSCHE_BANK", () => "도이치은행")
    .with("BANK_OF_AMERICA", () => "뱅크오브아메리카")
    .with("BUSAN_BANK", () => "부산은행")
    .with("NACF", () => "산리조합중앙회")
    .with("SAVINGS_BANK", () => "저축은행")
    .with("NACCSF", () => "새마을금고")
    .with("SUHYUP_BANK", () => "수협은행")
    .with("NACUFOK", () => "신협중앙회")
    .with("POST_OFFICE", () => "우체국")
    .with("JEONBUK_BANK", () => "전북은행")
    .with("JEJU_BANK", () => "제주은행")
    .with("K_BANK", () => "케이뱅크")
    .with("TOS_BANK", () => "토스뱅크")
    .otherwise(() => "");
}

export function accountTypeToString(
  value: Model.Enum.AccountType | null | undefined
) {
  return match(value)
    .with("DEPOSIT", () => "보통 예금")
    .otherwise(() => "");
}

export function cardCompanyString(
  value: Model.Enum.CardCompany | null | undefined
) {
  return match(value)
    .with("BC_CARD", () => "BC카드")
    .with("KB_CARD", () => "KB국민카드")
    .with("SAMSUNG_CARD", () => "삼성카드")
    .with("SHINHAN_CARD", () => "신한카드")
    .with("WOORI_CARD", () => "우리카드")
    .with("HANA_CARD", () => "하나카드")
    .with("LOTTE_CARD", () => "롯데카드")
    .with("HYUNDAI_CARD", () => "현대카드")
    .with("NH_CARD", () => "NH농협카드")
    .otherwise(() => "");
}

export function securityTypeToString(
  value: Model.Enum.SecurityType | null | undefined
) {
  return match(value)
    .with("PROMISSORY_NOTE", () => "약속어음")
    .with("ELECTRONIC_NOTE", () => "전자어음")
    .with("ELECTRONIC_BOND", () => "전자채권")
    .with("PERSONAL_CHECK", () => "자기앞수표")
    .with("DEMAND_DRAFT", () => "당좌수표")
    .with("HOUSEHOLD_CHECK", () => "가계수표")
    .with("STATIONERY_NOTE", () => "문방구어음")
    .with("ETC", () => "기타")
    .otherwise(() => "");
}

export function securityStatusToString(
  value: Model.Enum.SecurityStatus | null | undefined
) {
  return match(value)
    .with("NONE", () => "기본")
    .with("NORMAL_PAYMENT", () => "정상 결제")
    .with("DISCOUNT_PAYMENT", () => "할인 결제")
    .with("INSOLVENCY", () => "부도")
    .with("LOST", () => "분실")
    .with("SAFEKEEPING", () => "보관")
    .otherwise(() => "");
}

export function accountSubjectToString(
  value: Subject | null | undefined,
  type: "COLLECTED" | "PAID"
) {
  return match({ value, type })
    .with(
      { value: "ACCOUNTS_RECEIVABLE", type: "COLLECTED" },
      () => "외상매출금"
    )
    .with({ value: "ACCOUNTS_RECEIVABLE", type: "PAID" }, () => "외상매입금")
    .with({ value: "UNPAID", type: "COLLECTED" }, () => "미수금")
    .with({ value: "UNPAID", type: "PAID" }, () => "미지급금")
    .with({ value: "ADVANCES", type: "COLLECTED" }, () => "선수금")
    .with({ value: "ADVANCES", type: "PAID" }, () => "선지급금")
    .with({ value: "MISCELLANEOUS_INCOME", type: "COLLECTED" }, () => "잡이익")
    .with({ value: "MISCELLANEOUS_INCOME", type: "PAID" }, () => "잡손실")
    .with({ value: "PRODUCT_SALES", type: "COLLECTED" }, () => "상품매출")
    .with({ value: "PRODUCT_SALES", type: "PAID" }, () => "상품매입")
    .with({ value: "ETC", type: "COLLECTED" }, () => "기타")
    .with({ value: "ETC", type: "PAID" }, () => "기타")
    .otherwise(() => "");
}

export function accountMethodToString(
  value: Model.Enum.Method | null | undefined,
  type: "COLLECTED" | "PAID"
) {
  return match({ value, type })
    .with({ value: "ACCOUNT_TRANSFER" }, () => "계좌 이체")
    .with({ value: "PROMISSORY_NOTE" }, () => "유가증권")
    .with({ value: "CARD_PAYMENT", type: "COLLECTED" }, () => "카드 입금")
    .with({ value: "CARD_PAYMENT", type: "PAID" }, () => "카드 결제")
    .with({ value: "CASH" }, () => "현금")
    .with({ value: "OFFSET" }, () => "상계")
    .with({ value: "ETC" }, () => "기타")
    .otherwise(() => "");
}

export function endorsementTypeToString(
  value: Model.Enum.EndorsementType | null | undefined
) {
  return match(value)
    .with("NONE", () => "선택안함")
    .with("SELF_NOTE", () => "자수")
    .with("OTHERS_NOTE", () => "타수")
    .otherwise(() => "");
}

export function orderHistoryTypeToString(
  value: Model.Enum.OrderHistoryType | null | undefined
) {
  return match(value)
    .with("CREATE", () => "최초 작성")
    .with("ACCEPT", () => "주문 확정")
    .with("PLAN_START", () => "작업 지시")
    .with("PLAN_CANCEL", () => "작업 취소")
    .with("ORDER_CANCEL", () => "주문 취소")
    .with("OFFER_REQUEST", () => "구매 제안")
    .with("OFFER_REQUEST_CANCEL", () => "구매 제안 취소")
    .with("OFFER_REQUEST_REJECT", () => "구매 제안 반려")
    .with("ORDER_REQUEST", () => "주문 접수")
    .with("ORDER_REQUEST_CANCEL", () => "주문 접수 취소")
    .with("ORDER_REQUEST_REJECT", () => "주문 접수 반려")
    .otherwise(() => "");
}
