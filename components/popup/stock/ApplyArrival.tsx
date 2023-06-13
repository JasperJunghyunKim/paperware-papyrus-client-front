import { Api } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Form } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";

type ValuesType = Omit<Api.StockArrivalApplyRequest, "warehouseId">;
type FormType = { warehouseId: number };
type Open = ValuesType | false;

export interface Props {
  open: Open;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<FormType>();

  const api = ApiHook.Stock.StockArrival.useApply();
  const cmd = useCallback(
    async (values: FormType) => {
      if (!props.open) {
        return;
      }

      if (
        !(await Util.confirm(
          "선택한 창고로 재고 입고 처리를 진행하시겠습니까?"
        ))
      ) {
        return;
      }

      await api.mutateAsync({
        body: {
          ...props.open,
          warehouseId: values.warehouseId,
        },
      });
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
    <Popup.Template.Property
      title="재고 입고"
      {...props}
      open={!!props.open}
      height="220px"
    >
      <div className="flex-1 p-4">
        <Form form={form} onFinish={cmd} layout="vertical">
          <Form.Item
            name="warehouseId"
            label="창고"
            rules={[{ required: true }]}
          >
            <FormControl.SelectWarehouse />
          </Form.Item>
          <Form.Item className="flex justify-end">
            <Button.Preset.Submit label="재고 입고" />
          </Form.Item>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}
