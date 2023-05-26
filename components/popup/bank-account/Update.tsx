import { Api } from "@/@shared";
import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";
import FormUpdate from "./common/FormUpdate";

export interface Props {
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Api.BankAccountUpdateRequest>();
  const [edit, setEdit] = useState(false);

  const api = ApiHook.Inhouse.BankAccount.useBankAccountUpdate();

  const cmd = useCallback(
    async (values: Api.BankAccountUpdateRequest) => {
      if (!props.open) {
        return;
      }

      api.mutateAsync({ id: props.open, data: values })

      setEdit(false);
      props.onClose(false);
    },
    [api, props]
  );

  const res = ApiHook.Inhouse.BankAccount.useGetBankAccountItem({ id: props.open });

  useEffect(() => {
    if (!res.data || edit) {
      return;
    }

    form.setFieldsValue({
      bankComapny: res.data?.bankComapny,
      accountName: res.data?.accountName,
      accountType: res.data?.accountType,
      accountNumber: res.data?.accountNumber,
      accountHolder: res.data?.accountHolder,
    } as Api.BankAccountUpdateRequest);

  }, [form, res.data, edit]);

  return (
    <Popup.Template.Property title={`계좌 상세`} {...props} open={!!props.open}>
      <div className="flex-1 p-4">
        <FormUpdate
          form={form}
          edit={edit}
          onFinish={async (values) => await cmd(values)}
          onEditChange={(edit) => setEdit(edit)}
        />
      </div>
    </Popup.Template.Property>
  );
}
