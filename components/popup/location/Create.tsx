import { Popup } from "@/components";
import { useCallback, useEffect } from "react";
import { FormCreate } from "./common";
import { useForm, useWatch } from "antd/lib/form/Form";
import { Api } from "@/@shared";
import { ApiHook } from "@/common";
import { Alert } from "antd";

export interface Props {
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Api.LocationCreateRequest>();

  const api = ApiHook.Inhouse.Location.useCreate();
  const cmd = useCallback(
    async (values: Api.LocationCreateRequest) => {
      await api.mutateAsync({ data: values });
      form.resetFields();
      props.onClose(false);
    },
    [api, form, props]
  );

  useEffect(() => {
    if (!props.open) {
      return;
    }

    form.resetFields();
  }, [form, props.open]);

  return (
    <Popup.Template.Property title="도착지 추가" {...props}>
      <div className="flex-1 p-4">
        <FormCreate
          form={form}
          onFinish={async (values) => await cmd(values)}
        />
      </div>
    </Popup.Template.Property>
  );
}
