import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";
import { FormCreate } from "./common";
import { AccountedType } from "@/@shared/models/enum";
import dayjs from "dayjs";

export interface Props {
  accountedType: AccountedType;
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Api.ByCashCreateRequest | Api.ByEtcCreateRequest>();

  const apiByCash = ApiHook.Partner.ByCash.useByCashCreate();
  const apiByEtc = ApiHook.Partner.ByEtc.useByEtcCreate();
  const cmd = useCallback(
    async (values: Api.ByCashCreateRequest | Api.ByEtcCreateRequest) => {
      const method: Enum.Method = form.getFieldValue("accountedMethod");
      values.accountedType = props.accountedType;

      switch (method) {
        case 'ACCOUNT_TRANSFER':
          // TODO
          break;
        case 'CARD_PAYMENT':
          // TODO
          break;
        case 'PROMISSORY_NOTE':
          // TODO
          break;
        case 'SET_OFF':
          // TODO
          break;
        case 'CASH':
          await apiByCash.mutateAsync({ data: values });
          break;
        case 'ETC':
          await apiByEtc.mutateAsync({ data: values });
          break;
      }

      form.resetFields();
      props.onClose(false);
    },
    [apiByCash, apiByEtc, form, props]
  );

  useEffect(() => {
    form.setFieldsValue({
      accountedDate: dayjs().toISOString(),
    } as Api.ByCashCreateRequest | Api.ByEtcCreateRequest);
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
