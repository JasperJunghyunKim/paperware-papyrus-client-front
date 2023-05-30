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
  const [form] = useForm<Api.CardUpdateRequest>();
  const [edit, setEdit] = useState(false);

  const api = ApiHook.Inhouse.Card.useCardUpdate();

  const cmd = useCallback(
    async (values: Api.CardUpdateRequest) => {
      if (!props.open) {
        return;
      }
      debugger

      api.mutateAsync({ id: props.open, data: values })

      setEdit(false);
      props.onClose(false);
    },
    [api, props]
  );

  const data = ApiHook.Inhouse.Card.useGetCardItem({ id: props.open });

  useEffect(() => {
    if (!data.data || edit) {
      return;
    }

    form.setFieldsValue({
      cardCompany: data.data?.cardCompany,
      cardName: data.data?.cardName,
      cardNumber: data.data?.cardNumber,
      cardHolder: data.data?.cardHolder,
    } as Api.CardUpdateRequest);

  }, [form, data.data, edit]);

  return (
    <Popup.Template.Property title={`카드 상세`} {...props} open={!!props.open}>
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
