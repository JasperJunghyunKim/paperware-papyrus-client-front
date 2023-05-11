import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";
import FormUpdate from "./common/FormUpdate";
import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType } from "@/@shared/models/enum";

export interface Props {
  method: Enum.Method | null;
  accountedType: AccountedType;
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Api.ByCashUpdateRequest | Api.ByEtcUpdateRequest>();
  const [edit, setEdit] = useState(false);

  const resByCash = ApiHook.Partner.ByCash.useGetByCashItem({ id: props.open, method: props.method, accountedType: props.accountedType });
  const resByEtc = ApiHook.Partner.ByEtc.useGetByEtcItem({ id: props.open, method: props.method, accountedType: props.accountedType });
  const apiByCash = ApiHook.Partner.ByCash.useByCashUpdate();
  const apiByEtc = ApiHook.Partner.ByEtc.useByEtcUpdate();

  const cmd = useCallback(
    async (values: Api.ByCashUpdateRequest | Api.ByEtcUpdateRequest) => {
      if (!props.open) {
        return;
      }

      values.accountedType = props.accountedType;
      values.partnerNickName = '';

      switch (props.method) {
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
          values.partnerId = resByCash.data?.partnerId ?? 0;
          await apiByCash.mutateAsync({
            data: values,
            id: resByCash.data?.accountedId ?? 0
          });
          break;
        case 'ETC':
          values.partnerId = resByEtc.data?.partnerId ?? 0;
          await apiByEtc.mutateAsync({
            data: values,
            id: resByEtc.data?.accountedId ?? 0
          });
          break;
      }

      setEdit(false);
      props.onClose(false);
    },
    [props, apiByCash, apiByEtc, resByCash, resByEtc]
  );

  useEffect(() => {
    switch (props.method) {
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
        form.setFieldsValue({
          partnerNickName: resByCash.data?.partnerNickName,
          accountedDate: resByCash.data?.accountedDate,
          accountedMethod: resByCash.data?.accountedMethod,
          accountedSubject: resByCash.data?.accountedSubject,
          memo: resByCash.data?.memo,
          amount: resByCash.data?.amount,
        });
        break;
      case 'ETC':
        form.setFieldsValue({
          partnerNickName: resByEtc.data?.partnerNickName,
          accountedDate: resByEtc.data?.accountedDate,
          accountedMethod: resByEtc.data?.accountedMethod,
          accountedSubject: resByEtc.data?.accountedSubject,
          memo: resByEtc.data?.memo,
          amount: resByEtc.data?.amount,
        });
        break;
    }

  }, [props, form, resByCash, edit, resByEtc]);

  return (
    <Popup.Template.Property title={`${props.accountedType === 'PAID' ? '지급' : '수금'} 상세`} {...props} open={!!props.open}>
      <div className="flex-1 p-4">
        <FormUpdate
          accountedType={props.accountedType}
          form={form}
          edit={edit}
          onFinish={async (values) => await cmd(values)}
          onEditChange={(edit) => setEdit(edit)}
        />
      </div>
    </Popup.Template.Property>
  );
}
