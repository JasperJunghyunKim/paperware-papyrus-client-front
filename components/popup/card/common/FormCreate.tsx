import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input } from "antd";

interface Props {
  form: FormInstance<Api.CardCreateRequest>;
  onFinish: (values: Api.CardCreateRequest) => void;
}

export default function Component(props: Props) {
  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      <Form.Item
        name="cardName"
        label={"카드 이름"}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="cardCompany"
        label={"카드 회사"}
        rules={[{ required: true }]}
      >
        <FormControl.SelectCard />
      </Form.Item>
      <Form.Item
        name="cardNumber"
        label="카드 번호"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="cardHolder"
        label={"소유자명"}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button.Preset.Submit label="카드 추가" />
      </Form.Item>
    </Form>
  );
}
