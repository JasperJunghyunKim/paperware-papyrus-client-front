import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType } from "@/@shared/models/enum";
import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { selectPartnerAtom } from "@/components/formControl/SelectPartner";
import { message } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { FormCreate } from "./common";

type Request = Api.ByCashCreateRequest | Api.ByEtcCreateRequest | Api.ByBankAccountCreateRequest | Api.ByCardCreateRequest | Api.ByOffsetCreateRequest | Api.BySecurityCreateRequest;

interface Props {
  accountedType: AccountedType;
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Request>();
  const [messageApi, contextHolder] = message.useMessage();
  const setSelectPartner = useRecoilValue(selectPartnerAtom);

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
      values.companyId = setSelectPartner.companyId;
      values.companyRegistrationNumber = setSelectPartner.companyRegistrationNumber;
      (values as any).partnerNickName = setSelectPartner.partnerNickName;

      switch (method) {
        case 'ACCOUNT_TRANSFER':
          await apiByBankAccount.mutateAsync({ data: values as Api.ByBankAccountCreateRequest });
          break;
        case 'CARD_PAYMENT':
          const cardReq = values as Api.ByCardCreateRequest;
          if (values.amount < (values as Api.ByCardCreateRequest).chargeAmount) {
            return messageApi.open({
              type: 'error',
              content: '수수료가 지급금액보다 큽니다.'
            })
          }

          // 수수료가 체크 안될경우... 
          if (!cardReq.isCharge) {
            cardReq.totalAmount = 0;
          }

          await apiByCard.mutateAsync({ data: cardReq });
          break;
        case 'PROMISSORY_NOTE':
          const req: any = values;

          if (props.accountedType === 'COLLECTED') {
            await apiBySecurity.mutateAsync({
              data: {
                ...req,
                memo: req.memo,
                amount: req.securityAmount,
                endorsementType: req.endorsementType,
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
          } else {
            await apiBySecurity.mutateAsync({
              data: {
                ...req,
                memo: req.memo,
                amount: req.securityAmount,
                endorsementType: req.endorsementType,
                endorsement: req.endorsement,
                security: {
                  securityId: req.securityId,
                }
              }
            });
          }

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
    [messageApi, apiByBankAccount, apiByCard, apiByCash, apiByEtc, apiByOffset, apiBySecurity, form, setSelectPartner, props]
  );

  return (
    <Popup.Template.Property title={`${props.accountedType === 'PAID' ? '지급' : '수금'} 등록`} width="800px" {...props} >
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
