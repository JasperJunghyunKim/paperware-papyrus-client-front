import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";
import FormUpdate from "./common/FormUpdate";
import { Api } from "@/@shared";
import { Enum } from "@/@shared/models";
import { AccountedType } from "@/@shared/models/enum";

type Request = Api.ByCashUpdateRequest | Api.ByEtcUpdateRequest | Api.ByBankAccountUpdateRequest | Api.ByCardUpdateRequest | Api.ByOffsetUpdateRequest;

export interface Props {
  method: Enum.Method | null;
  accountedType: AccountedType;
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Request>();
  const [edit, setEdit] = useState(false);

  const resByCash = ApiHook.Partner.ByCash.useGetByCashItem({ id: props.open, method: props.method, accountedType: props.accountedType });
  const resByEtc = ApiHook.Partner.ByEtc.useGetByEtcItem({ id: props.open, method: props.method, accountedType: props.accountedType });
  const resByBankAccount = ApiHook.Partner.ByBankAccount.useGetByBankAccountItem({ id: props.open, method: props.method, accountedType: props.accountedType });
  const resByCard = ApiHook.Partner.ByCard.useGetByCardItem({ id: props.open, method: props.method, accountedType: props.accountedType });
  const resByOffset = ApiHook.Partner.ByOffset.useGetByOffsetItem({ id: props.open, method: props.method, accountedType: props.accountedType });

  const apiByCash = ApiHook.Partner.ByCash.useByCashUpdate();
  const apiByEtc = ApiHook.Partner.ByEtc.useByEtcUpdate();
  const apiByBankAccount = ApiHook.Partner.ByBankAccount.useByBankAccountUpdate();
  const apiByCard = ApiHook.Partner.ByCard.useByCardUpdate();
  const apiByOffset = ApiHook.Partner.ByOffset.useByOffsetUpdate();

  const cmd = useCallback(
    async (values: Request) => {
      if (!props.open) {
        return;
      }

      values.accountedType = props.accountedType;

      switch (props.method) {
        case 'ACCOUNT_TRANSFER':
          await apiByBankAccount.mutateAsync({
            data: values as Api.ByBankAccountUpdateRequest,
            id: resByBankAccount.data?.accountedId ?? 0
          });
          break;
        case 'CARD_PAYMENT':
          await apiByCard.mutateAsync({
            data: values as Api.ByCardUpdateRequest,
            id: resByCard.data?.accountedId ?? 0
          });
          break;
        case 'PROMISSORY_NOTE':
          // TODO
          break;
        case 'OFFSET':
          await apiByOffset.mutateAsync({
            data: values as Api.ByOffsetUpdateRequest,
            id: resByOffset.data?.accountedId ?? 0
          });
          break;
        case 'CASH':
          await apiByCash.mutateAsync({
            data: values as Api.ByCashUpdateRequest,
            id: resByCash.data?.accountedId ?? 0
          });
          break;
        case 'ETC':
          await apiByEtc.mutateAsync({
            data: values as Api.ByEtcUpdateRequest,
            id: resByEtc.data?.accountedId ?? 0
          });
          break;
      }

      setEdit(false);
      props.onClose(false);
    },
    [props, apiByCash, apiByEtc, resByCash, resByEtc, apiByBankAccount, resByBankAccount, apiByCard, resByCard, apiByOffset, resByOffset]
  );

  useEffect(() => {
    switch (props.method) {
      case 'ACCOUNT_TRANSFER':
        form.setFieldsValue({
          accountedDate: resByBankAccount.data?.accountedDate,
          accountedMethod: resByBankAccount.data?.accountedMethod,
          accountedSubject: resByBankAccount.data?.accountedSubject,
          memo: resByBankAccount.data?.memo,
          amount: resByBankAccount.data?.amount,
          bankAccountId: resByBankAccount.data?.bankAccountId,
        });
        break;
      case 'CARD_PAYMENT':
        form.setFieldsValue({
          accountedDate: resByCard.data?.accountedDate,
          accountedMethod: resByCard.data?.accountedMethod,
          accountedSubject: resByCash.data?.accountedSubject,
          memo: resByCard.data?.memo,
          amount: resByCard.data?.amount,
          cardId: resByCard.data?.cardId,
          approvalNumber: resByCard.data?.approvalNumber,
          chargeAmount: resByCard.data?.chargeAmount,
          totalAmount: resByCard.data?.totalAmount,
          isCharge: resByCard.data?.isCharge,
        });
        break;
      case 'PROMISSORY_NOTE':
        // TODO
        break;
      case 'OFFSET':
        form.setFieldsValue({
          accountedDate: resByOffset.data?.accountedDate,
          accountedMethod: resByOffset.data?.accountedMethod,
          accountedSubject: resByOffset.data?.accountedSubject,
          memo: resByOffset.data?.memo,
          amount: resByOffset.data?.amount,
        });
        break;
      case 'CASH':
        form.setFieldsValue({
          accountedDate: resByCash.data?.accountedDate,
          accountedMethod: resByCash.data?.accountedMethod,
          accountedSubject: resByCash.data?.accountedSubject,
          memo: resByCash.data?.memo,
          amount: resByCash.data?.amount,
        });
        break;
      case 'ETC':
        form.setFieldsValue({
          accountedDate: resByEtc.data?.accountedDate,
          accountedMethod: resByEtc.data?.accountedMethod,
          accountedSubject: resByEtc.data?.accountedSubject,
          memo: resByEtc.data?.memo,
          amount: resByEtc.data?.amount,
        });
        break;
    }

  }, [props, form, edit, resByCash, resByEtc, resByBankAccount, resByCard, resByOffset]);

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
