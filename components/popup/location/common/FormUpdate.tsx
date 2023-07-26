import { Api } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Alert, Form, FormInstance, Input, Radio } from "antd";
import { useWatch } from "antd/lib/form/Form";

interface Props {
  form: FormInstance<Api.LocationUpdateRequest>;
  onFinish: (values: Api.LocationUpdateRequest) => void;
  edit: boolean;
  onEditChange: (edit: boolean) => void;
}

export default function Component(props: Props) {
  const isPublic = useWatch("isPublic", props.form);

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
              value: false,
            },
            {
              label: "기타 도착지",
              value: true,
            },
          ]}
        />
      </Form.Item>
      {isPublic !== undefined && isPublic !== null && (
        <Alert
          message={
            isPublic
              ? "자사 사업장이 아닌 도착지를 의미합니다. 기타 도착지 목록은 외부에 공개되지 않습니다."
              : "자사 사업장으로 관리되는 도착지를 의미합니다. 자사 도착지 목록은 거래처가 직접 선택할 수 있도록 공개됩니다."
          }
          type="info"
          showIcon
          className="mb-4"
        />
      )}
      <Form.Item name="address" label="주소" rules={[{ required: true }]}>
        <FormControl.Address />
      </Form.Item>
      <Form.Item name="phoneNo" label="전화번호">
        <Input maxLength={20} />
      </Form.Item>
    </Form>
  );
}
