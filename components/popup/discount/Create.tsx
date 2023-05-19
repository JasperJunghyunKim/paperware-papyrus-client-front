import { DiscountRateCreateRequest } from "@/@shared/api/inhouse/discount-rate.request";
import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback } from "react";
import { FormCreate } from "./common";

type Open = "SALES" | "PURCHASE" | false;
type DataType = DiscountRateCreateRequest;

export interface Props {
  open: Open;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<DataType>();

  const api = ApiHook.Inhouse.Discount.useCreate();
  const cmd = useCallback(
    async (values: DataType) => {
      if (!props.open) {
        return;
      }

      await api.mutateAsync({
        data: {
          ...values,
          discountRateType: props.open,
        },
      });
      form.resetFields();
      props.onClose(false);
    },
    [api, form, props]
  );

  return (
    <Popup.Template.Property
      title={`${props.open === "PURCHASE" ? "매입" : "매출"} 할인율 추가`}
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4">
        <FormCreate
          form={form}
          onFinish={async (values) => await cmd(values)}
        />
      </div>
    </Popup.Template.Property>
  );
}
