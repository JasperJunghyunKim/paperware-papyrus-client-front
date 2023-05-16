import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input } from "antd";

interface Props {
  form: FormInstance<Api.CardUpdateRequest>;
  onFinish: (values: Api.CardUpdateRequest) => void;
  edit: boolean;
  onEditChange: (edit: boolean) => void;
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
      >
        <FormControl.SelectBank isDisabled={true} />
      </Form.Item>
      <Form.Item
        name="cardNumber"
        label="카드 번호"
      >
        <Input disabled />
      </Form.Item>
      <Form.Item
        name="cardHolder"
        label={"소유자명"}
      >
        <Input disabled />
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button.Preset.Submit label="카드 수정" />
      </Form.Item>
    </Form>
  );
}
