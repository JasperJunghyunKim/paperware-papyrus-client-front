import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";
import { FormCreate } from "./common";
import { AccountedType } from "@/@shared/models/enum";
import dayjs from "dayjs";

type Request = Api.ByCashCreateRequest | Api.ByEtcCreateRequest | Api.ByBankAccountCreateRequest | Api.ByCardCreateRequest | Api.ByOffsetCreateRequest;

interface Props {
  accountedType: AccountedType;
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Request>();

  const apiByCash = ApiHook.Partner.ByCash.useByCashCreate();
  const apiByEtc = ApiHook.Partner.ByEtc.useByEtcCreate();
  const apiByBankAccount = ApiHook.Partner.ByBankAccount.useByBankAccountCreate();
  const apiByCard = ApiHook.Partner.ByCard.useByCardCreate();
  const apiByOffset = ApiHook.Partner.ByOffset.useByOffsetCreate();

  const cmd = useCallback(
    async (values: Request) => {
      const method: Enum.Method = form.getFieldValue("accountedMethod");
      values.accountedType = props.accountedType;

      switch (method) {
        case 'ACCOUNT_TRANSFER':
          await apiByBankAccount.mutateAsync({ data: values as Api.ByBankAccountCreateRequest });
          break;
        case 'CARD_PAYMENT':
          await apiByCard.mutateAsync({ data: values as Api.ByCardCreateRequest });
          break;
        case 'PROMISSORY_NOTE':
          // TODO
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
    [apiByBankAccount, apiByCard, apiByCash, apiByEtc, apiByOffset, form, props]
  );

  useEffect(() => {
    form.setFieldsValue({
      accountedDate: dayjs().toISOString(),
    } as Request);
  }, [form])

  return (
    <Popup.Template.Property title={`${props.accountedType === 'PAID' ? '지급' : '수금'} 등록`} {...props}>
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
