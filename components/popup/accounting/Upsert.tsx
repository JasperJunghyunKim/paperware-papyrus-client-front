import {
  ByBankAccountCreateRequest,
  ByBankAccountUpdateRequest,
} from "@/@shared/api";
import { Method, Subject } from "@/@shared/models/enum";
import { ApiHook } from "@/common";
import * as R from "@/common/rules";
import { FormControl } from "@/components";
import { Form, Input, Select } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { Template } from "..";

type RequestCommon = {
  companyRegistrationNumber: string;
  accountedMethod: Method;
  accountedDate: string;
  accountedSubject: Subject;
  amount: number;
  memo: string;
};

interface Props {
  open: number | "paid" | "collected" | false;
  onClose: (unit: false) => void;
}
export default function Component(props: Props) {
  const data = ApiHook.Accounted.Unpaid.useGetList({
    query: {},
  });

  const [form] = useForm<RequestCommon>();
  const commonData = useWatch<RequestCommon | undefined>([], form);

  const isCreate = props.open === "paid" || props.open === "collected";
  const type = isCreate ? props.open : "update";
  const wordTrade = "매출";
  const wordDirection = type === "paid" ? "지급" : "수금";

  const valid =
    commonData &&
    commonData.accountedMethod &&
    commonData.accountedDate &&
    commonData.accountedSubject &&
    commonData.amount;

  return (
    <Template.Property
      open={!!props.open}
      onClose={props.onClose}
      title={`${isCreate ? "등록" : "상세"}`}
    >
      <div className="w-full flex flex-col overflow-y-scroll p-4 pb-16">
        <FormControl.Util.Split label="기본 정보" />
        <Form form={form} layout="vertical">
          <Form.Item
            label="거래처"
            name="companyRegistrationNumber"
            rules={[R.required()]}
          >
            <FormControl.SelectCompanyRegistrationNumber />
          </Form.Item>
          <Form.Item
            label={`${wordDirection}수단`}
            name="accountedMethod"
            rules={[R.required()]}
          >
            <Select
              options={[
                {
                  value: "ACCOUNT_TRANSFER",
                  label: "계좌 이체",
                },
                {
                  value: "PROMISSORY_NOTE",
                  label: "어음",
                },
                {
                  value: "CARD_PAYMENT",
                  label: "카드 결제",
                },
                {
                  value: "CASH",
                  label: "현금",
                },
                {
                  value: "OFFSET",
                  label: "상계",
                },
                { value: "ETC", label: "기타" },
                { value: "ALL", label: "전체" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={`${wordDirection}일`}
            name="accountedDate"
            rules={[R.required()]}
          >
            <FormControl.DatePicker />
          </Form.Item>
          <Form.Item
            label={`${wordDirection}금액`}
            name="amount"
            rules={[R.required()]}
          >
            <FormControl.Number precision={0} min={0} unit="원" />
          </Form.Item>
          <Form.Item
            label="계정과목"
            name="accountedSubject"
            rules={[R.required()]}
          >
            <Select
              options={[
                {
                  value: "ACCOUNTS_RECEIVABLE",
                  label: type === "paid" ? "외상 매출금" : "외상 매입금",
                },
                {
                  value: "UNPAID",
                  label: type === "paid" ? "미수급" : "미지급금",
                },
                {
                  value: "ADVANCES",
                  label: type === "paid" ? "선수금" : "선지급금",
                },
                {
                  value: "MISCELLANEOUS_INCOME",
                  label: type === "paid" ? "잡이익" : "잡손실",
                },
                {
                  value: "PRODUCT_SALES",
                  label: type === "paid" ? "상품매출" : "상품매입",
                },
                { value: "ETC", label: "기타" },
                { value: "ALL", label: "전체" },
              ]}
            />
          </Form.Item>
          <Form.Item label="비고" name="memo">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
        {valid && (
          <>
            <FormControl.Util.Split label="상세 정보" />
            {commonData?.accountedMethod === "ACCOUNT_TRANSFER" && (
              <FormByBankAccount commonData={commonData} />
            )}
          </>
        )}
      </div>
    </Template.Property>
  );
}

function FormByBankAccount(props: { commonData: RequestCommon }) {
  type Request = ByBankAccountCreateRequest | ByBankAccountUpdateRequest;
  const [form] = useForm<Request>();

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="계좌 선택" name="bankAccountId" rules={[R.required()]}>
        <Select options={[]} />
      </Form.Item>
    </Form>
  );
}
