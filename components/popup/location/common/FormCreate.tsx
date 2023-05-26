import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input, Radio, Switch } from "antd";

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
      <Form.Item
        name="isPublic"
        label="자사 도착지 여부"
        rules={[{ required: true }]}
        initialValue={true}
      >
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          options={[
            {
              label: "자사 도착지",
              value: true,
            },
            {
              label: "기타 도착지",
              value: false,
            },
          ]}
        />
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
