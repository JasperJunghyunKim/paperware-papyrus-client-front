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

  const res = ApiHook.Inhouse.Card.useGetCardItem({ id: props.open });
  const api = ApiHook.Inhouse.Card.useCardUpdate();

  const cmd = useCallback(
    async (values: Api.CardUpdateRequest) => {
      if (!props.open) {
        return;
      }

      api.mutateAsync({ id: props.open, data: values })

      setEdit(false);
      props.onClose(false);
    },
    [api, props]
  );

  useEffect(() => {
    form.setFieldsValue({
      cardCompany: res.data?.cardCompany,
      cardName: res.data?.cardName,
      cardNumber: res.data?.cardNumber,
      cardHolder: res.data?.cardHolder,
    } as Api.CardUpdateRequest);

  }, [props, form, res, edit]);

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
