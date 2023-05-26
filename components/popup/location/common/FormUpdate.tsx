import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input, Radio, Switch } from "antd";

interface Props {
  form: FormInstance<Api.LocationUpdateRequest>;
  onFinish: (values: Api.LocationUpdateRequest) => void;
  edit: boolean;
  onEditChange: (edit: boolean) => void;
}

export default function Component(props: Props) {
  return (
    <Form
      form={props.form}
      onFinish={(values) => {
        props.onFinish(values);
      }}
      layout="vertical"
      disabled={!props.edit}
      rootClassName="flex flex-col gap-y-4"
    >
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
      <Form.Item name="name" label="도착지 이름" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="isPublic"
        label="자사 도착지 여부"
        rules={[{ required: true }]}
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
    </Form>
  );
}
