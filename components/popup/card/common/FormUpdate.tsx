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
        <FormControl.SelectCard isDisabled={true} />
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
    </Form>
  );
}
