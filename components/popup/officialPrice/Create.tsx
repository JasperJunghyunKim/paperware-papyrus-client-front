import { Popup } from "@/components";
import { useCallback } from "react";
import { FormCreate } from "./common";
import { useForm } from "antd/lib/form/Form";
import { Api, Model } from "@/@shared";
import { ApiHook } from "@/common";
import { OfficialPriceCreateRequest } from "@/@shared/api/inhouse/official-price.request";

type DataType = OfficialPriceCreateRequest;

export interface Props {
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<DataType>();

  const api = ApiHook.Inhouse.OfficialPrice.useCreate();
  const cmd = useCallback(
    async (values: DataType) => {
      await api.mutateAsync({ data: values });
      form.resetFields();
      props.onClose(false);
    },
    [api, form, props]
  );

  return (
    <Popup.Template.Property title="고시가 추가" {...props}>
      <div className="flex-1 p-4">
        <FormCreate
          form={form}
          onFinish={async (values) => await cmd(values)}
        />
      </div>
    </Popup.Template.Property>
  );
}
