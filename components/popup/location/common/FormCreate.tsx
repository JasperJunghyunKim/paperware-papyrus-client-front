import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input, Switch } from "antd";

interface Props {
  form: FormInstance<Api.LocationCreateRequest>;
  onFinish: (values: Api.LocationCreateRequest) => void;
}

export default function Component(props: Props) {
  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      <Form.Item name="name" label="도착지 이름" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="code" label="도착지 코드">
        <Input />
      </Form.Item>
      <Form.Item
        name="isPublic"
        label="자사 도착지 여부"
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
        <Button.Preset.Submit label="도착지 추가" />
      </Form.Item>
    </Form>
  );
}
