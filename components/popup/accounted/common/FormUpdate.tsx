import { Api, Model } from "@/@shared";
import { AccountedType } from "@/@shared/models/enum";
import { Button, FormControl } from "@/components";
import { selectSecurityAtom } from "@/components/formControl/SelectSecurity";
import { Checkbox, Form, FormInstance, Input, message } from "antd";
import { useWatch } from "antd/lib/form/Form";
import { isEmpty } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

type Request =
  | Api.ByCashUpdateRequest
  | Api.ByEtcUpdateRequest
  | Api.ByBankAccountUpdateRequest
  | Api.ByCardUpdateRequest
  | Api.ByOffsetUpdateRequest
  | { partnerNickName?: string; accountedType?: string }
  | Api.BySecurityUpdateRequest;

interface Props {
  accountedType: AccountedType;
  form: FormInstance<Request>;
  onFinish: (values: Request) => void;
  edit: boolean;
  onEditChange: (edit: boolean) => void;
}

export default function Component(props: Props) {
  const [labelName] = useState<string>(
    `${props.accountedType === "PAID" ? "지급" : "수금"}`
  );

  const amountCardRef = useRef(null);
  const amount = useWatch("amount", props.form);
  const isCharge = useWatch("isCharge", props.form);
  const chargeAmount = useWatch("chargeAmount", props.form);
  const accountedDate = useWatch("accountedDate", props.form);
  const [messageApi, contextHolder] = message.useMessage();
  const securityAtom = useRecoilValue(selectSecurityAtom);

  useEffect(() => {
    if (!isEmpty(securityAtom)) {
      props.form.setFieldValue("securityType", securityAtom.securityType);
      props.form.setFieldValue("securitySerial", securityAtom.securitySerial);
      props.form.setFieldValue("securityAmount", securityAtom.securityAmount);
      props.form.setFieldValue("drawedDate", securityAtom.drawedDate);
      props.form.setFieldValue("drawedBank", securityAtom.drawedBank);
      props.form.setFieldValue(
        "drawedBankBranch",
        securityAtom.drawedBankBranch
      );
      props.form.setFieldValue("drawedRegion", securityAtom.drawedRegion);
      props.form.setFieldValue("drawer", securityAtom.drawer);
      props.form.setFieldValue("maturedDate", securityAtom.maturedDate);
      props.form.setFieldValue("payingBank", securityAtom.payingBank);
      props.form.setFieldValue(
        "payingBankBranch",
        securityAtom.payingBankBranch
      );
      props.form.setFieldValue("payer", securityAtom.payer);
      props.form.setFieldValue("securityMemo", securityAtom.memo);
    }
  }, [securityAtom, props]);

  useEffect(() => {
    if (isCharge && amountCardRef !== null) {
      if (props.accountedType === "PAID") {
        if (amount < chargeAmount) {
          return messageApi.open({
            type: "error",
            content: "수수료가 지급금액보다 큽니다.",
          });
        } else {
          /*
           * 지급(카드결제)
           * 수수료 포함 : 지급합계 = 카드결제금액(즉, 돈을 받는 거래처가 수수료를 부담함)
           * 수수료 미포함 : 지급합계 = 카드결제금액 - 수수료(즉, 지급등록하는 자사가 수수료를 부담함)
           */
        }
      } else {
        /*
         * 수금(카드입금)
         * 수수료 포함 : 수금합계 = 카드입금금액 + 수수료 (즉, 수금등록하는 자사가 수수료를 부담함)
         * 수수료 미포함 : 수금합계 = 카드입금금액 (즉, 돈을 지급한 거래처가 수수료를 부담함)
         */
      }
    } else {
    }
  }, [props, amount, chargeAmount, messageApi, isCharge]);

  return (
    <Form
      form={props.form}
      onFinish={(values) => {
        props.onFinish(values);
      }}
      layout="vertical"
      disabled={!props.edit}
      rootClassName="flex flex-col gap-y-4"
    >
      {contextHolder}
      <div className="flex flex-row justify-end gap-x-2">
        <Button.Preset.Edit
          label="내용 수정"
          onClick={() => props.onEditChange(true)}
          hidden={props.edit}
        />
        <Button.Default
          label="수정 취소"
          onClick={() => props.onEditChange(false)}
          hidden={!props.edit}
        />
        <Button.Preset.Submit label="내용 저장" hidden={!props.edit} />
      </div>

      <div className="h-px bg-gray-200" />

      <Form.Item
        name="companyRegistrationNumber"
        label="거래처"
        rules={[{ required: true }]}
      >
        <FormControl.SelectCompanyRegistrationNumber />
      </Form.Item>

      <Form.Item
        name="accountedMethod"
        label={`${labelName} 수단`}
        rules={[{ required: true }]}
      >
        <FormControl.SelectMethod
          accountedType={props.accountedType}
          isDisabled={true}
        />
      </Form.Item>

      <Form.Item
        name="accountedDate"
        label={`${labelName}일`}
        rules={[{ required: true }]}
      >
        <FormControl.DatePicker value={accountedDate} />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.accountedMethod !== currentValues.accountedMethod
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("accountedMethod") ===
          ("PROMISSORY_NOTE" as Model.Enum.Method) ? (
            <Form.Item
              name="securityAmount"
              label={`${labelName} 금액`}
              rules={[{ required: true }]}
            >
              <FormControl.Number
                rootClassName="text-right"
                min={0}
                precision={0}
                unit="원"
              />
            </Form.Item>
          ) : getFieldValue("accountedMethod") ===
            ("CARD_PAYMENT" as Model.Enum.Method) ? null : (
            <Form.Item
              name="amount"
              label={`${labelName} 금액`}
              rules={[{ required: true }]}
            >
              <FormControl.Number
                rootClassName="text-right"
                min={0}
                precision={0}
                unit="원"
              />
            </Form.Item>
          )
        }
      </Form.Item>

      <Form.Item
        name="accountedSubject"
        label="계정 과목"
        rules={[{ required: true }]}
      >
        <FormControl.SelectSubject accountedType={props.accountedType} />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.accountedMethod !== currentValues.accountedMethod
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("accountedMethod") ===
            ("CARD_PAYMENT" as Model.Enum.Method) &&
          (props.accountedType === "COLLECTED" ? (
            <Form.Item
              name="accountName"
              label="계좌"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item
              name="cardName"
              label="카드"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
          ))
        }
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => {
          return (
            prevValues.accountedMethod !== currentValues.accountedMethod ||
            prevValues.isCharge !== currentValues.isCharge
          );
        }}
      >
        {({ getFieldValue }) =>
          getFieldValue("accountedMethod") ===
            ("CARD_PAYMENT" as Model.Enum.Method) && (
            <>
              <Form.Item
                name="amount"
                label="금액"
                shouldUpdate={(prevValues, currentValues) => {
                  return (
                    prevValues.amount !== currentValues.amount ||
                    prevValues.chargeAmount !== currentValues.chargeAmount
                  );
                }}
              >
                <FormControl.Number rootClassName="text-right" unit="원" />
              </Form.Item>
              <Form.Item
                name="chargeAmount"
                label="수수료 금액"
                rules={[{ required: true }]}
              >
                <FormControl.Number
                  rootClassName="text-right"
                  min={0}
                  precision={0}
                  unit="원"
                />
              </Form.Item>
              <Form.Item name="isCharge" label="수수료" valuePropName="checked">
                <Checkbox>
                  수수료 {props.accountedType === "PAID" ? "지급" : "수금"} 포함
                </Checkbox>
              </Form.Item>
            </>
          )
        }
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.accountedMethod !== currentValues.accountedMethod
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("accountedMethod") ===
            ("CARD_PAYMENT" as Model.Enum.Method) && (
            <Form.Item name="approvalNumber" label="승인번호">
              <Input />
            </Form.Item>
          )
        }
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.accountedMethod !== currentValues.accountedMethod
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("accountedMethod") ===
            ("ACCOUNT_TRANSFER" as Model.Enum.Method) && (
            <Form.Item
              name="accountName"
              label="계좌 목록"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
          )
        }
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.accountedMethod !== currentValues.accountedMethod
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("accountedMethod") ===
            ("PROMISSORY_NOTE" as Model.Enum.Method) &&
          props.accountedType === "COLLECTED" ? (
            <>
              <Form.Item
                name="endorsementType"
                label={"배서구분"}
                rules={[{ required: true }]}
              >
                <FormControl.SelectEndorsementType />
              </Form.Item>
              <Form.Item name="endorsement" label={"배서자"}>
                <Input />
              </Form.Item>
            </>
          ) : (
            getFieldValue("accountedMethod") === "PROMISSORY_NOTE" &&
            props.accountedType === "PAID" && (
              <>
                <Form.Item
                  name="securityId"
                  label={"유가증권 목록"}
                  rules={[{ required: true }]}
                >
                  <FormControl.SelectSecurity />
                </Form.Item>
              </>
            )
          )
        }
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.accountedMethod !== currentValues.accountedMethod
        }
      >
        {({ getFieldValue }) =>
          getFieldValue("accountedMethod") ===
            ("PROMISSORY_NOTE" as Model.Enum.Method) && (
            <>
              <Form.Item
                name="securityType"
                label={"유가증권 유형"}
                rules={[{ required: true }]}
              >
                <FormControl.SelectSecurityType
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item
                name="securitySerial"
                label={"유가증권 번호"}
                rules={[{ required: true }]}
              >
                <Input
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item
                name="securityAmount"
                label="유가증권 금액"
                rules={[{ required: true }]}
              >
                <FormControl.Number
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="drawedDate" label={"발행일"}>
                <FormControl.DatePicker
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="drawedBank" label={"발행은행"}>
                <FormControl.SelectBank
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="drawedBankBranch" label={"발행 지점명"}>
                <Input
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="drawedRegion" label={"발행지"}>
                <Input
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="drawer" label={"발행인"}>
                <Input
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="maturedDate" label={"만기일"}>
                <FormControl.DatePicker
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="payingBank" label={"지급은행"}>
                <FormControl.SelectBank
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="payingBankBranch" label={"지급 지점명"}>
                <Input
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="payer" label={"지급인"}>
                <Input
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
              <Form.Item name="securityMemo" label={"유가증권 비고"}>
                <Input
                  disabled={props.accountedType === "PAID" || !props.edit}
                />
              </Form.Item>
            </>
          )
        }
      </Form.Item>

      <Form.Item
        name="memo"
        label={`${props.accountedType === "PAID" ? "지급" : "수금"} 비고`}
      >
        <Input />
      </Form.Item>
    </Form>
  );
}
