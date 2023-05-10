import { Api } from "@/@shared";
import { Button } from "@/components";
import { Form, FormInstance, Input } from "antd";

interface Props {
  form: FormInstance<Api.VirtualCompanyCreateRequest>;
  onFinish: (values: Api.VirtualCompanyCreateRequest) => void;
}

export default function Component(props: Props) {
  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      <Form.Item
        name="businessName"
        label="상호명"
        rules={[{ required: true }]}
      >
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item name="phoneNo" label="대표 전화">
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item name="faxNo" label="팩스">
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item name="email" label="이메일">
        <Input maxLength={20} />
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button.Preset.Submit label="가상 거래처 추가" />
      </Form.Item>
    </Form>
  );
}
