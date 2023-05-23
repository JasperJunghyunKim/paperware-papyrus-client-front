import { Api, Model } from "@/@shared";
import { AccountedType } from "@/@shared/models/enum";
import { Button, FormControl } from "@/components";
import { Checkbox, Form, FormInstance, Input, message } from "antd";
import { useWatch } from "antd/lib/form/Form";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

type Request = Api.ByCashCreateRequest | Api.ByEtcCreateRequest | Api.ByBankAccountCreateRequest | Api.ByCardCreateRequest | Api.ByOffsetCreateRequest;

interface Props {
  accountedType: AccountedType;
  form: FormInstance<Request>;
  onFinish: (values: Request) => void;
}

export default function Component(props: Props) {
  const [labelName] = useState<string>(`${props.accountedType === 'PAID' ? '지급' : '수금'}`);
  const toatlAmountInputRef = useRef(null);
  const amount = useWatch('amount', props.form);
  const chargeAmount = useWatch('chargeAmount', props.form);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (toatlAmountInputRef !== null) {
      if (props.accountedType === 'PAID') {
        if (amount < chargeAmount) {
          return messageApi.open({
            type: 'error',
            content: '수수료가 지급금액보다 큽니다.'
          })
        } else {
          /*
           * 지급(카드결제)
           * 수수료 포함 : 지급합계 = 카드결제금액(즉, 돈을 받는 거래처가 수수료를 부담함)
           * 수수료 미포함 : 지급합계 = 카드결제금액 - 수수료(즉, 지급등록하는 자사가 수수료를 부담함)
           */
          props.form.setFieldsValue({ totalAmount: amount - chargeAmount })
        }
      } else {
        /*
         * 수금(카드입금)
         * 수수료 포함 : 수금합계 = 카드입금금액 + 수수료 (즉, 수금등록하는 자사가 수수료를 부담함)
         * 수수료 미포함 : 수금합계 = 카드입금금액 (즉, 돈을 지급한 거래처가 수수료를 부담함)
         */
        props.form.setFieldsValue({ totalAmount: amount + chargeAmount })
      }

    }
  }, [props, amount, chargeAmount, messageApi])


  useEffect(() => {
    if (props.form !== undefined) {
      props.form.setFieldsValue({
        accountedDate: dayjs().toISOString(),
        amount: 0,
      } as Request);
    }
  }, [props])

  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      {contextHolder}
      <Form.Item name="partnerNickName" label="거래처" rules={[{ required: true }]}>
        <FormControl.SelectPartner />
      </Form.Item>
      <Form.Item
        name="accountedDate"
        label={`${labelName}일`}
        rules={[{ required: true }]}
      >
        <FormControl.DatePicker />
      </Form.Item>

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

      <Form.Item
        name="accountedSubject"
        label="계정 과목"
        rules={[{ required: true }]}
      >
        <FormControl.SelectSubject accountedType={props.accountedType} />
      </Form.Item>

      <Form.Item
        name="accountedMethod"
        label={`${labelName} 수단`}
        rules={[{ required: true }]}
      >
        <FormControl.SelectMethod accountedType={props.accountedType} />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.accountedMethod !== currentValues.accountedMethod}
      >
        {({ getFieldValue }) =>
          getFieldValue('accountedMethod') === 'CARD_PAYMENT' as Model.Enum.Method ? (
            <Form.Item name="cardId" label="카드 목록" rules={[{ required: true }]}>
              <FormControl.SelectApiCard />
            </Form.Item>
          ) : null
        }
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => {
          return (prevValues.accountedMethod !== currentValues.accountedMethod) || (prevValues.isCharge !== currentValues.isCharge)
        }}
      >
        {({ getFieldValue }) =>
          getFieldValue('accountedMethod') === 'CARD_PAYMENT' as Model.Enum.Method ? (
            <>
              <Form.Item name="isCharge" label="수수료" valuePropName="checked">
                <Checkbox>수수료 포함</Checkbox>
              </Form.Item>
              {
                getFieldValue("isCharge") === true && (
                  <Form.Item name="chargeAmount" label="수수료 금액" rules={[{ required: true }]}>
                    <FormControl.Number
                      rootClassName="text-right"
                      min={0}
                      precision={0}
                      unit="원"
                    />
                  </Form.Item>
                )
              }
              {
                getFieldValue("isCharge") === true && (
                  <Form.Item
                    name="totalAmount"
                    label="합산 금액"
                    shouldUpdate={(prevValues, currentValues) => {
                      return prevValues.amount !== currentValues.amount || prevValues.chargeAmount !== currentValues.chargeAmount
                    }}>
                    <FormControl.Number
                      ref={toatlAmountInputRef}
                      rootClassName="text-right"
                      unit="원"
                      disabled
                    />
                  </Form.Item>
                )
              }
            </>
          ) : null
        }
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.accountedMethod !== currentValues.accountedMethod}
      >
        {({ getFieldValue }) =>
          getFieldValue('accountedMethod') === 'CARD_PAYMENT' as Model.Enum.Method ? (
            <Form.Item name="approvalNumber" label="승인번호">
              <Input />
            </Form.Item>
          ) : null
        }
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.accountedMethod !== currentValues.accountedMethod}
      >
        {({ getFieldValue }) =>
          getFieldValue('accountedMethod') === 'ACCOUNT_TRANSFER' as Model.Enum.Method ? (
            <Form.Item name="bankAccountId" label="계좌 목록" rules={[{ required: true }]}>
              <FormControl.SelectApiBank />
            </Form.Item>
          ) : null
        }
      </Form.Item>

      <Form.Item name="memo" label="비고">
        <Input />
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button.Preset.Submit
          label={`${labelName} 추가`}
        />
      </Form.Item>
    </Form>
  );
}
