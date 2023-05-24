import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType } from "@/@shared/models/enum";
import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback } from "react";
import { FormCreate } from "./common";
import { message } from "antd";

type Request = Api.ByCashCreateRequest | Api.ByEtcCreateRequest | Api.ByBankAccountCreateRequest | Api.ByCardCreateRequest | Api.ByOffsetCreateRequest | Api.BySecurityCreateRequest;

interface Props {
  accountedType: AccountedType;
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Request>();
  const [messageApi, contextHolder] = message.useMessage();

  const apiByCash = ApiHook.Partner.ByCash.useByCashCreate();
  const apiByEtc = ApiHook.Partner.ByEtc.useByEtcCreate();
  const apiByBankAccount = ApiHook.Partner.ByBankAccount.useByBankAccountCreate();
  const apiByCard = ApiHook.Partner.ByCard.useByCardCreate();
  const apiByOffset = ApiHook.Partner.ByOffset.useByOffsetCreate();
  const apiBySecurity = ApiHook.Partner.BySecurity.useBySecurityCreate();

  const cmd = useCallback(
    async (values: Request) => {
      const method: Enum.Method = form.getFieldValue("accountedMethod");
      values.accountedType = props.accountedType;

      values.companyId = parseInt((values as any).partnerNickName.split('/')[0]);
      values.companyRegistrationNumber = (values as any).partnerNickName.split('/')[1];

      switch (method) {
        case 'ACCOUNT_TRANSFER':
          await apiByBankAccount.mutateAsync({ data: values as Api.ByBankAccountCreateRequest });
          break;
        case 'CARD_PAYMENT':
          if (values.amount < (values as Api.ByCardCreateRequest).chargeAmount) {
            return messageApi.open({
              type: 'error',
              content: '수수료가 지급금액보다 큽니다.'
            })
          }

          await apiByCard.mutateAsync({ data: values as Api.ByCardCreateRequest });
          break;
        case 'PROMISSORY_NOTE':
          const req: any = values;
          await apiBySecurity.mutateAsync({
            data: {
              ...req,
              memo: req.memo,
              amount: req.securityAmount,
              endorsement: req.endorsement,
              security: {
                securityId: req.securityAmount,
                securityType: req.securityType,
                securitySerial: req.securitySerial,
                securityAmount: req.securityAmount,
                securityStatus: req.securityStatus,
                drawedStatus: req.drawedStatus,
                drawedDate: req.drawedDate,
                drawedBank: req.drawedBank,
                drawedBankBranch: req.drawedBankBranch,
                drawedRegion: req.drawedRegion,
                drawer: req.drawer,
                maturedDate: req.maturedDate,
                payingBank: req.payingBank,
                payingBankBranch: req.payingBankBranch,
                payer: req.payer,
                memo: req.securityMemo,
              }
            }
          });
          break;
        case 'OFFSET':
          await apiByOffset.mutateAsync({ data: values as Api.ByOffsetCreateRequest });
          break;
        case 'CASH':
          await apiByCash.mutateAsync({ data: values as Api.ByCashCreateRequest });
          break;
        case 'ETC':
          await apiByEtc.mutateAsync({ data: values as Api.ByEtcCreateRequest });
          break;
      }

      form.resetFields();
      props.onClose(false);
    },
    [messageApi, apiByBankAccount, apiByCard, apiByCash, apiByEtc, apiByOffset, apiBySecurity, form, props]
  );

  return (
    <Popup.Template.Property title={`${props.accountedType === 'PAID' ? '지급' : '수금'} 등록`} {...props}>
      {contextHolder}
      <div className="flex-1 p-4">
        <FormCreate
          accountedType={props.accountedType}
          form={form}
          onFinish={async (values) => await cmd(values)}
        />
      </div>
    </Popup.Template.Property>
  );
}
