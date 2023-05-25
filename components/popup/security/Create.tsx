import { Api } from "@/@shared";
import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";
import { FormCreate } from "./common";

export interface Props {
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Api.SecurityCreateRequest>();

  const apiCard = ApiHook.Inhouse.Security.useSecurityCreate();

  const cmd = useCallback(
    async (values: Api.SecurityCreateRequest) => {

      await apiCard.mutateAsync({ data: values });

      form.resetFields();
      props.onClose(false);
    },
    [apiCard, form, props]
  );

  useEffect(() => {
    form.resetFields();
  }, [form, props])

  return (
    <Popup.Template.Property title={`유가증권 발행`} {...props}>
      <div className="flex-1 p-4">
        <FormCreate
          form={form}
          onFinish={async (values) => await cmd(values)}
        />
      </div>
    </Popup.Template.Property>
  );
}
