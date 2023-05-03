import { Api } from "@/common";
import { Popup } from "@/components";
import { useCallback } from "react";
import { FormCreate } from "./common";
import { useForm } from "antd/lib/form/Form";

export interface Props {
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Api.Internal.Stock.CreateStock>();

  const api = Api.Internal.Stock.useCreateStock();
  const cmd = useCallback(
    async (values: Api.Internal.Stock.CreateStock) => {
      await api.mutateAsync({ data: values });
      form.resetFields();
      props.onClose(false);
    },
    [api, form, props]
  );

  return (
    <Popup.Template.Property title="재고 추가" {...props}>
      <div className="flex-1 p-4">
        <FormCreate
          form={form}
          onFinish={async (values) => await cmd(values)}
        />
      </div>
    </Popup.Template.Property>
  );
}
