import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input } from "antd";

interface Props {
  form: FormInstance<Api.BankAccountUpdateRequest>;
  onFinish: (values: Api.BankAccountUpdateRequest) => void;
  edit: boolean;
  onEditChange: (edit: boolean) => void;
}

export default function Component(props: Props) {
  return (
    <Form form={props.form}
      onFinish={(values) => {
        props.onFinish(values);
      }}
      layout="vertical"
      disabled={!props.edit}
      rootClassName="flex flex-col gap-y-4">
      <div className="flex flex-row justify-end gap-x-2">
        <Button.Preset.Edit
          label="내용 수정"
          onClick={() => props.onEditChange(true)}
          hidden={props.edit}
        />
        <Button.Default
          label="수정 취소"
          onClick={() => props.onEditChange(false)}
          hidden={!props.edit}
        />
        <Button.Preset.Submit label="내용 저장" hidden={!props.edit} />
      </div>

      <div className="h-px bg-gray-200" />

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
    </Form>
  );
}
