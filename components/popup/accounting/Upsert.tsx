import {
  AccountedByBankAccountCreatedRequest,
  AccountedByCardCreatedRequest,
  AccountedByCashCreatedRequest,
  AccountedByOffsetCreatedRequest,
  AccountedBySecurityCreatedRequest,
} from "@/@shared/api";
import { Accounted } from "@/@shared/models";
import {
  AccountedType,
  Method,
  SecurityType,
  Subject,
} from "@/@shared/models/enum";
import { ApiHook, Util } from "@/common";
import * as R from "@/common/rules";
import { Button, FormControl } from "@/components";
import { SelectEndorsementType } from "@/components/formControl";
import { Alert, Form, Input, Select, Switch } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import _ from "lodash";
import { useEffect } from "react";
import { TbCircleCheck } from "react-icons/tb";
import { Template } from "..";
import { Model } from "@/@shared";
import dayjs from "dayjs";

type RequestCommon = {
  companyRegistrationNumber: string;
  accountedMethod: Method;
  accountedDate: string;
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
  const accountedMethod = useWatch<Method | undefined>("accountedMethod", form);
  const commonData = useWatch<RequestCommon | undefined>([], form);

  const isCreate = props.open === "PAID" || props.open === "COLLECTED";
  const type =
    props.open === "PAID" || data.data?.accountedType === "PAID"
      ? "PAID"
      : "COLLECTED";
  const wordDirection = type === "PAID" ? "지급" : "수금";

  const valid = commonData && commonData.accountedMethod;

  useEffect(() => {
    if (data.data && props.open) {
      form.setFieldsValue({
        companyRegistrationNumber: data.data.companyRegistrationNumber,
        accountedMethod: data.data.accountedMethod,
        accountedDate: data.data.accountedDate,
      });
    } else {
      form.resetFields();
    }
  }, [data.data, form, props.open]);

  return (
    <Template.Property
      open={!!props.open}
      onClose={props.onClose}
      title={`${isCreate ? "등록" : "상세"}`}
    >
      <div className="w-full flex flex-col p-4 pb-16">
        {accountedMethod === "PROMISSORY_NOTE" && (
          <Alert
            message={
              type === "COLLECTED"
                ? "수금된 유가증권은 유가증권 관리 메뉴에서도 조회할 수 있습니다."
                : "지급 내역을 삭제하여 유가증권 상태를 기본값으로 되돌릴 수 있습니다."
            }
            type="info"
            showIcon
          />
        )}
        {accountedMethod === "OFFSET" && (
          <Alert
            message="상계는 지급 내역에서도 동일하게 등록, 수정, 삭제됩니다."
            type="info"
            showIcon
          />
        )}
        <FormControl.Util.Split label="기본 정보" />
        <Form form={form} layout="vertical">
          <Form.Item
            label={`${wordDirection}수단`}
            name="accountedMethod"
            rules={[R.required()]}
          >
            <Select
              options={
                Array.from<Method>([
                  "ACCOUNT_TRANSFER",
                  "CASH",
                  "PROMISSORY_NOTE",
                  "OFFSET",
                  "CARD_PAYMENT",
                  "ETC",
                ]).map((item) => ({
                  label: Util.accountMethodToString(item, type),
                  value: item,
                })) ?? []
              }
              disabled={!isCreate}
            />
          </Form.Item>
          {valid && (
            <>
              <Form.Item
                label="거래처"
                name="companyRegistrationNumber"
                rules={[R.required()]}
              >
                <FormControl.SelectCompanyRegistrationNumber
                  disabled={!isCreate}
                />
              </Form.Item>
              <Form.Item
                label={`${wordDirection}일`}
                name="accountedDate"
                rules={[R.required()]}
                initialValue={Util.dateToIso8601(dayjs())}
              >
                <FormControl.DatePicker />
              </Form.Item>
            </>
          )}
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
                type={type}
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
        <Form form={form} layout="vertical"></Form>
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

  useEffect(() => {
    if (props.initialData?.byBankAccount) {
      form.setFieldsValue({
        bankAccountId: props.initialData.byBankAccount.bankAccount?.id,
        amount: props.initialData.byBankAccount.amount,
        accountedSubject: props.initialData.accountedSubject,
        memo: props.initialData.memo,
      });
    } else {
      form.resetFields();
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label={props.type === "COLLECTED" ? "수금금액" : "지급금액"}
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
        <SelectSubject type={props.type} />
      </Form.Item>
      <Form.Item label="계좌 선택" name="bankAccountId" rules={[R.required()]}>
        <FormControl.SelectBankAccount disabled={!!props.initialData} />
      </Form.Item>
      <Form.Item label="비고" name="memo">
        <Input.TextArea rows={2} />
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
        accountedSubject: props.initialData.accountedSubject,
        memo: props.initialData.memo,
      });
    } else {
      form.resetFields();
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label={props.type === "COLLECTED" ? "수금금액" : "지급금액"}
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
        <SelectSubject type={props.type} />
      </Form.Item>
      <Form.Item label="비고" name="memo">
        <Input.TextArea rows={2} />
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
      security: data.security,
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
        endorsementType:
          props.initialData.bySecurity.security.bySecurities.find(
            (p) => p.accounted.id === props.initialData?.id
          )?.endorsementType,
        endorsement: props.initialData.bySecurity.security.bySecurities.find(
          (p) => p.accounted.id === props.initialData?.id
        )?.endorsement,
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
          memo: props.initialData.bySecurity.security.memo ?? undefined,
        },
        accountedSubject: props.initialData.accountedSubject,
        memo: props.initialData.memo,
        securityId: props.initialData.bySecurity.security.id,
      });
    } else {
      form.resetFields();
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      {/* 유가증권 */}
      <Form.Item
        label="계정과목"
        name="accountedSubject"
        rules={[R.required()]}
      >
        <SelectSubject type={props.type} />
      </Form.Item>
      <Form.Item
        label="유가증권 유형"
        name={["security", "securityType"]}
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
        name={["security", "securitySerial"]}
        rules={[R.required()]}
      >
        <Input disabled={!!props.initialData} />
      </Form.Item>
      {props.type === "PAID" && (
        <>
          <Form.Item label="유가증권" name="securityId" rules={[R.required()]}>
            <FormControl.SelectSecurity disabled={!!props.initialData} />
          </Form.Item>
        </>
      )}
      {props.type === "COLLECTED" && (
        <>
          <Form.Item
            label="유가증권금액"
            name={["security", "securityAmount"]}
            rules={[R.required()]}
          >
            <FormControl.Number disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="발행일" name={["security", "drawedDate"]}>
            <FormControl.DatePicker disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="발행은행" name={["security", "drawedBank"]}>
            <FormControl.SelectBank disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item
            label="발행 지점명"
            name={["security", "drawedBankBranch"]}
          >
            <Input disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="발행지" name={["security", "drawedRegion"]}>
            <Input disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="발행인" name={["security", "drawer"]}>
            <Input disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="만기일" name={["security", "maturedDate"]}>
            <FormControl.DatePicker disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="지급은행" name={["security", "payingBank"]}>
            <FormControl.SelectBank disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="지급지점명" name={["security", "payingBankBranch"]}>
            <Input disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="지급인" name={["security", "payer"]}>
            <Input disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item label="유가증권 메모" name={["security", "memo"]}>
            <Input.TextArea rows={2} disabled={!!props.initialData} />
          </Form.Item>
          <Form.Item
            label="배서 구분"
            name="endorsementType"
            rules={[R.required()]}
            initialValue={"NONE"}
          >
            <SelectEndorsementType />
          </Form.Item>
          <Form.Item label="배서자" name="endorsement">
            <Input />
          </Form.Item>
        </>
      )}
      <Form.Item label="비고" name="memo">
        <Input.TextArea rows={2} />
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
  const cardAmount = useWatch<number | undefined>("cardAmount", form);
  const vatPrice = useWatch<number | undefined>("vatPrice", form);
  const isCharge = useWatch<boolean | undefined>("isCharge", form);

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
        cardAmount: props.initialData.byCard.cardAmount,
        bankAccountId: props.initialData.byCard.bankAccount?.id,
        vatPrice: props.initialData.byCard.vatPrice,
        isCharge: props.initialData.byCard.isCharge,
        approvalNumber: props.initialData.byCard.approvalNumber,
        accountedSubject: props.initialData.accountedSubject,
        memo: props.initialData.memo,
      });
    } else {
      form.resetFields();
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      {props.type === "PAID" && (
        <Form.Item label="카드 선택" name="cardId" rules={[R.required()]}>
          <FormControl.SelectCard disabled={!!props.initialData} />
        </Form.Item>
      )}
      <Form.Item label={props.type === "COLLECTED" ? "수금금액" : "지급금액"}>
        <FormControl.Number
          precision={0}
          min={0}
          value={
            cardAmount && vatPrice
              ? isCharge
                ? cardAmount
                : cardAmount + vatPrice
              : undefined
          }
          unit="원"
          disabled
        />
      </Form.Item>
      <Form.Item
        label={props.type === "COLLECTED" ? "카드입금금액" : "카드결제금액"}
        name="cardAmount"
        rules={[R.required()]}
      >
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <Form.Item
        label={props.type === "COLLECTED" ? "입금수수료" : "결제수수료"}
        name="vatPrice"
      >
        <FormControl.Number precision={0} min={0} unit="원" />
      </Form.Item>
      <Form.Item
        label={`수수료 ${props.type === "COLLECTED" ? "수금" : "지급"} 포함`}
        name="isCharge"
        valuePropName="checked"
        initialValue={false}
      >
        <Switch />
      </Form.Item>
      {props.type === "COLLECTED" && (
        <Form.Item
          label="계좌 선택"
          name="bankAccountId"
          rules={[R.required()]}
        >
          <FormControl.SelectBankAccount disabled={!!props.initialData} />
        </Form.Item>
      )}
      <Form.Item label="승인번호" name="approvalNumber">
        <Input />
      </Form.Item>
      <Form.Item
        label="계정과목"
        name="accountedSubject"
        rules={[R.required()]}
      >
        <SelectSubject type={props.type} />
      </Form.Item>
      <Form.Item label="비고" name="memo">
        <Input.TextArea rows={2} />
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
  type: AccountedType;
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

  useEffect(() => {
    if (props.initialData?.byOffset) {
      form.setFieldsValue({
        amount: props.initialData.byOffset.amount,
        accountedSubject: props.initialData.accountedSubject,
        memo: props.initialData.memo,
      });
    } else {
      form.resetFields();
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label={`${props.type === "COLLECTED" ? "수금" : "지급"} 금액`}
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
        <SelectSubject type={props.type} />
      </Form.Item>
      <Form.Item label="비고" name="memo">
        <Input.TextArea rows={2} />
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

  useEffect(() => {
    if (props.initialData?.byEtc) {
      form.setFieldsValue({
        amount: props.initialData.byEtc.amount,
        accountedSubject: props.initialData.accountedSubject,
        memo: props.initialData.memo,
      });
    } else {
      form.resetFields();
    }
  }, [props.initialData, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label={`${props.type === "COLLECTED" ? "수금" : "지급"} 금액`}
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
        <SelectSubject type={props.type} />
      </Form.Item>
      <Form.Item label="비고" name="memo">
        <Input.TextArea rows={2} />
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

function SelectSubject(props: {
  value?: Subject;
  type: AccountedType;
  onChange?: (value: Subject | undefined) => void;
}) {
  return (
    <Select
      value={props.value}
      onChange={props.onChange}
      options={Array.from<Model.Enum.Subject>([
        "ACCOUNTS_RECEIVABLE",
        "UNPAID",
        "ADVANCES",
        "MISCELLANEOUS_INCOME",
        "PRODUCT_SALES",
        "ETC",
      ]).map((item) => ({
        label: Util.accountSubjectToString(item, props.type),
        value: item,
      }))}
    />
  );
}
