import { Api } from "@/@shared";
import { ApiHook } from "@/common";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input, Switch } from "antd";

interface Props {
  form: FormInstance<Api.WarehouseCreateRequest>;
  onFinish: (values: Api.WarehouseCreateRequest) => void;
}

export default function Component(props: Props) {
  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      <Form.Item name="name" label="창고 이름" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="isPublic"
        label="공개 여부"
        valuePropName="checked"
        rules={[{ required: true }]}
        initialValue={false}
      >
        <Switch />
      </Form.Item>
      <Form.Item name="address" label="주소" rules={[{ required: true }]}>
        <FormControl.Address />
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button.Preset.Submit label="창고 추가" />
      </Form.Item>
    </Form>
  );
}
