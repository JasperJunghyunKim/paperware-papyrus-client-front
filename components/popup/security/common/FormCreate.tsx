import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input } from "antd";

interface Props {
  form: FormInstance<Api.SecurityCreateRequest>;
  onFinish: (values: Api.SecurityCreateRequest) => void;
}

export default function Component(props: Props) {
  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      <Form.Item
        name="securityType"
        label={"유가증권 유형"}
        rules={[{ required: true }]}
      >
        <FormControl.SelectSecurityType />
      </Form.Item>
      <Form.Item
        name="securitySerial"
        label={"유가증권 번호"}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="securityAmount"
        label="유가증권 금액"
        rules={[{ required: true }]}
      >
        <FormControl.Number />
      </Form.Item>
      <Form.Item
        name="drawedDate"
        label={"발행일"}
      >
        <FormControl.DatePicker />
      </Form.Item>
      <Form.Item
        name="drawedBank"
        label={"발행은행"}
      >
        <FormControl.SelectBank />
      </Form.Item>
      <Form.Item
        name="drawedBankBranch"
        label={"발행 지점명"}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="drawedRegion"
        label={"발행지"}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="drawer"
        label={"발행인"}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="maturedDate"
        label={"만기일"}
      >
        <FormControl.DatePicker />
      </Form.Item>
      <Form.Item
        name="payingBank"
        label={"지급은행"}
      >
        <FormControl.SelectBank />
      </Form.Item>
      <Form.Item
        name="payingBankBranch"
        label={"지급 지점명"}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="payer"
        label={"지급인"}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="memo"
        label={"메모"}
      >
        <Input />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button.Preset.Submit label="유가증권 발행" />
      </Form.Item>
    </Form>
  );
}
