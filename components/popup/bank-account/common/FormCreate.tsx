import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input } from "antd";

interface Props {
  form: FormInstance<Api.BankAccountCreateRequest>;
  onFinish: (values: Api.BankAccountCreateRequest) => void;
}

export default function Component(props: Props) {
  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      <Form.Item
        name="bankComapny"
        label={"은행"}
        rules={[{ required: true }]}
      >
        <FormControl.SelectBank />
      </Form.Item>
      <Form.Item
        name="accountName"
        label={"계좌"}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="accountType"
        label="계좌 종류"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="accountNumber"
        label={"계좌 번호"}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="accountHolder"
        label={"계좌 소유자"}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button.Preset.Submit label="계좌 추가" />
      </Form.Item>
    </Form>
  );
}
