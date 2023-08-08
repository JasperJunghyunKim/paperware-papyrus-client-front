import {
  AccountedByBankAccountCreatedRequest,
  AccountedByCardCreatedRequest,
  AccountedByCashCreatedRequest,
  AccountedByOffsetCreatedRequest,
  AccountedBySecurityCreatedRequest,
} from "@/@shared/api";
import {
  AccountedType,
  Method,
  SecurityStatus,
  SecurityType,
  Subject,
} from "@/@shared/models/enum";
import { ApiHook, Util } from "@/common";
import * as R from "@/common/rules";
import { Button, FormControl } from "@/components";
import { Form, Input, Select, Switch } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import _ from "lodash";
import { Template } from "..";
import { TbCircleCheck } from "react-icons/tb";
import { SelectEndorsementType } from "@/components/formControl";
import { useEffect } from "react";
import { Accounted } from "@/@shared/models";

type RequestCommon = {
  companyRegistrationNumber: string;
  accountedMethod: Method;
  accountedDate: string;
  accountedSubject: Subject;
  memo: string;
};

type OpenType = number | "PAID" | "COLLECTED";

interface Props {
  open: OpenType | false;
  onClose: (unit: false) => void;
}
export default function Component(props: Props) {
  const data = ApiHook.Setting.Accounted.useGetItem(
    _.isNumber(props.open) ? props.open : undefined
  );

  const [form] = useForm<RequestCommon>();
  const commonData = useWatch<RequestCommon | undefined>([], form);

  const isCreate = props.open === "PAID" || props.open === "COLLECTED";
  const type =
    props.open === "PAID" || data.data?.accountedType === "PAID"
      ? "PAID"
      : "COLLECTED";
  const wordDirection = type === "PAID" ? "지급" : "수금";

  const valid =
    commonData &&
    commonData.accountedMethod &&
    commonData.accountedDate &&
    commonData.accountedSubject;

  useEffect(() => {
    if (data.data) {
      form.setFieldsValue({
        companyRegistrationNumber: data.data.companyRegistrationNumber,
        accountedMethod: data.data.accountedMethod,
        accountedDate: data.data.accountedDate,
        accountedSubject: data.data.accountedSubject,
        memo: data.data.memo,
      });
    }
  }, [data.data, form]);

  return (
    <Template.Property
      open={!!props.open}
      onClose={props.onClose}
      title={`${isCreate ? "등록" : "상세"}`}
    >
      <div className="w-full flex flex-col p-4 pb-16">
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
            label="계정과목"
            name="accountedSubject"
            rules={[R.required()]}
          >
            <Select
              options={[
                {
                  value: "ACCOUNTS_RECEIVABLE",
                  label: type === "PAID" ? "외상 매출금" : "외상 매입금",
                },
                {
                  value: "UNPAID",
                  label: type === "PAID" ? "미수급" : "미지급금",
                },
                {
                  value: "ADVANCES",
                  label: type === "PAID" ? "선수금" : "선지급금",
                },
                {
                  value: "MISCELLANEOUS_INCOME",
                  label: type === "PAID" ? "잡이익" : "잡손실",
                },
                {
                  value: "PRODUCT_SALES",
                  label: type === "PAID" ? "상품매출" : "상품매입",
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
            {commonData?.accountedMethod === "ACCOUNT_TRANSFER" && (
              <FormByBankAccount
                type={type}
                initialData={data.data}
                commonData={commonData}
                onClose={props.onClose}
              />
            )}
            {commonData?.accountedMethod === "CASH" && (
              <FormByCash
                type={type}
                initialData={data.data}
                commonData={commonData}
                onClose={props.onClose}
              />
            )}
            {commonData?.accountedMethod === "PROMISSORY_NOTE" && (
              <FormBySecurity
                type={type}
                initialData={data.data}
                commonData={commonData}
                onClose={props.onClose}
              />
            )}
            {commonData?.accountedMethod === "OFFSET" && (
              <FormByOffset
                initialData={data.data}
                commonData={commonData}
                onClose={props.onClose}
              />
            )}
            {commonData?.accountedMethod === "CARD_PAYMENT" && (
              <FormByCard
                type={type}
                initialData={data.data}
                commonData={commonData}
                onClose={props.onClose}
              />
            )}
            {commonData?.accountedMethod === "ETC" && (
              <FormByEtc
                type={type}
                initialData={data.data}
                commonData={commonData}
                onClose={props.onClose}
              />
            )}
          </>
        )}
      </div>
    </Template.Property>
  );
}

function FormByBankAccount(props: {
  initialData?: Accounted;
  type: AccountedType;
  commonData: RequestCommon;
  onClose: (unit: false) => void;
}) {
  type Request = AccountedByBankAccountCreatedRequest;
  const [form] = useForm<Request>();

  const apiCreate = ApiHook.Setting.Accounted.useCreateByBankAccount();
  const apiUpdate = ApiHook.Setting.Accounted.useUpdateByBankAccount();
  const apiUpsert = props.initialData ? apiUpdate : apiCreate;

  const cmdUpsert = async () => {
    const data = await form.validateFields();
    const req: Request = {
      ...props.commonData,
      ...data,
      accountedType: props.type,
    };
    await apiUpsert.mutateAsync({
      data: req,
      path: { id: props.initialData?.id },
    });

    if (!props.initialData) {
      props.onClose(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="계좌 선택" name="bankAccountId" rules={[R.required()]}>
        <FormControl.SelectBankAccount />
      </Form.Item>
      <Form.Item label="수금금액" name="amount" rules={[R.required()]}>
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <div className="flex-initial flex gap-x-2 mt-4">
        <Button.Default
          icon={<TbCircleCheck />}
          label="확인"
          onClick={cmdUpsert}
          type="primary"
        />
      </div>
    </Form>
  );
}

function FormByCash(props: {
  initialData?: Accounted;
  type: AccountedType;
  commonData: RequestCommon;
  onClose: (unit: false) => void;
}) {
  type Request = AccountedByCashCreatedRequest;
  const [form] = useForm<Request>();

  const apiCreate = ApiHook.Setting.Accounted.useCreateByCash();
  const apiUpdate = ApiHook.Setting.Accounted.useUpdateByCash();
  const apiUpsert = props.initialData ? apiUpdate : apiCreate;

  const cmdUpsert = async () => {
    const data = await form.validateFields();
    const req: Request = {
      ...props.commonData,
      ...data,
      accountedType: props.type,
    };
    await apiUpsert.mutateAsync({
      data: req,
      path: { id: props.initialData?.id },
    });

    if (!props.initialData) {
      props.onClose(false);
    }
  };

  useEffect(() => {
    if (props.initialData) {
      form.setFieldsValue({
        amount: props.initialData.byCash?.amount,
      });
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="수금금액" name="amount" rules={[R.required()]}>
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <div className="flex-initial flex gap-x-2 mt-4">
        <Button.Default
          icon={<TbCircleCheck />}
          label="확인"
          onClick={cmdUpsert}
          type="primary"
        />
      </div>
    </Form>
  );
}

function FormBySecurity(props: {
  initialData?: Accounted;
  type: AccountedType;
  commonData: RequestCommon;
  onClose: (unit: false) => void;
}) {
  type Request = AccountedBySecurityCreatedRequest;
  const [form] = useForm<Request>();

  const apiCreate = ApiHook.Setting.Accounted.useCreateBySecurity();
  const apiUpdate = ApiHook.Setting.Accounted.useUpdateBySecurity();
  const apiUpsert = props.initialData ? apiUpdate : apiCreate;

  const cmdUpsert = async () => {
    const data = await form.validateFields();
    const req: Request = {
      ...props.commonData,
      ...data,
      accountedType: props.type,
    };
    await apiUpsert.mutateAsync({
      data: req,
      path: { id: props.initialData?.id },
    });

    if (!props.initialData) {
      props.onClose(false);
    }
  };

  useEffect(() => {
    if (props.initialData?.bySecurity?.security) {
      form.setFieldsValue({
        security: {
          securityAmount: props.initialData.bySecurity.security.securityAmount,
          securitySerial: props.initialData.bySecurity.security.securitySerial,
          securityType: props.initialData.bySecurity.security.securityType,
          drawedDate:
            props.initialData.bySecurity.security.drawedDate ?? undefined,
          drawedBank:
            props.initialData.bySecurity.security.drawedBank ?? undefined,
          drawedBankBranch:
            props.initialData.bySecurity.security.drawedBankBranch ?? undefined,
          drawedRegion:
            props.initialData.bySecurity.security.drawedRegion ?? undefined,
          drawer: props.initialData.bySecurity.security.drawer ?? undefined,
          maturedDate:
            props.initialData.bySecurity.security.maturedDate ?? undefined,
          payingBank:
            props.initialData.bySecurity.security.payingBank ?? undefined,
          payingBankBranch:
            props.initialData.bySecurity.security.payingBankBranch ?? undefined,
          payer: props.initialData.bySecurity.security.payer ?? undefined,
        },
      });
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="수금금액" name="amount" rules={[R.required()]}>
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <Form.Item
        label="배서 구분"
        name="endorsementType"
        rules={[R.required()]}
      >
        <SelectEndorsementType />
      </Form.Item>
      <Form.Item label="배서자" name="endorsement" rules={[R.required()]}>
        <Input />
      </Form.Item>
      {/* 유가증권 */}
      <Form.Item
        label="유가증권 유형"
        name="securityType"
        rules={[R.required()]}
      >
        <Select
          options={Array.from<SecurityType>([
            "PROMISSORY_NOTE",
            "ELECTRONIC_NOTE",
            "ELECTRONIC_BOND",
            "PERSONAL_CHECK",
            "DEMAND_DRAFT",
            "HOUSEHOLD_CHECK",
            "STATIONERY_NOTE",
            "ETC",
          ]).map((item) => ({
            label: Util.securityTypeToString(item),
            value: item,
          }))}
          disabled={!!props.initialData}
        />
      </Form.Item>
      <Form.Item
        label="유가증권 번호"
        name="securitySerial"
        rules={[R.required()]}
      >
        <Input disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item
        label="유가증권금액"
        name="securityAmount"
        rules={[R.required()]}
      >
        <FormControl.Number disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="발행일" name="drawedDate">
        <FormControl.DatePicker disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="발행은행" name="drawedBank">
        <FormControl.SelectBank disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="발행 지점명" name="drawedBankBranch">
        <Input disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="발행지" name="drawedRegion">
        <Input disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="발행인" name="drawer">
        <Input disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="만기일" name="maturedDate">
        <FormControl.DatePicker disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="지급은행" name="payingBank">
        <FormControl.SelectBank disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="지급지점명" name="payingBankBranch">
        <Input disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="지급인" name="payer">
        <Input disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="메모" name="memo">
        <Input.TextArea rows={2} disabled={!!props.initialData} />
      </Form.Item>
      <div className="flex-initial flex gap-x-2 mt-4">
        <Button.Default
          icon={<TbCircleCheck />}
          label="확인"
          onClick={cmdUpsert}
          type="primary"
        />
      </div>
    </Form>
  );
}

function FormByCard(props: {
  initialData?: Accounted;
  type: AccountedType;
  commonData: RequestCommon;
  onClose: (unit: false) => void;
}) {
  type Request = AccountedByCardCreatedRequest;
  const [form] = useForm<Request>();

  const apiCreate = ApiHook.Setting.Accounted.useCreateByCard();
  const apiUpdate = ApiHook.Setting.Accounted.useUpdateByCard();
  const apiUpsert = props.initialData ? apiUpdate : apiCreate;

  const cmdUpsert = async () => {
    const data = await form.validateFields();
    const req: Request = {
      ...props.commonData,
      ...data,
      accountedType: props.type,
    };
    await apiUpsert.mutateAsync({
      data: req,
      path: { id: props.initialData?.id },
    });

    if (!props.initialData) {
      props.onClose(false);
    }
  };

  useEffect(() => {
    if (props.initialData?.byCard) {
      form.setFieldsValue({
        cardId: props.initialData.byCard.card?.id,
        cardAmount: props.initialData.byCard.amount,
        bankAccountId: props.initialData.byCard.bankAccount?.id,
      });
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="카드 선택" name="cardId" rules={[R.required()]}>
        <FormControl.SelectCard />
      </Form.Item>
      <Form.Item label="계좌 선택" name="bankAccountId" rules={[R.required()]}>
        <FormControl.SelectBankAccount />
      </Form.Item>
      <Form.Item label="카드입금금액" name="cardAmount" rules={[R.required()]}>
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <Form.Item label="입금수수료" name="vatPrice" rules={[R.required()]}>
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <Form.Item
        label="수수료 수금 포함"
        name="isCharge"
        valuePropName="checked"
        initialValue={false}
      >
        <Switch />
      </Form.Item>
      <Form.Item label="승인번호" name="approvalNumber" rules={[R.required()]}>
        <Input />
      </Form.Item>
      <div className="flex-initial flex gap-x-2 mt-4">
        <Button.Default
          icon={<TbCircleCheck />}
          label="확인"
          onClick={cmdUpsert}
          type="primary"
        />
      </div>
    </Form>
  );
}

function FormByOffset(props: {
  initialData?: Accounted;
  commonData: RequestCommon;
  onClose: (unit: false) => void;
}) {
  type Request = AccountedByOffsetCreatedRequest;
  const [form] = useForm<Request>();

  const apiCreate = ApiHook.Setting.Accounted.useCreateByOffset();
  const apiUpdate = ApiHook.Setting.Accounted.useUpdateByOffset();
  const apiUpsert = props.initialData ? apiUpdate : apiCreate;

  const cmdUpsert = async () => {
    const data = await form.validateFields();
    const req: Request = {
      ...props.commonData,
      ...data,
    };
    await apiUpsert.mutateAsync({
      data: req,
      path: { id: props.initialData?.id },
    });

    if (!props.initialData) {
      props.onClose(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="수금금액" name="amount" rules={[R.required()]}>
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <div className="flex-initial flex gap-x-2 mt-4">
        <Button.Default
          icon={<TbCircleCheck />}
          label="확인"
          onClick={cmdUpsert}
          type="primary"
        />
      </div>
    </Form>
  );
}

function FormByEtc(props: {
  id?: number;
  initialData?: Accounted;
  type: AccountedType;
  commonData: RequestCommon;
  onClose: (unit: false) => void;
}) {
  type Request = AccountedByCashCreatedRequest;
  const [form] = useForm<Request>();

  const apiCreate = ApiHook.Setting.Accounted.useCreateByEtc();
  const apiUpdate = ApiHook.Setting.Accounted.useUpdateByEtc();
  const apiUpsert = props.id ? apiUpdate : apiCreate;

  const cmdUpsert = async () => {
    const data = await form.validateFields();
    const req: Request = {
      ...props.commonData,
      ...data,
      accountedType: props.type,
    };
    await apiUpsert.mutateAsync({
      data: req,
      path: { id: props.id },
    });

    if (!props.id) {
      props.onClose(false);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="수금금액" name="amount" rules={[R.required()]}>
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <div className="flex-initial flex gap-x-2 mt-4">
        <Button.Default
          icon={<TbCircleCheck />}
          label="확인"
          onClick={cmdUpsert}
          type="primary"
        />
      </div>
    </Form>
  );
}
